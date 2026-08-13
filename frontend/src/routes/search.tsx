import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, Command, FileCode2, ScanSearch, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiError, api, languageFromPath, type Citation } from "@/lib/api";
import { useAppState } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Semantic Code Search — Codebase AI Engineer" },
      {
        name: "description",
        content:
          "Find relevant code using meaning, not just keywords. Vector search across every indexed code unit in your repository.",
      },
      { property: "og:title", content: "Semantic Code Search — Codebase AI Engineer" },
      {
        property: "og:description",
        content: "Vector-based code search across your indexed repository.",
      },
    ],
  }),
  component: SemanticSearch,
});

function relevance(score?: number | null): number | null {
  if (score === null || score === undefined || Number.isNaN(score)) return null;
  const pct = score <= 1 ? score * 100 : score;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

function ResultCard({ citation }: { citation: Citation }) {
  const { openFile } = useAppState();
  const segments = citation.file_path.split(/[\\/]/).filter(Boolean);
  const fileName = segments[segments.length - 1] ?? citation.file_path;
  const dir = segments.slice(0, -1).join("/");
  const rel = relevance(citation.score);

  return (
    <article className="panel panel-hover min-w-0 p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <FileCode2 className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 truncate font-mono text-xs">
              {dir ? <span className="text-muted-foreground">{dir}/</span> : null}
              <span className="text-foreground">{fileName}</span>
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span className="text-foreground/90">
              {citation.unit_name ? citation.unit_name : "module scope"}
            </span>
            {citation.start_line != null && (
              <span className="text-primary/90">
                L{citation.start_line}–{citation.end_line ?? citation.start_line}
              </span>
            )}
            <span className="opacity-70">{languageFromPath(citation.file_path)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {rel !== null && (
            <div className="w-24">
              <div className="mb-1 text-right font-mono text-[11px] text-foreground">
                {rel}% relevance
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${rel}%` }} />
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() =>
              openFile({
                filePath: citation.file_path,
                startLine: citation.start_line ?? null,
                endLine: citation.end_line ?? null,
              })
            }
          >
            Open Source
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {citation.snippet ? (
        <pre className="mt-3 max-h-32 overflow-auto rounded-md border border-border bg-background/60 p-3 font-mono text-[11.5px] leading-relaxed text-foreground/85">
          {citation.snippet}
        </pre>
      ) : null}
    </article>
  );
}

function SemanticSearch() {
  const [term, setTerm] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const searchMutation = useMutation({
    mutationFn: (query: string) => api.ask(query, 8),
    onSuccess: (data) => {
      toast.success("Search completed", {
        description: `${data.citations?.length ?? 0} matching code units retrieved.`,
      });
    },
    onError: (error) => {
      const apiErr = error instanceof ApiError ? error : null;
      toast.error(apiErr?.friendly ?? "Search failed", {
        description: apiErr?.hint ?? "The search request could not be completed.",
      });
    },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q || searchMutation.isPending) return;
    setSubmitted(q);
    searchMutation.mutate(q);
  };

  const results = searchMutation.data?.citations ?? [];
  const apiErr = searchMutation.error instanceof ApiError ? searchMutation.error : null;

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 py-6 sm:px-6 lg:py-8">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Semantic Code Search
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find relevant code using meaning, not just keywords.
        </p>
      </div>

      <form onSubmit={submit} className="panel mt-5 flex items-center gap-2 p-2">
        <Search className="ml-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search your codebase..."
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <span className="hidden shrink-0 items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
          <Command className="h-3 w-3" />K
        </span>
        <Button type="submit" size="sm" disabled={searchMutation.isPending || !term.trim()}>
          {searchMutation.isPending ? "Searching…" : "Search"}
        </Button>
      </form>

      <div className="mt-6">
        {searchMutation.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="panel space-y-3 p-4">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : apiErr ? (
          <div className="panel flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm font-medium text-foreground">{apiErr.friendly}</p>
            <p className="max-w-md text-xs text-muted-foreground">{apiErr.hint}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => submitted && searchMutation.mutate(submitted)}
            >
              Retry
            </Button>
          </div>
        ) : submitted === null ? (
          <div className="panel grid-backdrop flex flex-col items-center gap-2 p-10 text-center">
            <ScanSearch className="h-6 w-6 text-primary/80" />
            <p className="text-sm font-medium text-foreground">Search across every indexed unit</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Vector retrieval ranks functions, classes and modules by semantic similarity to your
              query.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="panel flex flex-col items-center gap-2 p-10 text-center">
            <p className="text-sm font-medium text-foreground">No matching code units</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Try a broader description, or re-index the repository if it has changed.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-xs text-muted-foreground">
                {results.length} results for{" "}
                <span className="font-mono text-foreground">“{submitted}”</span>
              </p>
            </div>
            <div className="space-y-3">
              {results.map((cit, i) => (
                <ResultCard key={`${cit.file_path}-${i}`} citation={cit} />
              ))}
            </div>

            {searchMutation.data?.answer ? (
              <div className="panel mt-4 p-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Retrieval summary
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {searchMutation.data.answer.slice(0, 420)}
                  {searchMutation.data.answer.length > 420 ? "…" : ""}
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
