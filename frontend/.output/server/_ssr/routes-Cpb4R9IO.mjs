import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Database, I as ArrowRight, O as Clock, _ as FolderTree, c as ScanSearch, l as RefreshCw, m as Layers, u as MessageSquareCode, x as FileCodeCorner, y as FolderGit2 } from "../_libs/lucide-react.mjs";
import { a as Button, n as StatusDot, r as useAppState, s as Skeleton, u as formatNumber } from "./router-CVZBfDPb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cpb4R9IO.js
var import_jsx_runtime = require_jsx_runtime();
function KpiCard({ label, value, icon: Icon, hint, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel panel-hover min-w-0 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 truncate text-xs font-medium text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 shrink-0 text-primary/80" })]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-8 w-20" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 truncate text-[11px] text-muted-foreground",
				children: hint
			})
		]
	});
}
function Overview() {
	const { status, statusLoading, backendOnline, startIngest, ingestPhase } = useAppState();
	const stats = status?.latest_stats ?? void 0;
	const indexed = (stats?.chunks_upserted ?? 0) > 0 || status?.indexed === true;
	const indexHealth = !backendOnline ? "offline" : indexed ? "healthy" : "warning";
	const repoName = status?.repo_name || status?.pinecone_index || "Unknown Repository";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[84rem] px-4 py-6 sm:px-6 lg:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "panel surface-gradient grid-backdrop overflow-hidden p-5 sm:p-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderGit2, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-medium text-muted-foreground",
									children: "Current Repository"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]",
								children: statusLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-48" }) : repoName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 max-w-xl text-sm text-muted-foreground",
								children: "Understand, search and analyze your entire codebase with AI."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 flex-col items-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDot, { health: indexHealth }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: !backendOnline ? "Disconnected" : indexed ? "Indexed" : "Awaiting index"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => startIngest(),
							disabled: ingestPhase === "running",
							className: "gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${ingestPhase === "running" ? "animate-spin" : ""}` }), "Re-index Repository"]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
					children: "Repository Overview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Files Indexed",
							value: formatNumber(stats?.files_scanned),
							icon: FileCodeCorner,
							hint: "Source files scanned by the ingestion pipeline",
							loading: statusLoading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Code Units",
							value: formatNumber(stats?.units_parsed),
							icon: Layers,
							hint: "Functions, classes and modules parsed from AST",
							loading: statusLoading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Vector Embeddings",
							value: formatNumber(stats?.chunks_upserted),
							icon: Database,
							hint: "Chunks upserted into the vector database",
							loading: statusLoading
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3",
				children: [
					{
						title: "Folder Structure",
						body: `Explore the directory hierarchy and browse source code files.`,
						icon: FolderTree,
						to: "/graph",
						cta: "Explore repository"
					},
					{
						title: "AI Code Assistant",
						body: `Ask natural language questions grounded in your repository code.`,
						icon: MessageSquareCode,
						to: "/assistant",
						cta: "Ask question"
					},
					{
						title: "Semantic Search",
						body: `${formatNumber(stats?.chunks_upserted)} vector embeddings available for code search.`,
						icon: ScanSearch,
						to: "/search",
						cta: "Search codebase"
					}
				].map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel panel-hover flex min-w-0 flex-col p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(card.icon, { className: "h-4 w-4 shrink-0 text-primary/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "min-w-0 truncate text-sm font-medium text-foreground",
								children: card.title
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 flex-1 text-xs leading-relaxed text-muted-foreground",
							children: card.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: card.to,
							className: "mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline",
							children: [card.cta, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
						})
					]
				}, card.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mt-8 flex items-center gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 truncate",
					children: "Codebase AI Engineer — Understand. Search. Analyze. Navigate."
				})]
			})
		]
	});
}
//#endregion
export { Overview as component };
