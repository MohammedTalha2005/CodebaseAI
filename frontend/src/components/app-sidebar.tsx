import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronRight,
  Database,
  FolderTree,
  LayoutDashboard,
  MessageSquareCode,
  ScanSearch,
} from "lucide-react";
import { formatNumber, providerLabel } from "@/lib/api";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";
import { StatusDot, type Health } from "@/components/status-indicators";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
};

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { label: "Overview", icon: LayoutDashboard, to: "/" },
      { label: "AI Code Assistant", icon: MessageSquareCode, to: "/assistant" },
      { label: "Semantic Search", icon: ScanSearch, to: "/search" },
      { label: "Repository Explorer", icon: FolderTree, to: "/graph" },
    ],
  },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { status, backendOnline, statusLoading } = useAppState();
  const stats = status?.latest_stats ?? undefined;

  const health: Health = statusLoading ? "unknown" : backendOnline ? "healthy" : "offline";

  const systemRows: { label: string; value: string; health: Health }[] = [
    {
      label: "AI Engine",
      value: backendOnline ? providerLabel(status?.llm_provider) : "Offline",
      health,
    },
    {
      label: "Vector Database",
      value: backendOnline ? (status?.pinecone_index ?? "Connected") : "Unavailable",
      health,
    },
    {
      label: "Backend API",
      value: backendOnline ? "Connected" : "Unreachable",
      health,
    },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-sidebar">
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.to
                  ? item.to === "/"
                    ? pathname === "/"
                    : pathname === item.to
                  : false;

                if (item.soon || !item.to) {
                  return (
                    <li key={item.label}>
                      <div
                        aria-disabled
                        className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground/60"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          Soon
                        </span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                    >
                      <item.icon
                        className={cn("h-4 w-4 shrink-0", active && "text-sidebar-primary")}
                      />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity",
                          active ? "opacity-60" : "group-hover:opacity-40",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="rounded-md border border-border bg-card p-3">
          <div className="mb-2.5 flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              System Status
            </span>
          </div>
          <ul className="space-y-2">
            {systemRows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-2 text-xs">
                <span className="min-w-0 truncate text-muted-foreground">{row.label}</span>
                <span className="flex min-w-0 shrink-0 items-center gap-1.5">
                  <StatusDot health={row.health} />
                  <span className="max-w-[7.5rem] truncate font-mono text-[11px] text-foreground">
                    {row.value}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-border pt-3 text-center">
            {[
              { label: "Files", value: stats?.files_scanned },
              { label: "Units", value: stats?.units_parsed },
              { label: "Vectors", value: stats?.chunks_upserted },
            ].map((cell) => (
              <div key={cell.label}>
                <div className="font-mono text-sm text-foreground">{formatNumber(cell.value)}</div>
                <div className="text-[10px] text-muted-foreground">{cell.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
