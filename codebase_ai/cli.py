import argparse
import sys
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from rich.console import Console
from rich.panel import Panel
from rich.syntax import Syntax
from rich.table import Table
from rich.markdown import Markdown
from codebase_ai.pipeline import CodebasePipeline

console = Console()


def handle_ingest(args):
    console.print(f"[bold cyan]Scanning repository at:[/bold cyan] {args.path}")
    pipeline = CodebasePipeline()
    stats = pipeline.ingest_repository(repo_dir=args.path, clear_existing=args.clear)
    
    console.print(
        Panel(
            f"[bold green]Ingestion Complete![/bold green]\n\n"
            f"[+] Files Scanned: [bold yellow]{stats['files_scanned']}[/bold yellow]\n"
            f"[+] Code Units Parsed: [bold yellow]{stats['units_parsed']}[/bold yellow]\n"
            f"[+] Chunks Index Upserted: [bold yellow]{stats['chunks_upserted']}[/bold yellow]",
            title="Ingestion Summary",
            border_style="green",
        )
    )


def handle_search(args):
    console.print(f"[bold cyan]Searching codebase for:[/bold cyan] [italic]\"{args.query}\"[/italic]\n")
    pipeline = CodebasePipeline()
    results = pipeline.search_codebase(query=args.query, top_k=args.top_k)

    if not results:
        console.print("[bold red]No matching code results found.[/bold red]")
        return

    table = Table(title=f"Top {len(results)} Search Results", border_style="dim")
    table.add_column("Rank", justify="center", style="bold yellow")
    table.add_column("Score", justify="center", style="bold magenta")
    table.add_column("Location / Identifier", style="bold cyan")
    table.add_column("Type", style="green")

    for i, res in enumerate(results, 1):
        meta = res.metadata
        start_l = int(meta.get("start_line", 1))
        end_l = int(meta.get("end_line", 1))
        unit_name = meta.get("unit_name", "")
        file_path = meta.get("file_path", "unknown")
        unit_type = meta.get("unit_type", "unknown")
        location = f"{file_path}:{start_l}-{end_l} ({unit_name})"
        table.add_row(str(i), f"{res.score:.4f}", location, unit_type)

    console.print(table)
    console.print("\n" + "=" * 60 + "\n")

    for i, res in enumerate(results, 1):
        meta = res.metadata
        file_path = meta.get("file_path", "unknown")
        start_l = int(meta.get("start_line", 1))
        end_l = int(meta.get("end_line", 1))
        unit_name = meta.get("unit_name", "")
        lang = meta.get("language", "python")
        code_text = meta.get("text", "")

        syntax = Syntax(code_text, lang, theme="monokai", line_numbers=True, start_line=start_l)
        panel_title = f"#{i} Match (Score: {res.score:.4f}) - {file_path}:{start_l}-{end_l} [{unit_name}]"
        console.print(Panel(syntax, title=panel_title, border_style="cyan"))
        console.print()


def handle_ask(args):
    console.print(f"[bold cyan]AI Codebase Reasoning for:[/bold cyan] [italic]\"{args.query}\"[/italic]\n")
    pipeline = CodebasePipeline()
    rag_res = pipeline.ask_question(query=args.query, top_k=args.top_k)

    console.print(Panel(Markdown(rag_res.answer), title="AI Software Engineer Explanation", border_style="green"))
    console.print("\n[bold cyan]Citations & Referenced Snippets:[/bold cyan]")

    for idx, c in enumerate(rag_res.citations, 1):
        syntax = Syntax(c.code_snippet, "python", theme="monokai", line_numbers=True, start_line=c.start_line)
        title = f"[{idx}] {c.file_path}:{c.start_line}-{c.end_line} ({c.unit_name})"
        console.print(Panel(syntax, title=title, border_style="dim"))


def handle_server(args):
    import uvicorn
    console.print(f"[bold green]Starting Codebase AI Engineer API server on http://{args.host}:{args.port}...[/bold green]")
    uvicorn.run("server:app", host=args.host, port=args.port, reload=True)


def main():
    parser = argparse.ArgumentParser(description="Codebase AI Engineer — Repository Intelligence CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Ingest command
    ingest_parser = subparsers.add_parser("ingest", help="Scan and index repository code")
    ingest_parser.add_argument("--path", "-p", default="./", help="Target repository directory path")
    ingest_parser.add_argument("--clear", "-c", action="store_true", help="Clear Pinecone index before ingestion")

    # Search command
    search_parser = subparsers.add_parser("search", help="Semantic search over repository code")
    search_parser.add_argument("query", type=str, help="Natural language query")
    search_parser.add_argument("--top-k", "-k", type=int, default=5, help="Number of results to return")

    # Ask command
    ask_parser = subparsers.add_parser("ask", help="Ask AI question about codebase with RAG reasoning")
    ask_parser.add_argument("query", type=str, help="Natural language question")
    ask_parser.add_argument("--top-k", "-k", type=int, default=5, help="Number of results to retrieve")

    # Server command
    server_parser = subparsers.add_parser("server", help="Launch FastAPI REST server")
    server_parser.add_argument("--host", default="127.0.0.1", help="Host address")
    server_parser.add_argument("--port", type=int, default=8000, help="Port number")

    args = parser.parse_args()

    if args.command == "ingest":
        handle_ingest(args)
    elif args.command == "search":
        handle_search(args)
    elif args.command == "ask":
        handle_ask(args)
    elif args.command == "server":
        handle_server(args)


if __name__ == "__main__":
    main()
