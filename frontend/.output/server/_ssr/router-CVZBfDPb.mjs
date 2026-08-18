import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, c as DialogTrigger, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog, u as Slot } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { _ as useRouter, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { i as useQueryClient, n as useQuery, r as QueryClientProvider, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { A as CircleAlert, C as Database, N as Check, S as ExternalLink, T as Copy, _ as FolderTree, c as ScanSearch, d as Menu, f as LoaderCircle, h as Github, i as Terminal, j as ChevronRight, k as Circle, l as RefreshCw, p as LayoutDashboard, r as TriangleAlert, t as X, u as MessageSquareCode, x as FileCodeCorner } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/skeleton-DoUXh6fM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
var API_BASE_URL = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
}["VITE_API_BASE_URL"] || "http://127.0.0.1:8000";
var ApiError = class extends Error {
	friendly;
	hint;
	constructor(friendly, hint) {
		super(friendly);
		this.name = "ApiError";
		this.friendly = friendly;
		this.hint = hint;
	}
};
var OFFLINE_HINT = "Make sure the Codebase AI Engineer backend is running and reachable, then try again.";
async function request(path, init) {
	let res;
	try {
		res = await fetch(`${API_BASE_URL}${path}`, {
			...init,
			headers: {
				"Content-Type": "application/json",
				...init?.headers ?? {}
			}
		});
	} catch {
		throw new ApiError("Unable to connect to backend", OFFLINE_HINT);
	}
	if (!res.ok) {
		let detailMsg = "";
		try {
			const errJson = await res.json();
			detailMsg = errJson.detail || errJson.message || "";
		} catch {}
		const hint = detailMsg ? detailMsg : res.status === 404 ? "The requested resource was not found on the backend." : `The backend responded with status ${res.status}. Check the service logs and try again.`;
		throw new ApiError(res.status >= 500 ? "Backend Error" : "Request Failed", hint);
	}
	try {
		return await res.json();
	} catch {
		throw new ApiError("Unexpected response from backend", "The backend returned a response that could not be read.");
	}
}
var api = {
	status: () => request("/api/status"),
	ingest: (path = "./", clear = false) => request("/api/ingest", {
		method: "POST",
		body: JSON.stringify({
			path,
			clear
		})
	}),
	ask: (query, topK = 5) => request("/api/ask", {
		method: "POST",
		body: JSON.stringify({
			query,
			top_k: topK
		})
	}),
	file: (path) => request(`/api/file?path=${encodeURIComponent(path)}`),
	tree: (path) => request(`/api/tree${path ? `?path=${encodeURIComponent(path)}` : ""}`),
	graph: () => request("/api/graph")
};
/** Human-readable label for the configured LLM provider. */
function providerLabel(provider) {
	if (!provider) return "Local Reasoner";
	return {
		gemini: "Gemini",
		groq: "Groq Llama-3",
		openai: "OpenAI",
		anthropic: "Anthropic Claude",
		local_synthesis: "Local Reasoner"
	}[provider] ?? provider.replace(/_/g, " ");
}
function languageFromPath(path) {
	const ext = path.split(".").pop()?.toLowerCase() ?? "";
	return {
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
		toml: "TOML"
	}[ext] ?? (ext ? ext.toUpperCase() : "Plain text");
}
function formatNumber(value) {
	if (value === null || value === void 0 || Number.isNaN(value)) return "—";
	return new Intl.NumberFormat("en-US").format(value);
}
var SAMPLE_QUERIES = [
	"Explain the overall repository architecture.",
	"Which module handles AST parsing for source files?",
	"How does the RAG pipeline retrieve and rank code?",
	"Where is the repository scanner implemented?",
	"How are code vectors upserted into the vector database?",
	"Which files depend on the base parser module?"
];
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-CVZBfDPb.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var styles_default = "/assets/styles-nszbemvv.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var INITIAL_STATE = {
	step: "idle",
	message: "",
	pct: 0
};
/**
* Subscribes to the backend SSE stream at /api/ingest/progress.
* Automatically reconnects on transient disconnects while `active` is true.
* Closes the connection when `active` becomes false or when step is "done"/"error".
*/
function useIngestProgress({ active, onDone, onError }) {
	const [state, setState] = (0, import_react.useState)(INITIAL_STATE);
	const esRef = (0, import_react.useRef)(null);
	const onDoneRef = (0, import_react.useRef)(onDone);
	const onErrorRef = (0, import_react.useRef)(onError);
	onDoneRef.current = onDone;
	onErrorRef.current = onError;
	(0, import_react.useEffect)(() => {
		if (!active) {
			esRef.current?.close();
			esRef.current = null;
			setState(INITIAL_STATE);
			return;
		}
		function connect() {
			if (esRef.current) esRef.current.close();
			const es = new EventSource(`${API_BASE_URL}/api/ingest/progress`);
			esRef.current = es;
			es.onmessage = (e) => {
				try {
					const event = JSON.parse(e.data);
					setState({
						step: event.step,
						message: event.message,
						pct: event.pct ?? 0,
						stats: event.stats,
						repo_name: event.repo_name
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
				} catch {}
			};
			es.onerror = () => {};
		}
		connect();
		return () => {
			esRef.current?.close();
			esRef.current = null;
		};
	}, [active]);
	return state;
}
var AppStateContext = (0, import_react.createContext)(null);
function errorMessage(error) {
	if (error instanceof ApiError) return {
		title: error.friendly,
		description: error.hint
	};
	if (error && typeof error === "object" && "friendly" in error && "hint" in error) return {
		title: String(error.friendly),
		description: String(error.hint)
	};
	if (error instanceof Error) return {
		title: "Error",
		description: error.message
	};
	return {
		title: "Something went wrong",
		description: "The request could not be completed. Please try again."
	};
}
function AppStateProvider({ children }) {
	const queryClient = useQueryClient();
	const statusQuery = useQuery({
		queryKey: ["status"],
		queryFn: api.status,
		retry: false,
		refetchInterval: 6e4
	});
	const [conversations, setConversations] = (0, import_react.useState)([]);
	const [pendingQuery, setPendingQuery] = (0, import_react.useState)(null);
	const [viewingFile, setViewingFile] = (0, import_react.useState)(null);
	const [ingestPhase, setIngestPhase] = (0, import_react.useState)("idle");
	const [ingestError, setIngestError] = (0, import_react.useState)(null);
	const [reindexDialogOpen, setReindexDialogOpen] = (0, import_react.useState)(false);
	const progress = useIngestProgress({
		active: ingestPhase === "running",
		onDone: async (event) => {
			setIngestPhase("success");
			if (event.stats || event.repo_name) queryClient.setQueryData(["status"], (old) => ({
				...old,
				repo_name: event.repo_name ?? old?.repo_name,
				latest_stats: event.stats ?? old?.latest_stats,
				indexed: true
			}));
			await queryClient.invalidateQueries({ queryKey: ["status"] });
			await queryClient.invalidateQueries({ queryKey: ["tree"] });
			toast.success("Repository indexed successfully", { description: "The vector index is up to date." });
		},
		onError: (event) => {
			setIngestPhase("error");
			setIngestError(event.message);
			toast.error("Repository indexing failed", { description: event.message });
		}
	});
	const askMutation = useMutation({
		mutationFn: (query) => api.ask(query),
		onMutate: (query) => setPendingQuery(query),
		onSuccess: (data, query) => {
			setConversations((prev) => [...prev, {
				id: `${Date.now()}-${prev.length}`,
				query: data.query || query,
				answer: data.answer,
				citations: data.citations ?? []
			}]);
		},
		onError: (error, query) => {
			const { title, description } = errorMessage(error);
			toast.error(title, { description });
			setConversations((prev) => [...prev, {
				id: `${Date.now()}-${prev.length}`,
				query,
				answer: `${title}. ${description}`,
				citations: [],
				failed: true
			}]);
		},
		onSettled: () => setPendingQuery(null)
	});
	const ingestMutation = useMutation({
		mutationFn: (repoPath = "./") => api.ingest(repoPath, true),
		onMutate: () => {
			setIngestError(null);
			setIngestPhase("running");
			toast.info("Repository indexing started", { description: "Scanning, parsing and embedding source files." });
		},
		onError: (error) => {
			const { title, description } = errorMessage(error);
			setIngestPhase("error");
			setIngestError(`${title}. ${description}`);
			toast.error("Repository indexing failed", { description });
		}
	});
	const ask = (0, import_react.useCallback)((query) => {
		const trimmed = query.trim();
		if (!trimmed || askMutation.isPending) return;
		askMutation.mutate(trimmed);
	}, [askMutation]);
	const value = (0, import_react.useMemo)(() => ({
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
		startIngest: (targetPath) => {
			const repoPath = typeof targetPath === "string" && targetPath.trim() ? targetPath.trim() : null;
			if (repoPath) {
				if (!ingestMutation.isPending) ingestMutation.mutate(repoPath);
				return;
			}
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
		closeFile: () => setViewingFile(null)
	}), [
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
		viewingFile
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppStateContext.Provider, {
		value,
		children
	});
}
function useAppState() {
	const ctx = (0, import_react.useContext)(AppStateContext);
	if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
	return ctx;
}
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
var dotStyles = {
	healthy: "bg-success shadow-[0_0_6px_rgba(45,220,55,0.65)]",
	warning: "bg-warning",
	offline: "bg-destructive",
	unknown: "bg-muted-foreground"
};
function StatusDot({ health, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("relative flex h-2 w-2 shrink-0", className),
		children: [health === "healthy" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("relative inline-flex h-2 w-2 rounded-full", dotStyles[health]) })]
	});
}
function StatusPill({ health, label, value, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-w-0 items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDot, { health }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "truncate text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-foreground",
				children: label
			}), value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-1.5 font-mono text-[11px]",
				children: value
			}) : null]
		})]
	});
}
var sections = [{
	title: "Workspace",
	items: [
		{
			label: "Overview",
			icon: LayoutDashboard,
			to: "/"
		},
		{
			label: "AI Code Assistant",
			icon: MessageSquareCode,
			to: "/assistant"
		},
		{
			label: "Semantic Search",
			icon: ScanSearch,
			to: "/search"
		},
		{
			label: "Repository Explorer",
			icon: FolderTree,
			to: "/graph"
		}
	]
}];
function AppSidebar({ onNavigate }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { status, backendOnline, statusLoading } = useAppState();
	const stats = status?.latest_stats ?? void 0;
	const health = statusLoading ? "unknown" : backendOnline ? "healthy" : "offline";
	const systemRows = [
		{
			label: "AI Engine",
			value: backendOnline ? providerLabel(status?.llm_provider) : "Offline",
			health
		},
		{
			label: "Vector Database",
			value: backendOnline ? status?.pinecone_index ?? "Connected" : "Unavailable",
			health
		},
		{
			label: "Backend API",
			value: backendOnline ? "Connected" : "Unreachable",
			health
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 w-full flex-col bg-sidebar",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "min-h-0 flex-1 overflow-y-auto px-3 py-4",
			children: sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
					children: section.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-0.5",
					children: section.items.map((item) => {
						const active = item.to ? item.to === "/" ? pathname === "/" : pathname === item.to : false;
						if (item.soon || !item.to) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"aria-disabled": true,
							className: "flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-4 w-4 shrink-0" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate",
									children: item.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 rounded border border-border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70",
									children: "Soon"
								})
							]
						}) }, item.label);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							onClick: onNavigate,
							className: cn("group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: cn("h-4 w-4 shrink-0", active && "text-sidebar-primary") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate",
									children: item.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: cn("h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity", active ? "opacity-60" : "group-hover:opacity-40") })
							]
						}) }, item.label);
					})
				})]
			}, section.title))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0 border-t border-sidebar-border p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border bg-card p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2.5 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-3.5 w-3.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
							children: "System Status"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: systemRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 truncate text-muted-foreground",
								children: row.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex min-w-0 shrink-0 items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDot, { health: row.health }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "max-w-[7.5rem] truncate font-mono text-[11px] text-foreground",
									children: row.value
								})]
							})]
						}, row.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-3 gap-1.5 border-t border-border pt-3 text-center",
						children: [
							{
								label: "Files",
								value: stats?.files_scanned
							},
							{
								label: "Units",
								value: stats?.units_parsed
							},
							{
								label: "Vectors",
								value: stats?.chunks_upserted
							}
						].map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-sm text-foreground",
							children: formatNumber(cell.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] text-muted-foreground",
							children: cell.label
						})] }, cell.label))
					})
				]
			})
		})]
	});
}
function AppHeader() {
	const { status, backendOnline, statusLoading, ingestPhase, startIngest } = useAppState();
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const health = statusLoading ? "unknown" : backendOnline ? "healthy" : "offline";
	const indexed = (status?.latest_stats?.chunks_upserted ?? 0) > 0 || status?.indexed === true;
	const indexHealth = !backendOnline ? "offline" : indexed ? "healthy" : "warning";
	const isIngesting = ingestPhase === "running";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-14 items-center gap-3 px-3 sm:px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
					open: mobileOpen,
					onOpenChange: setMobileOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "lg:hidden",
							"aria-label": "Open navigation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
						side: "left",
						className: "w-[17rem] border-sidebar-border bg-sidebar p-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
							className: "sr-only",
							children: "Navigation"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full pt-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, { onNavigate: () => setMobileOpen(false) })
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex min-w-0 items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-8 w-8 shrink-0 place-items-center rounded-md border border-primary/25 bg-primary/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Terminal, { className: "h-4 w-4 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm font-semibold leading-tight tracking-tight text-foreground",
							children: "Codebase AI Engineer"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden truncate text-[11px] leading-tight text-muted-foreground sm:block",
							children: "AI-Powered Repository Intelligence"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden items-center gap-2 xl:flex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
								health: indexHealth,
								label: "Repository",
								value: indexed ? "Indexed" : backendOnline ? "Not indexed" : "Unknown"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
								health,
								label: "AI Engine",
								value: backendOnline ? providerLabel(status?.llm_provider) : "Offline"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
								health,
								label: "Vectors",
								value: backendOnline ? status?.pinecone_index ?? "Connected" : "Offline"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => startIngest(),
						disabled: isIngesting,
						className: "h-8 gap-1.5 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${isIngesting ? "animate-spin" : ""}` }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: isIngesting ? "Indexing…" : "Re-index Repository"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sm:hidden",
								children: isIngesting ? "Indexing" : "Re-index"
							})
						]
					})]
				})
			]
		}), !backendOnline && !statusLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-t border-destructive/25 bg-destructive/10 px-4 py-2 text-xs text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 shrink-0 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate",
				children: "Unable to connect to backend — make sure the Codebase AI Engineer backend is running."
			})]
		})]
	});
}
function CodeViewerModal() {
	const { viewingFile, closeFile } = useAppState();
	const filePath = viewingFile?.filePath;
	const startLine = viewingFile?.startLine ?? null;
	const endLine = viewingFile?.endLine ?? null;
	const [copied, setCopied] = (0, import_react.useState)(false);
	const highlightRef = (0, import_react.useRef)(null);
	const query = useQuery({
		queryKey: ["file", filePath],
		queryFn: () => api.file(filePath),
		enabled: Boolean(filePath),
		retry: false
	});
	const lines = (0, import_react.useMemo)(() => (query.data?.content ?? "").split("\n"), [query.data?.content]);
	(0, import_react.useEffect)(() => {
		if (!query.data) return;
		const timer = setTimeout(() => highlightRef.current?.scrollIntoView({
			block: "center",
			behavior: "smooth"
		}), 80);
		return () => clearTimeout(timer);
	}, [query.data]);
	(0, import_react.useEffect)(() => {
		if (!filePath) return;
		const onKey = (e) => {
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
			setTimeout(() => setCopied(false), 2e3);
		} catch {
			toast.error("Could not copy file", { description: "Clipboard access was denied." });
		}
	};
	const error = query.error;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-0 backdrop-blur-sm sm:p-6 animate-in fade-in duration-150",
		role: "dialog",
		"aria-modal": "true",
		onClick: (e) => {
			if (e.target === e.currentTarget) closeFile();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-none shadow-float sm:h-[86vh] sm:rounded-lg animate-in zoom-in-95 duration-150",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-col gap-2 border-b border-border bg-elevated/60 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCodeCorner, { className: "h-4 w-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "flex min-w-0 items-center gap-1 overflow-hidden font-mono text-xs",
							children: [segments.slice(0, -1).map((seg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden shrink-0 text-muted-foreground sm:flex",
								children: [seg, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-1 opacity-50",
									children: "/"
								})]
							}, `${seg}-${i}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-foreground",
								children: fileName
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground",
								children: languageFromPath(filePath)
							}),
							startLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary",
								children: [
									"L",
									startLine,
									"–",
									endLine ?? startLine
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden font-mono text-[10px] text-muted-foreground sm:inline",
								children: [lines.length, " lines"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "h-7 gap-1.5 px-2 text-xs",
								onClick: handleCopy,
								disabled: !query.data,
								children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: copied ? "Copied" : "Copy"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "h-7 w-7",
								onClick: closeFile,
								"aria-label": "Close code viewer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 overflow-auto bg-background/60",
					children: query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2 p-4",
						children: Array.from({ length: 14 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
							className: "h-3",
							style: { width: `${45 + i * 13 % 50}%` }
						}, i))
					}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-full flex-col items-center justify-center gap-3 px-6 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-foreground",
								children: error.friendly ?? "Unable to load file"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-sm text-xs text-muted-foreground",
								children: error.hint ?? "The source file could not be retrieved."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => void query.refetch(),
								children: "Retry"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
						className: "w-full border-collapse font-mono text-[12.5px] leading-[1.65]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: lines.map((line, idx) => {
							const lineNo = idx + 1;
							const highlighted = startLine != null && lineNo >= startLine && lineNo <= (endLine ?? startLine);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								ref: highlighted && lineNo === startLine ? highlightRef : void 0,
								className: cn("group", highlighted ? "bg-primary/10" : "hover:bg-accent/40"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("w-[1%] select-none border-r border-border px-3 text-right align-top text-[11px] text-muted-foreground/70", highlighted && "border-r-primary text-primary"),
									children: lineNo
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "whitespace-pre-wrap break-words px-4 align-top text-foreground/90",
									children: line || " "
								})]
							}, idx);
						}) })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center justify-between gap-3 border-t border-border bg-elevated/60 px-4 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 truncate font-mono text-[11px] text-muted-foreground",
						children: filePath
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						className: "h-7 shrink-0 gap-1.5 text-xs text-muted-foreground",
						disabled: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5" }), "Open in Repository"]
					})]
				})
			]
		})
	});
}
/** Maps each UI step label to the SSE step values that mark it as "active" or "done". */
var PIPELINE = [
	{
		label: "Scanning repository",
		activeOn: ["scanning"],
		doneAfter: [
			"parsing",
			"embedding",
			"upserting",
			"done"
		]
	},
	{
		label: "Parsing source files",
		activeOn: ["parsing"],
		doneAfter: [
			"embedding",
			"upserting",
			"done"
		]
	},
	{
		label: "Generating embeddings",
		activeOn: ["embedding"],
		doneAfter: ["upserting", "done"]
	},
	{
		label: "Updating vector database",
		activeOn: ["upserting"],
		doneAfter: ["done"]
	},
	{
		label: "Finalizing index",
		activeOn: [],
		doneAfter: ["done"]
	}
];
function IndexProgressDialog() {
	const { ingestPhase, ingestError, dismissIngest, status, progressStep, progressMessage, progressPct } = useAppState();
	if (ingestPhase === "idle") return null;
	const running = ingestPhase === "running";
	const success = ingestPhase === "success";
	const stats = status?.latest_stats ?? void 0;
	const displayPct = Math.min(100, Math.max(0, progressPct));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-background/75 p-0 backdrop-blur-sm sm:items-center sm:p-6 animate-in fade-in duration-150",
		role: "dialog",
		"aria-modal": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel w-full max-w-md overflow-hidden rounded-t-lg shadow-float sm:rounded-lg animate-in slide-in-from-bottom-4 duration-200",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [
							running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-primary" }),
							success && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-success" }),
							ingestPhase === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-destructive" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold text-foreground",
								children: running ? "Indexing Repository" : success ? "Repository indexed successfully" : "Repository indexing failed"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: running ? "The backend is running the full ingestion pipeline. This can take a few minutes on large repositories." : success ? "The vector index reflects the latest state of your repository." : ingestError ?? "The indexing run did not complete."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-4",
					children: [
						running && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider",
									children: "Progress"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-[10px] text-primary tabular-nums",
									children: [displayPct, "%"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 w-full overflow-hidden rounded-full bg-secondary",
								children: displayPct === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-1/3 animate-[indeterminate_1.6s_ease-in-out_infinite] rounded-full bg-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-primary transition-all duration-500 ease-out",
									style: { width: `${displayPct}%` }
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2.5",
							children: PIPELINE.map((step) => {
								const isActive = running && step.activeOn.includes(progressStep);
								const isDone = success || running && step.doneAfter.includes(progressStep);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2.5 text-xs",
									children: [isDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 shrink-0 text-success" }) : isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 shrink-0 animate-spin text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: cn("h-3 w-3 shrink-0", running ? "text-muted-foreground/40" : "text-muted-foreground/50") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("min-w-0 truncate", isDone ? "text-foreground" : isActive ? "text-foreground font-medium" : "text-muted-foreground"),
										children: step.label
									})]
								}, step.label);
							})
						}),
						running && progressMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-mono text-[11px] text-muted-foreground leading-relaxed truncate",
							children: progressMessage
						}),
						running && !progressMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-mono text-[11px] text-muted-foreground",
							children: "Connecting to backend…"
						}),
						success && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center",
							children: [
								{
									label: "Files processed",
									value: stats?.files_scanned
								},
								{
									label: "Code units",
									value: stats?.units_parsed
								},
								{
									label: "Embeddings",
									value: stats?.chunks_upserted
								}
							].map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-base text-foreground",
								children: formatNumber(cell.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] text-muted-foreground",
								children: cell.label
							})] }, cell.label))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end gap-2 border-t border-border bg-elevated/50 px-5 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: running ? "ghost" : "default",
						size: "sm",
						onClick: dismissIngest,
						children: running ? "Run in background" : "Done"
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `@keyframes indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }` })]
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
function isValidGithubUrl(url) {
	try {
		const trimmed = url.trim();
		if (!trimmed.startsWith("https://github.com/") && !trimmed.startsWith("http://github.com/")) return false;
		const parts = trimmed.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").split("/");
		return parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0;
	} catch {
		return false;
	}
}
var EXAMPLES = ["https://github.com/openai/whisper", "https://github.com/facebook/react"];
function ReindexDialog({ open, loading, onConfirm, onCancel }) {
	const [url, setUrl] = (0, import_react.useState)("");
	const [touched, setTouched] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const valid = isValidGithubUrl(url);
	const showError = touched && url.trim().length > 0 && !valid;
	(0, import_react.useEffect)(() => {
		if (open) {
			setUrl("");
			setTouched(false);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [open]);
	if (!open) return null;
	function handleSubmit(e) {
		e.preventDefault();
		setTouched(true);
		if (valid) onConfirm(url.trim());
	}
	function handleKeyDown(e) {
		if (e.key === "Escape") onCancel();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-150",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "reindex-dialog-title",
		onKeyDown: handleKeyDown,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel w-full max-w-md overflow-hidden rounded-lg shadow-float animate-in slide-in-from-bottom-4 duration-200 mx-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "reindex-dialog-title",
								className: "text-sm font-semibold text-foreground",
								children: "Index a GitHub Repository"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onCancel,
							className: "rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
							"aria-label": "Close dialog",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Enter a public GitHub repository URL to scan, parse, and index its source code."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "px-5 py-4 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "github-url-input",
								className: "text-xs font-medium text-foreground",
								children: "Repository URL"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									ref: inputRef,
									id: "github-url-input",
									type: "url",
									value: url,
									onChange: (e) => setUrl(e.target.value),
									onBlur: () => setTouched(true),
									placeholder: "https://github.com/owner/repository",
									className: cn("pl-9 font-mono text-xs", showError && "border-destructive focus-visible:ring-destructive"),
									disabled: loading,
									autoComplete: "url",
									spellCheck: false
								})]
							}),
							showError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-xs text-destructive animate-in fade-in duration-150",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3.5 w-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Please enter a valid GitHub URL (e.g. https://github.com/owner/repo)" })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Only GitHub repositories are supported. Local paths are not allowed."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
							children: "Examples"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: EXAMPLES.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setUrl(ex);
									setTouched(false);
								},
								className: "rounded border border-border bg-secondary/50 px-2 py-1 font-mono text-[10px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors",
								disabled: loading,
								children: ex.replace("https://github.com/", "")
							}, ex))
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-end gap-2 border-t border-border bg-elevated/50 px-5 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: onCancel,
						disabled: loading,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: (e) => handleSubmit(e),
						disabled: loading || !valid,
						className: "min-w-[100px]",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }), "Indexing…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "mr-2 h-3.5 w-3.5" }), "Index Repo"] })
					})]
				})
			]
		})
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-6xl font-semibold tracking-tight text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-lg font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "This workspace view doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Back to Overview"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-semibold tracking-tight text-foreground",
					children: "This view didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong while rendering the workspace. Try again, or return to the overview."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$4 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Codebase AI Engineer — AI-Powered Repository Intelligence" },
			{
				name: "description",
				content: "Understand, search and analyze an entire codebase with retrieval-augmented AI, semantic code search and dependency analysis."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function ReindexDialogWrapper() {
	const { reindexDialogOpen, closeReindexDialog, startIngest, ingestPhase } = useAppState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReindexDialog, {
		open: reindexDialogOpen,
		loading: ingestPhase === "running",
		onConfirm: (url) => {
			closeReindexDialog();
			startIngest(url);
		},
		onCancel: closeReindexDialog
	});
}
function RootComponent() {
	const { queryClient } = Route$4.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppStateProvider, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-screen flex-col bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden w-[17rem] shrink-0 border-r border-sidebar-border lg:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sticky top-14 h-[calc(100vh-3.5rem)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "min-w-0 flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeViewerModal, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndexProgressDialog, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReindexDialogWrapper, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})
		] })
	});
}
var $$splitComponentImporter$3 = () => import("./routes-Cpb4R9IO.mjs");
var Route$3 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Repository Overview — Codebase AI Engineer" },
		{
			name: "description",
			content: "Repository intelligence overview: indexing health, code units parsed, vector embeddings and dependency insights."
		},
		{
			property: "og:title",
			content: "Repository Overview — Codebase AI Engineer"
		},
		{
			property: "og:description",
			content: "Indexing health, code units, embeddings and dependency insights in one dashboard."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./assistant-UGA5JAAR.mjs");
var Route$2 = createFileRoute("/assistant")({
	head: () => ({ meta: [
		{ title: "AI Code Assistant — Codebase AI Engineer" },
		{
			name: "description",
			content: "Ask questions about your repository using semantic search and retrieval-augmented generation, with source-level citations."
		},
		{
			property: "og:title",
			content: "AI Code Assistant — Codebase AI Engineer"
		},
		{
			property: "og:description",
			content: "Retrieval-augmented answers about your codebase with exact file and line citations."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./graph-BxK-OEkL.mjs");
var Route$1 = createFileRoute("/graph")({
	head: () => ({ meta: [
		{ title: "Repository Explorer — Codebase AI Engineer" },
		{
			name: "description",
			content: "Browse the folder and file structure of your indexed repository."
		},
		{
			property: "og:title",
			content: "Repository Explorer — Codebase AI Engineer"
		},
		{
			property: "og:description",
			content: "Explore directories and source code files of your repository."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./search-Bbkx2zFL.mjs");
var Route = createFileRoute("/search")({
	head: () => ({ meta: [
		{ title: "Semantic Code Search — Codebase AI Engineer" },
		{
			name: "description",
			content: "Find relevant code using meaning, not just keywords. Vector search across every indexed code unit in your repository."
		},
		{
			property: "og:title",
			content: "Semantic Code Search — Codebase AI Engineer"
		},
		{
			property: "og:description",
			content: "Vector-based code search across your indexed repository."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	AssistantRoute: Route$2.update({
		id: "/assistant",
		path: "/assistant",
		getParentRoute: () => Route$4
	}),
	GraphRoute: Route$1.update({
		id: "/graph",
		path: "/graph",
		getParentRoute: () => Route$4
	}),
	SearchRoute: Route.update({
		id: "/search",
		path: "/search",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { Button as a, api as c, languageFromPath as d, ApiError as i, cn as l, StatusDot as n, SAMPLE_QUERIES as o, useAppState as r, Skeleton as s, router_exports as t, formatNumber as u };
