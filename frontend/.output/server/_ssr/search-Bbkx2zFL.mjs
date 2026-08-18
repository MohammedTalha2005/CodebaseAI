import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as Command, F as ArrowUpRight, c as ScanSearch, s as Search, x as FileCodeCorner } from "../_libs/lucide-react.mjs";
import { a as Button, c as api, d as languageFromPath, i as ApiError, r as useAppState, s as Skeleton } from "./router-CVZBfDPb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-Bbkx2zFL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function relevance(score) {
	if (score === null || score === void 0 || Number.isNaN(score)) return null;
	const pct = score <= 1 ? score * 100 : score;
	return Math.max(0, Math.min(100, Math.round(pct)));
}
function ResultCard({ citation }) {
	const { openFile } = useAppState();
	const segments = citation.file_path.split(/[\\/]/).filter(Boolean);
	const fileName = segments[segments.length - 1] ?? citation.file_path;
	const dir = segments.slice(0, -1).join("/");
	const rel = relevance(citation.score);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "panel panel-hover min-w-0 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCodeCorner, { className: "h-4 w-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 truncate font-mono text-xs",
						children: [dir ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [dir, "/"]
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: fileName
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground/90",
							children: citation.unit_name ? citation.unit_name : "module scope"
						}),
						citation.start_line != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-primary/90",
							children: [
								"L",
								citation.start_line,
								"–",
								citation.end_line ?? citation.start_line
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "opacity-70",
							children: languageFromPath(citation.file_path)
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col items-end gap-2",
				children: [rel !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 text-right font-mono text-[11px] text-foreground",
						children: [rel, "% relevance"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1 w-full overflow-hidden rounded-full bg-secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-primary",
							style: { width: `${rel}%` }
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "h-7 gap-1.5 text-xs",
					onClick: () => openFile({
						filePath: citation.file_path,
						startLine: citation.start_line ?? null,
						endLine: citation.end_line ?? null
					}),
					children: ["Open Source", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3.5 w-3.5" })]
				})]
			})]
		}), citation.snippet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "mt-3 max-h-32 overflow-auto rounded-md border border-border bg-background/60 p-3 font-mono text-[11.5px] leading-relaxed text-foreground/85",
			children: citation.snippet
		}) : null]
	});
}
function SemanticSearch() {
	const [term, setTerm] = (0, import_react.useState)("");
	const [submitted, setSubmitted] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	const searchMutation = useMutation({
		mutationFn: (query) => api.ask(query, 8),
		onSuccess: (data) => {
			toast.success("Search completed", { description: `${data.citations?.length ?? 0} matching code units retrieved.` });
		},
		onError: (error) => {
			const apiErr = error instanceof ApiError ? error : null;
			toast.error(apiErr?.friendly ?? "Search failed", { description: apiErr?.hint ?? "The search request could not be completed." });
		}
	});
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const submit = (e) => {
		e.preventDefault();
		const q = term.trim();
		if (!q || searchMutation.isPending) return;
		setSubmitted(q);
		searchMutation.mutate(q);
	};
	const results = searchMutation.data?.citations ?? [];
	const apiErr = searchMutation.error instanceof ApiError ? searchMutation.error : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[76rem] px-4 py-6 sm:px-6 lg:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-semibold tracking-tight text-foreground",
					children: "Semantic Code Search"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Find relevant code using meaning, not just keywords."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "panel mt-5 flex items-center gap-2 p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "ml-1.5 h-4 w-4 shrink-0 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						type: "text",
						value: term,
						onChange: (e) => setTerm(e.target.value),
						placeholder: "Search your codebase...",
						className: "min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden shrink-0 items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command, { className: "h-3 w-3" }), "K"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "sm",
						disabled: searchMutation.isPending || !term.trim(),
						children: searchMutation.isPending ? "Searching…" : "Search"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: searchMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel space-y-3 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-1/3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" })
						]
					}, i))
				}) : apiErr ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel flex flex-col items-center gap-3 p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-foreground",
							children: apiErr.friendly
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-md text-xs text-muted-foreground",
							children: apiErr.hint
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => submitted && searchMutation.mutate(submitted),
							children: "Retry"
						})
					]
				}) : submitted === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel grid-backdrop flex flex-col items-center gap-2 p-10 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanSearch, { className: "h-6 w-6 text-primary/80" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-foreground",
							children: "Search across every indexed unit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-md text-xs text-muted-foreground",
							children: "Vector retrieval ranks functions, classes and modules by semantic similarity to your query."
						})
					]
				}) : results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel flex flex-col items-center gap-2 p-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-foreground",
						children: "No matching code units"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-md text-xs text-muted-foreground",
						children: "Try a broader description, or re-index the repository if it has changed."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 flex items-center justify-between gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "min-w-0 truncate text-xs text-muted-foreground",
							children: [
								results.length,
								" results for",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-foreground",
									children: [
										"“",
										submitted,
										"”"
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: results.map((cit, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCard, { citation: cit }, `${cit.file_path}-${i}`))
					}),
					searchMutation.data?.answer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel mt-4 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
							children: "Retrieval summary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs leading-relaxed text-muted-foreground",
							children: [searchMutation.data.answer.slice(0, 420), searchMutation.data.answer.length > 420 ? "…" : ""]
						})]
					}) : null
				] })
			})
		]
	});
}
//#endregion
export { SemanticSearch as component };
