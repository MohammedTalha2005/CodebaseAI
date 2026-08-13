import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiError, api, type AskResponse, type StatusResponse } from "@/lib/api";
import { useIngestProgress, type IngestStep } from "@/hooks/use-ingest-progress";

export type Conversation = AskResponse & { id: string; failed?: boolean };

export type ViewingFile = {
  filePath: string;
  startLine?: number | null;
  endLine?: number | null;
};

export type IngestPhase = "idle" | "running" | "success" | "error";

type AppState = {
  status: StatusResponse | undefined;
  statusError: unknown;
  statusLoading: boolean;
  refetchStatus: () => void;
  backendOnline: boolean;

  conversations: Conversation[];
  askPending: boolean;
  pendingQuery: string | null;
  ask: (query: string) => void;
  clearConversations: () => void;

  ingestPhase: IngestPhase;
  ingestError: string | null;
  startIngest: (path?: string) => void;
  dismissIngest: () => void;
  reindexDialogOpen: boolean;
  openReindexDialog: () => void;
  closeReindexDialog: () => void;

  /** Current active pipeline step reported by SSE ("scanning", "embedding", etc.) */
  progressStep: IngestStep;
  /** Human-readable message from the backend for the current step. */
  progressMessage: string;
  /** 0-100 completion percentage from the backend. */
  progressPct: number;

  viewingFile: ViewingFile | null;
  openFile: (file: ViewingFile) => void;
  closeFile: () => void;
};

const AppStateContext = createContext<AppState | null>(null);

function errorMessage(error: unknown): { title: string; description: string } {
  if (error instanceof ApiError) return { title: error.friendly, description: error.hint };
  if (error && typeof error === "object" && "friendly" in error && "hint" in error) {
    return { title: String(error.friendly), description: String(error.hint) };
  }
  if (error instanceof Error) return { title: "Error", description: error.message };
  return {
    title: "Something went wrong",
    description: "The request could not be completed. Please try again.",
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["status"],
    queryFn: api.status,
    retry: false,
    refetchInterval: 60_000,
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<ViewingFile | null>(null);
  const [ingestPhase, setIngestPhase] = useState<IngestPhase>("idle");
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [reindexDialogOpen, setReindexDialogOpen] = useState(false);

  // -------------------------------------------------------------------------
  // SSE progress hook — active whenever an ingest is running
  // -------------------------------------------------------------------------
  const sseActive = ingestPhase === "running";

  const progress = useIngestProgress({
    active: sseActive,
    onDone: async (event) => {
      setIngestPhase("success");
      if (event.stats || event.repo_name) {
        queryClient.setQueryData(["status"], (old: StatusResponse | undefined) => ({
          ...old,
          repo_name: event.repo_name ?? old?.repo_name,
          latest_stats: event.stats ?? old?.latest_stats,
          indexed: true,
        }));
      }
      await queryClient.invalidateQueries({ queryKey: ["status"] });
      await queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Repository indexed successfully", {
        description: "The vector index is up to date.",
      });
    },
    onError: (event) => {
      setIngestPhase("error");
      setIngestError(event.message);
      toast.error("Repository indexing failed", { description: event.message });
    },
  });

  // -------------------------------------------------------------------------
  // Ask mutation
  // -------------------------------------------------------------------------
  const askMutation = useMutation({
    mutationFn: (query: string) => api.ask(query),
    onMutate: (query) => setPendingQuery(query),
    onSuccess: (data, query) => {
      setConversations((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          query: data.query || query,
          answer: data.answer,
          citations: data.citations ?? [],
        },
      ]);
    },
    onError: (error, query) => {
      const { title, description } = errorMessage(error);
      toast.error(title, { description });
      setConversations((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          query,
          answer: `${title}. ${description}`,
          citations: [],
          failed: true,
        },
      ]);
    },
    onSettled: () => setPendingQuery(null),
  });

  // -------------------------------------------------------------------------
  // Ingest mutation — now fire-and-forget; progress comes via SSE
  // -------------------------------------------------------------------------
  const ingestMutation = useMutation({
    mutationFn: (repoPath: string = "./") => api.ingest(repoPath, true),
    onMutate: () => {
      setIngestError(null);
      setIngestPhase("running");
      toast.info("Repository indexing started", {
        description: "Scanning, parsing and embedding source files.",
      });
    },
    onError: (error) => {
      // This only fires if the POST itself fails (e.g. 409 conflict, 400 bad URL)
      // Terminal ingest errors come through the SSE onError callback above.
      const { title, description } = errorMessage(error);
      setIngestPhase("error");
      setIngestError(`${title}. ${description}`);
      toast.error("Repository indexing failed", { description });
    },
    // onSuccess: intentionally omitted — we let the SSE "done" event drive state
  });

  const ask = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || askMutation.isPending) return;
      askMutation.mutate(trimmed);
    },
    [askMutation],
  );

  const value = useMemo<AppState>(
    () => ({
      status: statusQuery.data,
      statusError: statusQuery.error,
      statusLoading: statusQuery.isLoading,
      refetchStatus: () => void statusQuery.refetch(),
      backendOnline: statusQuery.isSuccess,

      conversations,
      askPending: askMutation.isPending,
      pendingQuery,
      ask,
      clearConversations: () => setConversations([]),

      ingestPhase,
      ingestError,
      startIngest: (targetPath?: string | unknown) => {
        const repoPath = typeof targetPath === "string" && targetPath.trim() ? targetPath.trim() : null;
        if (repoPath) {
          if (!ingestMutation.isPending) ingestMutation.mutate(repoPath);
          return;
        }
        // Open the GitHub URL dialog instead of the browser prompt
        setReindexDialogOpen(true);
      },
      dismissIngest: () => setIngestPhase("idle"),
      reindexDialogOpen,
      openReindexDialog: () => setReindexDialogOpen(true),
      closeReindexDialog: () => setReindexDialogOpen(false),

      progressStep: progress.step,
      progressMessage: progress.message,
      progressPct: progress.pct,

      viewingFile,
      openFile: setViewingFile,
      closeFile: () => setViewingFile(null),
    }),
    [
      statusQuery.data,
      statusQuery.error,
      statusQuery.isLoading,
      statusQuery.isSuccess,
      statusQuery,
      conversations,
      askMutation.isPending,
      pendingQuery,
      ask,
      ingestPhase,
      ingestError,
      ingestMutation,
      reindexDialogOpen,
      progress.step,
      progress.message,
      progress.pct,
      viewingFile,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
