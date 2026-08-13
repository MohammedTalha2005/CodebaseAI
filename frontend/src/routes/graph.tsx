import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  Code2,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  FolderTree,
  RefreshCw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { api, languageFromPath, type TreeNode } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/graph")({
  head: () => ({
    meta: [
      { title: "Repository Explorer — Codebase AI Engineer" },
      {
        name: "description",
        content:
          "Browse the folder and file structure of your indexed repository.",
      },
      { property: "og:title", content: "Repository Explorer — Codebase AI Engineer" },
      {
        property: "og:description",
        content: "Explore directories and source code files of your repository.",
      },
    ],
  }),
  component: RepositoryExplorer,
});

function TreeItem({
  node,
  selectedFile,
  onSelectFile,
  filter,
}: {
  node: TreeNode;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  filter: string;
}) {
  const [open, setOpen] = useState(true);

  if (node.type === "folder") {
    // If filter term is set, only render if matching children exist
    const hasChildren = node.children && node.children.length > 0;
    if (!hasChildren) return null;

    return (
      <div className="select-none">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
          )}
          {open ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-500/80" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-amber-500/80" />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        {open && (
          <div className="ml-3.5 border-l border-border/40 pl-1.5 space-y-0.5 mt-0.5">
            {node.children?.map((child) => (
              <TreeItem
                key={child.path || child.name}
                node={child}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                filter={filter}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File item
  if (filter.trim() && !node.name.toLowerCase().includes(filter.trim().toLowerCase())) {
    return null;
  }

  const isSelected = selectedFile === node.path;

  return (
    <button
      onClick={() => onSelectFile(node.path)}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors",
        isSelected
          ? "bg-primary/15 font-medium text-primary"
          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <FileCode2 className={cn("h-3.5 w-3.5 shrink-0", isSelected ? "text-primary" : "text-muted-foreground/70")} />
        <span className="truncate font-mono">{node.name}</span>
      </div>
      {node.lines !== undefined && (
        <span className="shrink-0 font-mono text-[10px] opacity-60">{node.lines} ln</span>
      )}
    </button>
  );
}

function RepositoryExplorer() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const treeQuery = useQuery({
    queryKey: ["tree"],
    queryFn: () => api.tree(),
    retry: false,
  });

  const fileQuery = useQuery({
    queryKey: ["file", selectedFile],
    queryFn: () => api.file(selectedFile!),
    enabled: Boolean(selectedFile),
  });

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-primary" />
              <h1 className="text-sm font-semibold text-foreground">Repository Explorer</h1>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Browse the folder hierarchy and source files of the active repository.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter files..."
                className="w-28 bg-transparent outline-none placeholder:text-muted-foreground sm:w-40"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => void treeQuery.refetch()}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", treeQuery.isFetching && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-border lg:grid-cols-[20rem_1fr] lg:divide-x lg:divide-y-0">
        {/* Left Sidebar Tree View */}
        <div className="flex min-h-0 flex-col bg-sidebar/50 p-3 overflow-y-auto">
          <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Folder Structure
          </div>

          {treeQuery.isLoading ? (
            <div className="space-y-2 p-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : treeQuery.data ? (
            <TreeItem
              node={treeQuery.data}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
              filter={filter}
            />
          ) : (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No repository structure available. Re-index a repository to explore files.
            </div>
          )}
        </div>

        {/* Right Code Content Pane */}
        <div className="flex min-h-0 flex-col overflow-hidden bg-card/30">
          {selectedFile ? (
            <div className="flex h-full flex-col min-h-0">
              <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Code2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate font-mono text-xs font-medium text-foreground">
                    {selectedFile}
                  </span>
                </div>
                <span className="shrink-0 rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {languageFromPath(selectedFile)}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
                {fileQuery.isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : fileQuery.data?.content ? (
                  <pre className="text-foreground/90 font-mono text-xs whitespace-pre-wrap break-all">
                    {fileQuery.data.content}
                  </pre>
                ) : (
                  <div className="text-muted-foreground italic">File content empty or unavailable.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground">Select a file to view content</p>
              <p className="mt-1 text-xs max-w-sm">
                Click any file in the folder structure on the left to inspect its source code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
