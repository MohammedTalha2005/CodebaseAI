import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Database,
  FileCode2,
  FolderGit2,
  FolderTree,
  Layers,
  MessageSquareCode,
  RefreshCw,
  ScanSearch,
} from "lucide-react";
import { api, formatNumber } from "@/lib/api";
import { useAppState } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusDot, type Health } from "@/components/status-indicators";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Repository Overview — Codebase AI Engineer" },
      {
        name: "description",
        content:
          "Repository intelligence overview: indexing health, code units parsed, vector embeddings and dependency insights.",
      },
      { property: "og:title", content: "Repository Overview — Codebase AI Engineer" },
      {
        property: "og:description",
        content: "Indexing health, code units, embeddings and dependency insights in one dashboard.",
      },
    ],
  }),
  component: Overview,
});

function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
  loading: boolean;
}) {
  return (
    <div className="panel panel-hover min-w-0 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 shrink-0 text-primary/80" />
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <div className="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
      )}
      <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function Overview() {
  const {
    status,
    statusLoading,
    backendOnline,
    startIngest,
    ingestPhase,
  } = useAppState();

  const stats = status?.latest_stats ?? undefined;
  const indexed = (stats?.chunks_upserted ?? 0) > 0 || status?.indexed === true;
  const indexHealth: Health = !backendOnline ? "offline" : indexed ? "healthy" : "warning";

  // Derive repo name from backend status
  const repoName = status?.repo_name || status?.pinecone_index || "Unknown Repository";


  return (
    <div className="mx-auto w-full max-w-[84rem] px-4 py-6 sm:px-6 lg:py-8">
      {/* Hero */}
      <section className="panel surface-gradient grid-backdrop overflow-hidden p-5 sm:p-7">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Current Repository</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
              {statusLoading ? <Skeleton className="h-8 w-48" /> : repoName}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              Understand, search and analyze your entire codebase with AI.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
              <StatusDot health={indexHealth} />
              <span className="text-xs text-muted-foreground">
                {!backendOnline ? "Disconnected" : indexed ? "Indexed" : "Awaiting index"}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => startIngest()}
              disabled={ingestPhase === "running"}
              className="gap-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${ingestPhase === "running" ? "animate-spin" : ""}`}
              />
              Re-index Repository
            </Button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="mt-6">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Repository Overview
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard
            label="Files Indexed"
            value={formatNumber(stats?.files_scanned)}
            icon={FileCode2}
            hint="Source files scanned by the ingestion pipeline"
            loading={statusLoading}
          />
          <KpiCard
            label="Code Units"
            value={formatNumber(stats?.units_parsed)}
            icon={Layers}
            hint="Functions, classes and modules parsed from AST"
            loading={statusLoading}
          />
          <KpiCard
            label="Vector Embeddings"
            value={formatNumber(stats?.chunks_upserted)}
            icon={Database}
            hint="Chunks upserted into the vector database"
            loading={statusLoading}
          />
        </div>
      </section>

      {/* Quick links */}
      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            title: "Folder Structure",
            body: `Explore the directory hierarchy and browse source code files.`,
            icon: FolderTree,
            to: "/graph",
            cta: "Explore repository",
          },
          {
            title: "AI Code Assistant",
            body: `Ask natural language questions grounded in your repository code.`,
            icon: MessageSquareCode,
            to: "/assistant",
            cta: "Ask question",
          },
          {
            title: "Semantic Search",
            body: `${formatNumber(stats?.chunks_upserted)} vector embeddings available for code search.`,
            icon: ScanSearch,
            to: "/search",
            cta: "Search codebase",
          },
        ].map((card) => (
          <div key={card.title} className="panel panel-hover flex min-w-0 flex-col p-4">
            <div className="flex items-center gap-2">
              <card.icon className="h-4 w-4 shrink-0 text-primary/80" />
              <h3 className="min-w-0 truncate text-sm font-medium text-foreground">{card.title}</h3>
            </div>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{card.body}</p>
            <Link
              to={card.to}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              {card.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </section>

      <footer className="mt-8 flex items-center gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span className="min-w-0 truncate">
          Codebase AI Engineer — Understand. Search. Analyze. Navigate.
        </span>
      </footer>
    </div>
  );
}
