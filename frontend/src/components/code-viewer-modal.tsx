import { useQuery } from "@tanstack/react-query";
import { Check, Copy, ExternalLink, FileCode2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiError, api, languageFromPath } from "@/lib/api";
import { useAppState } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CodeViewerModal() {
  const { viewingFile, closeFile } = useAppState();
  const filePath = viewingFile?.filePath;
  const startLine = viewingFile?.startLine ?? null;
  const endLine = viewingFile?.endLine ?? null;
  const [copied, setCopied] = useState(false);
  const highlightRef = useRef<HTMLTableRowElement | null>(null);

  const query = useQuery({
    queryKey: ["file", filePath],
    queryFn: () => api.file(filePath as string),
    enabled: Boolean(filePath),
    retry: false,
  });

  const lines = useMemo(() => (query.data?.content ?? "").split("\n"), [query.data?.content]);

  useEffect(() => {
    if (!query.data) return;
    const timer = setTimeout(
      () => highlightRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }),
      80,
    );
    return () => clearTimeout(timer);
  }, [query.data]);

  useEffect(() => {
    if (!filePath) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filePath, closeFile]);

  if (!filePath) return null;

  const segments = filePath.split(/[\\/]/).filter(Boolean);
  const fileName = segments[segments.length - 1] ?? filePath;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(query.data?.content ?? "");
      setCopied(true);
      toast.success("File copied", { description: fileName });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy file", { description: "Clipboard access was denied." });
    }
  };

  const error = query.error as ApiError | null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-0 backdrop-blur-sm sm:p-6 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeFile();
      }}
    >
      <div className="panel flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-none shadow-float sm:h-[86vh] sm:rounded-lg animate-in zoom-in-95 duration-150">
        {/* Editor title bar */}
        <div className="flex shrink-0 flex-col gap-2 border-b border-border bg-elevated/60 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <FileCode2 className="h-4 w-4 shrink-0 text-primary" />
            <nav className="flex min-w-0 items-center gap-1 overflow-hidden font-mono text-xs">
              {segments.slice(0, -1).map((seg, i) => (
                <span key={`${seg}-${i}`} className="hidden shrink-0 text-muted-foreground sm:flex">
                  {seg}
                  <span className="px-1 opacity-50">/</span>
                </span>
              ))}
              <span className="truncate text-foreground">{fileName}</span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {languageFromPath(filePath)}
            </span>
            {startLine ? (
              <span className="rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                L{startLine}–{endLine ?? startLine}
              </span>
            ) : null}
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
              {lines.length} lines
            </span>

            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={handleCopy}
              disabled={!query.data}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={closeFile}
              aria-label="Close code viewer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Source */}
        <div className="min-h-0 flex-1 overflow-auto bg-background/60">
          {query.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} className="h-3" style={{ width: `${45 + ((i * 13) % 50)}%` }} />
              ))}
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm font-medium text-foreground">
                {error.friendly ?? "Unable to load file"}
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {error.hint ?? "The source file could not be retrieved."}
              </p>
              <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <table className="w-full border-collapse font-mono text-[12.5px] leading-[1.65]">
              <tbody>
                {lines.map((line, idx) => {
                  const lineNo = idx + 1;
                  const highlighted =
                    startLine != null && lineNo >= startLine && lineNo <= (endLine ?? startLine);
                  const isFirstHighlight = highlighted && lineNo === startLine;
                  return (
                    <tr
                      key={idx}
                      ref={isFirstHighlight ? highlightRef : undefined}
                      className={cn(
                        "group",
                        highlighted ? "bg-primary/10" : "hover:bg-accent/40",
                      )}
                    >
                      <td
                        className={cn(
                          "w-[1%] select-none border-r border-border px-3 text-right align-top text-[11px] text-muted-foreground/70",
                          highlighted && "border-r-primary text-primary",
                        )}
                      >
                        {lineNo}
                      </td>
                      <td className="whitespace-pre-wrap break-words px-4 align-top text-foreground/90">
                        {line || " "}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-elevated/60 px-4 py-2">
          <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground">
            {filePath}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1.5 text-xs text-muted-foreground"
            disabled
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Repository
          </Button>
        </div>
      </div>
    </div>
  );
}
