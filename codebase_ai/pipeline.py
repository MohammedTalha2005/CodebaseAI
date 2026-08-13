from pathlib import Path
from typing import List, Dict, Any, Callable, Optional
from codebase_ai.scanner.repo_scanner import RepoScanner, CodeFile
from codebase_ai.parser.python_parser import PythonParser
from codebase_ai.parser.generic_parser import GenericParser
from codebase_ai.parser.base_parser import CodeUnit
from codebase_ai.chunker.code_chunker import CodeChunker, ProcessedChunk
from codebase_ai.metadata.metadata_extractor import MetadataExtractor
from codebase_ai.embeddings.embedder import CodeEmbedder
from codebase_ai.vectorstore.pinecone_store import PineconeStore, QueryResult
from codebase_ai.llm.rag_engine import RAGEngine, RAGResponse
from codebase_ai.graph.dependency_graph import DependencyGraphBuilder, CodeGraph


# Type alias for the progress callback.
# Each call receives a dict with at minimum: step, message, pct (0-100).
ProgressCallback = Callable[[Dict[str, Any]], None]


class CodebasePipeline:
    """End-to-end ingestion, semantic search, RAG Q&A, and dependency graph pipeline."""

    def __init__(self):
        self.scanner = RepoScanner()
        self.python_parser = PythonParser()
        self.generic_parser = GenericParser()
        self.chunker = CodeChunker()
        self.embedder = CodeEmbedder()
        self.vector_store = PineconeStore()
        self.rag_engine = RAGEngine()
        self.graph_builder = DependencyGraphBuilder(self.scanner)
        self.current_repo_dir: str | Path = "./"

    def ingest_repository(
        self,
        repo_dir: str | Path,
        clear_existing: bool = False,
        progress_callback: Optional[ProgressCallback] = None,
    ) -> Dict[str, Any]:
        self.current_repo_dir = repo_dir
        repo_path = self.scanner.resolve_repo_path(repo_dir)

        def emit(step: str, message: str, pct: int = 0, **extra):
            event = {"step": step, "message": message, "pct": pct, **extra}
            print(f"[INGEST] {message}", flush=True)
            if progress_callback:
                progress_callback(event)

        emit("scanning", "Scanning repository…", pct=2)

        if clear_existing:
            self.vector_store.clear_index()

        # Step 1: Scan files
        code_files: List[CodeFile] = self.scanner.scan_directory(repo_path)
        if not code_files:
            raise ValueError(f"No indexable source code files found in repository '{repo_dir}'.")

        total_files = len(code_files)
        emit("scanning", f"Found {total_files} source files.", pct=5)

        SKIP_EMBEDDING_EXTENSIONS = {
            ".csv", ".tsv", ".pkl", ".pickle", ".parquet", ".bin", ".dat",
            ".onnx", ".pt", ".pth", ".h5", ".hdf5", ".model", ".tflite", ".pb"
        }

        # Step 2: Parse into structural CodeUnits
        all_units: List[CodeUnit] = []
        for i, cf in enumerate(code_files, 1):
            if i % max(1, total_files // 10) == 0 or i == total_files:
                pct = 5 + int((i / total_files) * 25)  # 5% → 30%
                emit("parsing", f"Parsing file {i} of {total_files}: {cf.file_path}", pct=pct)

            # Skip massive data files and binary pickle dumps
            if cf.extension.lower() in SKIP_EMBEDDING_EXTENSIONS or len(cf.content) > 500_000:
                first_lines = "\n".join(cf.content.splitlines()[:10])
                all_units.append(
                    CodeUnit(
                        file_path=cf.file_path,
                        unit_name=f"{cf.file_path}:summary",
                        unit_type="file_summary",
                        start_line=1,
                        end_line=min(10, max(1, len(cf.content.splitlines()))),
                        code_text=first_lines,
                        language=cf.language,
                    )
                )
                continue

            if cf.language == "python":
                units = self.python_parser.parse(cf)
            else:
                units = self.generic_parser.parse(cf)
            all_units.extend(units)

        emit("parsing", f"Parsed {len(all_units)} code units from {total_files} files.", pct=30)

        # Step 3: Chunk & build headers
        processed_chunks: List[ProcessedChunk] = self.chunker.process_units(all_units)
        if not processed_chunks:
            return {"files_scanned": total_files, "units_parsed": 0, "chunks_upserted": 0}

        total_chunks = len(processed_chunks)
        emit("embedding", f"Generating embeddings for {total_chunks} chunks…", pct=32)

        # Step 4 & 5: Enrich Metadata & Generate Embeddings in batches with progress
        chunk_ids = []
        formatted_texts = []
        metadatas = []
        repo_name = repo_path.name or "repository"

        for p_chunk in processed_chunks:
            chunk_ids.append(p_chunk.chunk_id)
            formatted_texts.append(p_chunk.formatted_text)
            meta = MetadataExtractor.prepare_pinecone_metadata(p_chunk)
            meta["repo_name"] = repo_name
            metadatas.append(meta)

        # Emit embedding progress in batches so the user sees it advance
        EMBED_BATCH = self.embedder.batch_size
        all_vectors: List[List[float]] = []
        for batch_start in range(0, total_chunks, EMBED_BATCH):
            batch_texts = formatted_texts[batch_start: batch_start + EMBED_BATCH]
            batch_vectors = self.embedder.encode_batch(batch_texts)
            all_vectors.extend(batch_vectors)

            done = min(batch_start + EMBED_BATCH, total_chunks)
            pct = 32 + int((done / total_chunks) * 50)  # 32% → 82%
            emit(
                "embedding",
                f"Embedding chunks {done} of {total_chunks}…",
                pct=pct,
            )

        emit("upserting", f"Upserting {total_chunks} vectors to Pinecone…", pct=84)

        # Step 6: Upsert to Pinecone Vector Database
        upserted_count = self.vector_store.upsert_chunks(
            chunk_ids=chunk_ids,
            vectors=all_vectors,
            metadatas=metadatas,
        )

        stats = {
            "files_scanned": total_files,
            "units_parsed": len(all_units),
            "chunks_upserted": upserted_count,
        }
        emit(
            "done",
            f"Indexing complete — {total_files} files, {upserted_count} vectors.",
            pct=100,
            stats=stats,
        )
        return stats

    def search_codebase(self, query: str, top_k: int = 5) -> List[QueryResult]:
        query_vec = self.embedder.encode_text(query)
        repo_path = self.scanner.resolve_repo_path(self.current_repo_dir)
        repo_name = repo_path.name or "repository"

        # Filter queries strictly to the active repository
        filter_dict = {"repo_name": {"$eq": repo_name}} if repo_name else None
        results = self.vector_store.query(query_vector=query_vec, top_k=top_k, metadata_filter=filter_dict)

        # Additional safety check: filter out any chunks with non-matching repo_name if present
        return [r for r in results if r.metadata.get("repo_name") in (None, repo_name)]

    def ask_question(self, query: str, top_k: int = 5) -> RAGResponse:
        search_results = self.search_codebase(query=query, top_k=top_k)
        return self.rag_engine.generate_answer(query=query, search_results=search_results)

    def get_dependency_graph(self, repo_dir: str | Path | None = None) -> Dict[str, Any]:
        target_dir = repo_dir if repo_dir else self.current_repo_dir
        repo_path = self.scanner.resolve_repo_path(target_dir)
        graph: CodeGraph = self.graph_builder.build_graph(repo_path)
        return graph.to_dict()
