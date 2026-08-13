import asyncio
import os
import json
import threading
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional, AsyncGenerator
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from codebase_ai.pipeline import CodebasePipeline


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Capture the running event loop so background threads can post into async queues."""
    global _event_loop
    _event_loop = asyncio.get_running_loop()
    yield


app = FastAPI(
    title="Codebase AI Engineer API",
    description="REST API server for repository ingestion, RAG code Q&A, and dependency visualization.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = CodebasePipeline()
STATE_FILE = Path("index_state.json")

# ---------------------------------------------------------------------------
# Ingest progress state
# ---------------------------------------------------------------------------
# We use asyncio.Queue for per-client SSE queues so the async generator can be
# cancelled instantly by uvicorn on shutdown (no thread-pool blocking).
# The background ingest thread posts events via loop.call_soon_threadsafe.

_ingest_lock = threading.Lock()
_client_queues: list[asyncio.Queue] = []
_ingest_running = threading.Event()   # set while an ingest is in progress
_last_progress: dict = {}             # last event, for late-joining clients
_event_loop: Optional[asyncio.AbstractEventLoop] = None  # captured at startup


def _broadcast(event: dict):
    """Push a progress event to all connected SSE clients (called from background thread)."""
    global _last_progress
    _last_progress = event
    loop = _event_loop
    if loop is None or not loop.is_running():
        return
    with _ingest_lock:
        for q in list(_client_queues):
            try:
                loop.call_soon_threadsafe(q.put_nowait, event)
            except Exception:
                pass  # queue full or loop closed — skip


def _register_client() -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue(maxsize=256)
    # Send the last known event immediately so a late-joiner isn't blank
    if _last_progress:
        q.put_nowait(_last_progress)
    with _ingest_lock:
        _client_queues.append(q)
    return q


def _unregister_client(q: asyncio.Queue):
    with _ingest_lock:
        try:
            _client_queues.remove(q)
        except ValueError:
            pass


async def _sse_generator(q: asyncio.Queue) -> AsyncGenerator[str, None]:
    """Async generator — yields SSE strings; cancels cleanly on uvicorn shutdown."""
    try:
        while True:
            try:
                event = await asyncio.wait_for(q.get(), timeout=25)
            except asyncio.TimeoutError:
                # Keep-alive so the browser doesn't close the connection
                yield ": keepalive\n\n"
                continue
            except asyncio.CancelledError:
                # Uvicorn is shutting down — exit cleanly without traceback
                break

            yield f"data: {json.dumps(event)}\n\n"

            if event.get("step") in ("done", "error"):
                break
    finally:
        _unregister_client(q)


# ---------------------------------------------------------------------------
# Persistence helpers
# ---------------------------------------------------------------------------

def load_index_state():
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("repo_path"):
                    pipeline.current_repo_dir = data["repo_path"]
                return data
        except Exception:
            pass
    return {
        "latest_stats": {"files_scanned": 0, "units_parsed": 0, "chunks_upserted": 0},
        "repo_name": "codebase-ai",
        "repo_path": "./"
    }


def save_index_state(stats, repo_name, repo_path):
    state = {
        "latest_stats": stats,
        "repo_name": repo_name,
        "repo_path": str(repo_path)
    }
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
    except Exception:
        pass


_initial_state = load_index_state()
latest_stats = _initial_state.get("latest_stats", {"files_scanned": 0, "units_parsed": 0, "chunks_upserted": 0})
current_repo_name = _initial_state.get("repo_name", "codebase-ai")


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class IngestRequest(BaseModel):
    path: str = "./"
    clear: bool = True


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class AskRequest(BaseModel):
    query: str
    top_k: int = 5


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

from dotenv import load_dotenv


@app.get("/api/status")
def get_status():
    load_dotenv(override=True)
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    provider = "gemini" if gemini_key else ("groq" if groq_key else ("openai" if openai_key else "local_synthesis"))
    return {
        "status": "ready",
        "latest_stats": latest_stats,
        "llm_provider": provider,
        "pinecone_index": os.getenv("PINECONE_INDEX_NAME", "codebase-ai"),
        "repo_name": current_repo_name,
        "indexed": (latest_stats.get("chunks_upserted", 0) > 0),
        "ingest_running": _ingest_running.is_set(),
    }


@app.post("/api/ingest")
def ingest_repo(req: IngestRequest):
    global latest_stats, current_repo_name

    if _ingest_running.is_set():
        raise HTTPException(status_code=409, detail="An ingest is already in progress. Please wait.")

    raw_path = str(req.path).strip()
    is_url = (
        raw_path.startswith("http://")
        or raw_path.startswith("https://")
        or raw_path.startswith("git@")
        or raw_path.endswith(".git")
    )

    # Enforce GitHub-only URLs
    if is_url:
        if "github.com/" not in raw_path:
            raise HTTPException(
                status_code=400,
                detail="Only GitHub repository URLs are supported (e.g. https://github.com/owner/repo). Other URLs are not allowed.",
            )

    if not is_url:
        raise HTTPException(
            status_code=400,
            detail="Only GitHub repository URLs are supported. Local folder paths are not allowed.",
        )

    # Resolve path early so we can return errors synchronously before going async
    try:
        resolved_path = pipeline.scanner.resolve_repo_path(req.path)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    def _run_ingest():
        global latest_stats, current_repo_name
        _ingest_running.set()
        try:
            stats = pipeline.ingest_repository(
                repo_dir=req.path,
                clear_existing=req.clear,
                progress_callback=_broadcast,
            )
            if stats.get("files_scanned", 0) == 0:
                _broadcast({
                    "step": "error",
                    "message": f"No indexable source code files found in repository '{req.path}'.",
                    "pct": 0,
                })
                return

            latest_stats = stats
            repo_name = resolved_path.name or "repository"
            current_repo_name = repo_name
            save_index_state(stats, repo_name, req.path)
            # "done" event is already emitted by pipeline, but we re-emit here
            # with the final stats so the frontend can update counts.
            _broadcast({
                "step": "done",
                "message": f"Indexing complete — {stats['files_scanned']} files, {stats['chunks_upserted']} vectors.",
                "pct": 100,
                "stats": stats,
                "repo_name": repo_name,
            })
        except Exception as e:
            _broadcast({"step": "error", "message": str(e), "pct": 0})
        finally:
            _ingest_running.clear()

    thread = threading.Thread(target=_run_ingest, daemon=True, name="ingest-worker")
    thread.start()

    return {"success": True, "message": "Ingest started. Subscribe to /api/ingest/progress for live updates."}


@app.get("/api/ingest/progress")
async def ingest_progress():
    """Server-Sent Events stream for real-time ingestion progress."""
    # If nothing is running and no prior progress, respond immediately
    if not _ingest_running.is_set() and not _last_progress:
        async def _idle() -> AsyncGenerator[str, None]:
            yield 'data: {"step": "idle", "message": "No ingest in progress.", "pct": 0}\n\n'
        return StreamingResponse(_idle(), media_type="text/event-stream")

    client_q = _register_client()
    return StreamingResponse(
        _sse_generator(client_q),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/search")
def search_codebase(req: SearchRequest):
    try:
        results = pipeline.search_codebase(query=req.query, top_k=req.top_k)
        return {
            "query": req.query,
            "results": [
                {
                    "chunk_id": r.chunk_id,
                    "score": r.score,
                    "file_path": r.metadata.get("file_path"),
                    "unit_name": r.metadata.get("unit_name"),
                    "unit_type": r.metadata.get("unit_type"),
                    "start_line": int(r.metadata.get("start_line", 1)),
                    "end_line": int(r.metadata.get("end_line", 1)),
                    "language": r.metadata.get("language"),
                    "text": r.metadata.get("text"),
                }
                for r in results
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ask")
def ask_codebase(req: AskRequest):
    try:
        rag_res = pipeline.ask_question(query=req.query, top_k=req.top_k)
        return {
            "query": rag_res.query,
            "answer": rag_res.answer,
            "citations": [
                {
                    "file_path": c.file_path,
                    "start_line": c.start_line,
                    "end_line": c.end_line,
                    "unit_name": c.unit_name,
                    "unit_type": c.unit_type,
                    "score": c.score,
                    "code_snippet": c.code_snippet,
                }
                for c in rag_res.citations
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def build_tree_from_code_files(code_files, root_name: str):
    root = {
        "name": root_name,
        "path": "",
        "type": "folder",
        "children": []
    }
    dir_nodes = {"": root}

    for cf in code_files:
        parts = cf.file_path.split("/")
        current_path = ""
        for part in parts[:-1]:
            parent_path = current_path
            current_path = f"{current_path}/{part}" if current_path else part
            if current_path not in dir_nodes:
                new_folder = {
                    "name": part,
                    "path": current_path,
                    "type": "folder",
                    "children": []
                }
                dir_nodes[current_path] = new_folder
                dir_nodes[parent_path]["children"].append(new_folder)

        parent_path = "/".join(parts[:-1])
        file_node = {
            "name": parts[-1],
            "path": cf.file_path,
            "type": "file",
            "language": cf.language,
            "lines": len(cf.content.splitlines()),
            "size": len(cf.content.encode("utf-8")),
        }
        dir_nodes[parent_path]["children"].append(file_node)

    def sort_tree(node):
        if "children" in node:
            node["children"].sort(key=lambda x: (0 if x["type"] == "folder" else 1, x["name"].lower()))
            for child in node["children"]:
                sort_tree(child)

    sort_tree(root)
    return root


@app.get("/api/tree")
def get_repo_tree(path: Optional[str] = None):
    try:
        target_dir = path if path else pipeline.current_repo_dir
        repo_path = pipeline.scanner.resolve_repo_path(target_dir)
        code_files = pipeline.scanner.scan_directory(repo_path)
        root_name = repo_path.name or "repository"
        return build_tree_from_code_files(code_files, root_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/graph")
def get_graph(path: Optional[str] = None):
    try:
        return pipeline.get_dependency_graph(repo_dir=path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/file")
def get_file_content(path: str = Query(..., description="Relative path to file")):
    repo_dir = pipeline.scanner.resolve_repo_path(pipeline.current_repo_dir)
    file_path = (repo_dir / path).resolve()

    if not file_path.exists() or not file_path.is_file():
        file_path = Path(path).resolve()

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        return {"file_path": path, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_excludes=["cloned_repos/*", "cloned_repos", "index_state.json"],
    )
