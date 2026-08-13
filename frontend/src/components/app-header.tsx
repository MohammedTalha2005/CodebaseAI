import { Menu, RefreshCw, Terminal, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/app-sidebar";
import { StatusPill, type Health } from "@/components/status-indicators";
import { providerLabel } from "@/lib/api";
import { useAppState } from "@/lib/app-state";

export function AppHeader() {
  const { status, backendOnline, statusLoading, ingestPhase, startIngest } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);

  const health: Health = statusLoading ? "unknown" : backendOnline ? "healthy" : "offline";
  const indexed = (status?.latest_stats?.chunks_upserted ?? 0) > 0 || status?.indexed === true;
  const indexHealth: Health = !backendOnline ? "offline" : indexed ? "healthy" : "warning";
  const isIngesting = ingestPhase === "running";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[17rem] border-sidebar-border bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="h-full pt-10">
              <AppSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-primary/25 bg-primary/10">
            <Terminal className="h-4 w-4 text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
              Codebase AI Engineer
            </span>
            <span className="hidden truncate text-[11px] leading-tight text-muted-foreground sm:block">
              AI-Powered Repository Intelligence
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 xl:flex">
            <StatusPill
              health={indexHealth}
              label="Repository"
              value={indexed ? "Indexed" : backendOnline ? "Not indexed" : "Unknown"}
            />
            <StatusPill
              health={health}
              label="AI Engine"
              value={backendOnline ? providerLabel(status?.llm_provider) : "Offline"}
            />
            <StatusPill
              health={health}
              label="Vectors"
              value={backendOnline ? (status?.pinecone_index ?? "Connected") : "Offline"}
            />
          </div>

          <Button
            size="sm"
            onClick={() => startIngest()}
            disabled={isIngesting}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isIngesting ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">
              {isIngesting ? "Indexing…" : "Re-index Repository"}
            </span>
            <span className="sm:hidden">{isIngesting ? "Indexing" : "Re-index"}</span>
          </Button>


        </div>
      </div>

      {!backendOnline && !statusLoading && (
        <div className="flex items-center gap-2 border-t border-destructive/25 bg-destructive/10 px-4 py-2 text-xs text-foreground">
          <X className="h-3.5 w-3.5 shrink-0 text-destructive" />
          <span className="min-w-0 flex-1 truncate">
            Unable to connect to backend — make sure the Codebase AI Engineer backend is running.
          </span>
        </div>
      )}
    </header>
  );
}
