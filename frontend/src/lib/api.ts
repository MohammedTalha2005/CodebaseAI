/**
 * API layer for the Codebase AI Engineer backend.
 *
 * Endpoint contracts are unchanged from the original frontend:
 *   GET  /api/status
 *   POST /api/ingest        { path, clear }
 *   POST /api/ask           { query, top_k }
 *   GET  /api/file?path=...
 *   GET  /api/graph
 */

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) || "http://127.0.0.1:8000";

export type IndexStats = {
  files_scanned?: number;
  units_parsed?: number;
  chunks_upserted?: number;
  [key: string]: unknown;
};

export type StatusResponse = {
  llm_provider?: string;
  pinecone_index?: string;
  repo_name?: string;
  indexed?: boolean;
  vector_count?: number;
  last_indexed?: string;
  latest_stats?: IndexStats | null;
  [key: string]: unknown;
};

export type Citation = {
  file_path: string;
  unit_name?: string | null;
  start_line?: number | null;
  end_line?: number | null;
  score?: number | null;
  snippet?: string | null;
  [key: string]: unknown;
};

export type AskResponse = {
  query: string;
  answer: string;
  citations?: Citation[];
};

export type GraphNode = { id: string; label: string; size?: number };
export type GraphEdge = { source: string; target: string };
export type GraphResponse = { nodes: GraphNode[]; edges: GraphEdge[] };

export type FileResponse = { content: string; path?: string };

export class ApiError extends Error {
  readonly friendly: string;
  readonly hint: string;
  constructor(friendly: string, hint: string) {
    super(friendly);
    this.name = "ApiError";
    this.friendly = friendly;
    this.hint = hint;
  }
}

const OFFLINE_HINT =
  "Make sure the Codebase AI Engineer backend is running and reachable, then try again.";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Unable to connect to backend", OFFLINE_HINT);
  }

  if (!res.ok) {
    let detailMsg = "";
    try {
      const errJson = await res.json();
      detailMsg = errJson.detail || errJson.message || "";
    } catch {
      // ignore json parse error on non-200
    }

    const hint = detailMsg
      ? detailMsg
      : res.status === 404
        ? "The requested resource was not found on the backend."
        : `The backend responded with status ${res.status}. Check the service logs and try again.`;

    throw new ApiError(
      res.status >= 500 ? "Backend Error" : "Request Failed",
      hint,
    );
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError(
      "Unexpected response from backend",
      "The backend returned a response that could not be read.",
    );
  }
}

export type TreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
  lines?: number;
  size?: number;
  language?: string;
};

export const api = {
  status: () => request<StatusResponse>("/api/status"),

  ingest: (path = "./", clear = false) =>
    request<Record<string, unknown>>("/api/ingest", {
      method: "POST",
      body: JSON.stringify({ path, clear }),
    }),

  ask: (query: string, topK = 5) =>
    request<AskResponse>("/api/ask", {
      method: "POST",
      body: JSON.stringify({ query, top_k: topK }),
    }),

  file: (path: string) => request<FileResponse>(`/api/file?path=${encodeURIComponent(path)}`),

  tree: (path?: string) =>
    request<TreeNode>(`/api/tree${path ? `?path=${encodeURIComponent(path)}` : ""}`),

  graph: () => request<GraphResponse>("/api/graph"),
};

/** Human-readable label for the configured LLM provider. */
export function providerLabel(provider?: string): string {
  if (!provider) return "Local Reasoner";
  const map: Record<string, string> = {
    gemini: "Gemini",
    groq: "Groq Llama-3",
    openai: "OpenAI",
    anthropic: "Anthropic Claude",
    local_synthesis: "Local Reasoner",
  };
  return map[provider] ?? provider.replace(/_/g, " ");
}

export function languageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    py: "Python",
    ts: "TypeScript",
    tsx: "TypeScript React",
    js: "JavaScript",
    jsx: "JavaScript React",
    json: "JSON",
    md: "Markdown",
    yml: "YAML",
    yaml: "YAML",
    csv: "CSV",
    tsv: "CSV",
    pkl: "Pickle",
    pickle: "Pickle",
    xml: "XML",
    ini: "INI",
    cfg: "INI",
    go: "Go",
    rs: "Rust",
    java: "Java",
    rb: "Ruby",
    css: "CSS",
    html: "HTML",
    sh: "Shell",
    sql: "SQL",
    toml: "TOML",
  };
  return map[ext] ?? (ext ? ext.toUpperCase() : "Plain text");
}

export function formatNumber(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export const SAMPLE_QUERIES = [
  "Explain the overall repository architecture.",
  "Which module handles AST parsing for source files?",
  "How does the RAG pipeline retrieve and rank code?",
  "Where is the repository scanner implemented?",
  "How are code vectors upserted into the vector database?",
  "Which files depend on the base parser module?",
];
