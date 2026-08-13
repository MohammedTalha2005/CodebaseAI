import { cn } from "@/lib/utils";

export type Health = "healthy" | "warning" | "offline" | "unknown";

const dotStyles: Record<Health, string> = {
  healthy: "bg-success",
  warning: "bg-warning",
  offline: "bg-destructive",
  unknown: "bg-muted-foreground",
};

export function StatusDot({ health, className }: { health: Health; className?: string }) {
  return (
    <span className={cn("relative flex h-2 w-2 shrink-0", className)}>
      {health === "healthy" && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotStyles[health])} />
    </span>
  );
}

export function StatusPill({
  health,
  label,
  value,
  className,
}: {
  health: Health;
  label: string;
  value?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5",
        className,
      )}
    >
      <StatusDot health={health} />
      <span className="truncate text-xs text-muted-foreground">
        <span className="text-foreground">{label}</span>
        {value ? <span className="ml-1.5 font-mono text-[11px]">{value}</span> : null}
      </span>
    </div>
  );
}

export function HealthGlyph({ health }: { health: Health }) {
  if (health === "healthy") return <span className="text-success">✓</span>;
  if (health === "warning") return <span className="text-warning">⚠</span>;
  if (health === "offline") return <span className="text-destructive">✕</span>;
  return <span className="text-muted-foreground">–</span>;
}
