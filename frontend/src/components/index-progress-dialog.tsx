import { Check, Circle, Loader2, TriangleAlert } from "lucide-react";
import { formatNumber } from "@/lib/api";
import { useAppState } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IngestStep } from "@/hooks/use-ingest-progress";

/** Maps each UI step label to the SSE step values that mark it as "active" or "done". */
const PIPELINE: {
  label: string;
  activeOn: IngestStep[];
  doneAfter: IngestStep[];
}[] = [
  {
    label: "Scanning repository",
    activeOn: ["scanning"],
    doneAfter: ["parsing", "embedding", "upserting", "done"],
  },
  {
    label: "Parsing source files",
    activeOn: ["parsing"],
    doneAfter: ["embedding", "upserting", "done"],
  },
  {
    label: "Generating embeddings",
    activeOn: ["embedding"],
    doneAfter: ["upserting", "done"],
  },
  {
    label: "Updating vector database",
    activeOn: ["upserting"],
    doneAfter: ["done"],
  },
  {
    label: "Finalizing index",
    activeOn: [],
    doneAfter: ["done"],
  },
];

export function IndexProgressDialog() {
  const {
    ingestPhase,
    ingestError,
    dismissIngest,
    status,
    progressStep,
    progressMessage,
    progressPct,
  } = useAppState();

  if (ingestPhase === "idle") return null;

  const running = ingestPhase === "running";
  const success = ingestPhase === "success";
  const stats = status?.latest_stats ?? undefined;

  // Clamp pct to 0-100
  const displayPct = Math.min(100, Math.max(0, progressPct));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/75 p-0 backdrop-blur-sm sm:items-center sm:p-6 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="panel w-full max-w-md overflow-hidden rounded-t-lg shadow-float sm:rounded-lg animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            {running && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            {success && <Check className="h-4 w-4 text-success" />}
            {ingestPhase === "error" && <TriangleAlert className="h-4 w-4 text-destructive" />}
            <h2 className="text-sm font-semibold text-foreground">
              {running
                ? "Indexing Repository"
                : success
                  ? "Repository indexed successfully"
                  : "Repository indexing failed"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {running
              ? "The backend is running the full ingestion pipeline. This can take a few minutes on large repositories."
              : success
                ? "The vector index reflects the latest state of your repository."
                : (ingestError ?? "The indexing run did not complete.")}
          </p>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {/* Progress bar */}
          {running && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Progress
                </span>
                <span className="font-mono text-[10px] text-primary tabular-nums">
                  {displayPct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                {displayPct === 0 ? (
                  /* Indeterminate until first event arrives */
                  <div className="h-full w-1/3 animate-[indeterminate_1.6s_ease-in-out_infinite] rounded-full bg-primary" />
                ) : (
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${displayPct}%` }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Step list */}
          <ul className="space-y-2.5">
            {PIPELINE.map((step) => {
              const isActive = running && step.activeOn.includes(progressStep);
              const isDone =
                success ||
                (running && step.doneAfter.includes(progressStep));

              return (
                <li key={step.label} className="flex items-center gap-2.5 text-xs">
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                  ) : isActive ? (
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary" />
                  ) : (
                    <Circle
                      className={cn(
                        "h-3 w-3 shrink-0",
                        running ? "text-muted-foreground/40" : "text-muted-foreground/50",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "min-w-0 truncate",
                      isDone
                        ? "text-foreground"
                        : isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Live message from backend */}
          {running && progressMessage && (
            <p className="mt-4 font-mono text-[11px] text-muted-foreground leading-relaxed truncate">
              {progressMessage}
            </p>
          )}
          {running && !progressMessage && (
            <p className="mt-4 font-mono text-[11px] text-muted-foreground">
              Connecting to backend…
            </p>
          )}

          {/* Success stats */}
          {success && (
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
              {[
                { label: "Files processed", value: stats?.files_scanned },
                { label: "Code units", value: stats?.units_parsed },
                { label: "Embeddings", value: stats?.chunks_upserted },
              ].map((cell) => (
                <div key={cell.label}>
                  <div className="font-mono text-base text-foreground">
                    {formatNumber(cell.value)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{cell.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border bg-elevated/50 px-5 py-3">
          <Button variant={running ? "ghost" : "default"} size="sm" onClick={dismissIngest}>
            {running ? "Run in background" : "Done"}
          </Button>
        </div>
      </div>

      <style>{`@keyframes indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    </div>
  );
}
