import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { D as CodeXml, M as ChevronDown, _ as FolderTree, b as FileText, g as Folder, j as ChevronRight, l as RefreshCw, s as Search, v as FolderOpen, x as FileCodeCorner } from "../_libs/lucide-react.mjs";
import { a as Button, c as api, d as languageFromPath, l as cn, s as Skeleton } from "./router-CVZBfDPb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/graph-BxK-OEkL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TreeItem({ node, selectedFile, onSelectFile, filter }) {
	const [open, setOpen] = (0, import_react.useState)(true);
	if (node.type === "folder") {
		if (!(node.children && node.children.length > 0)) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "select-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setOpen(!open),
				className: "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground",
				children: [
					open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5 shrink-0 opacity-70" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5 shrink-0 opacity-70" }),
					open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "h-4 w-4 shrink-0 text-amber-500/80" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "h-4 w-4 shrink-0 text-amber-500/80" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: node.name
					})
				]
			}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ml-3.5 border-l border-border/40 pl-1.5 space-y-0.5 mt-0.5",
				children: node.children?.map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeItem, {
					node: child,
					selectedFile,
					onSelectFile,
					filter
				}, child.path || child.name))
			})]
		});
	}
	if (filter.trim() && !node.name.toLowerCase().includes(filter.trim().toLowerCase())) return null;
	const isSelected = selectedFile === node.path;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: () => onSelectFile(node.path),
		className: cn("flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors", isSelected ? "bg-primary/15 font-medium text-primary" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCodeCorner, { className: cn("h-3.5 w-3.5 shrink-0", isSelected ? "text-primary" : "text-muted-foreground/70") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate font-mono",
				children: node.name
			})]
		}), node.lines !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "shrink-0 font-mono text-[10px] opacity-60",
			children: [node.lines, " ln"]
		})]
	});
}
function RepositoryExplorer() {
	const [selectedFile, setSelectedFile] = (0, import_react.useState)(null);
	const [filter, setFilter] = (0, import_react.useState)("");
	const treeQuery = useQuery({
		queryKey: ["tree"],
		queryFn: () => api.tree(),
		retry: false
	});
	const fileQuery = useQuery({
		queryKey: ["file", selectedFile],
		queryFn: () => api.file(selectedFile),
		enabled: Boolean(selectedFile)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-[calc(100vh-3.5rem)] min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0 border-b border-border px-4 py-3.5 sm:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderTree, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-sm font-semibold text-foreground",
							children: "Repository Explorer"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 truncate text-xs text-muted-foreground",
						children: "Browse the folder hierarchy and source files of the active repository."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: filter,
							onChange: (e) => setFilter(e.target.value),
							placeholder: "Filter files...",
							className: "w-28 bg-transparent outline-none placeholder:text-muted-foreground sm:w-40"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "h-7 gap-1.5 text-xs",
						onClick: () => void treeQuery.refetch(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("h-3.5 w-3.5", treeQuery.isFetching && "animate-spin") }), "Refresh"]
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-h-0 flex-1 grid-cols-1 divide-y divide-border lg:grid-cols-[20rem_1fr] lg:divide-x lg:divide-y-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-col bg-sidebar/50 p-3 overflow-y-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
					children: "Folder Structure"
				}), treeQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2 p-1",
					children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-full" }, i))
				}) : treeQuery.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeItem, {
					node: treeQuery.data,
					selectedFile,
					onSelectFile: setSelectedFile,
					filter
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 text-center text-xs text-muted-foreground",
					children: "No repository structure available. Re-index a repository to explore files."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-h-0 flex-col overflow-hidden bg-card/30",
				children: selectedFile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-full flex-col min-h-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeXml, { className: "h-4 w-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate font-mono text-xs font-medium text-foreground",
								children: selectedFile
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground",
							children: languageFromPath(selectedFile)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed",
						children: fileQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: Array.from({ length: 15 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" }, i))
						}) : fileQuery.data?.content ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "text-foreground/90 font-mono text-xs whitespace-pre-wrap break-all",
							children: fileQuery.data.content
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-muted-foreground italic",
							children: "File content empty or unavailable."
						})
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-10 w-10 text-muted-foreground/40 mb-3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-foreground",
							children: "Select a file to view content"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs max-w-sm",
							children: "Click any file in the folder structure on the left to inspect its source code."
						})
					]
				})
			})]
		})]
	});
}
//#endregion
export { RepositoryExplorer as component };
