import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

export type IngestStep =
  | "idle"
  | "scanning"
  | "parsing"
  | "embedding"
  | "upserting"
  | "done"
  | "error";

export interface ProgressEvent {
  step: IngestStep;
  message: string;
  pct: number;
  stats?: {
    files_scanned?: number;
    units_parsed?: number;
    chunks_upserted?: number;
  };
  repo_name?: string;
}

interface UseIngestProgressOptions {
  /** Start listening when true, stop when false. */
  active: boolean;
  onDone?: (event: ProgressEvent) => void;
  onError?: (event: ProgressEvent) => void;
}

interface IngestProgressState {
  step: IngestStep;
  message: string;
  pct: number;
  stats?: ProgressEvent["stats"];
  repo_name?: string;
}

const INITIAL_STATE: IngestProgressState = {
  step: "idle",
  message: "",
  pct: 0,
};

/**
 * Subscribes to the backend SSE stream at /api/ingest/progress.
 * Automatically reconnects on transient disconnects while `active` is true.
 * Closes the connection when `active` becomes false or when step is "done"/"error".
 */
export function useIngestProgress({
  active,
  onDone,
  onError,
}: UseIngestProgressOptions): IngestProgressState {
  const [state, setState] = useState<IngestProgressState>(INITIAL_STATE);
  const esRef = useRef<EventSource | null>(null);
  const onDoneRef = useRef(onDone);
  const onErrorRef = useRef(onError);
  onDoneRef.current = onDone;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!active) {
      esRef.current?.close();
      esRef.current = null;
      setState(INITIAL_STATE);
      return;
    }

    function connect() {
      if (esRef.current) {
        esRef.current.close();
      }

      const es = new EventSource(`${API_BASE_URL}/api/ingest/progress`);
      esRef.current = es;

      es.onmessage = (e) => {
        try {
          const event: ProgressEvent = JSON.parse(e.data as string);
          setState({
            step: event.step,
            message: event.message,
            pct: event.pct ?? 0,
            stats: event.stats,
            repo_name: event.repo_name,
          });

          if (event.step === "done") {
            es.close();
            esRef.current = null;
            onDoneRef.current?.(event);
          } else if (event.step === "error") {
            es.close();
            esRef.current = null;
            onErrorRef.current?.(event);
          }
        } catch {
          // ignore malformed events
        }
      };

      es.onerror = () => {
        // EventSource auto-reconnects; we just log in dev
        if (import.meta.env.DEV) {
          console.debug("[IngestProgress] SSE connection error — browser will retry.");
        }
      };
    }

    connect();

    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [active]);

  return state;
}
