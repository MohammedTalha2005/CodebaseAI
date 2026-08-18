import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { F as ArrowUpRight, P as Bot, a as Sparkles, n as User, o as Send, r as TriangleAlert, w as CornerDownRight, x as FileCodeCorner } from "../_libs/lucide-react.mjs";
import { a as Button, d as languageFromPath, o as SAMPLE_QUERIES, r as useAppState, s as Skeleton } from "./router-CVZBfDPb.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assistant-UGA5JAAR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CitationCard({ citation }) {
	const { openFile } = useAppState();
	const segments = citation.file_path.split(/[\\/]/).filter(Boolean);
	const fileName = segments[segments.length - 1] ?? citation.file_path;
	const dir = segments.slice(0, -1).join("/");
	const open = () => openFile({
		filePath: citation.file_path,
		startLine: citation.start_line ?? null,
		endLine: citation.end_line ?? null
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel panel-hover group flex min-w-0 flex-col gap-2.5 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCodeCorner, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-baseline gap-1 font-mono text-xs",
					children: [dir ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate text-muted-foreground",
						children: [dir, "/"]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate font-medium text-foreground",
						children: fileName
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownRight, { className: "h-3 w-3" }), citation.unit_name ? `${citation.unit_name}` : "module scope"]
						}),
						citation.start_line != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-primary/90",
							children: [
								"Lines ",
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
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: open,
			className: "h-7 w-full justify-center gap-1.5 text-xs",
			children: ["Open Source", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3.5 w-3.5" })]
		})]
	});
}
function Assistant() {
	const { conversations, ask, askPending, pendingQuery } = useAppState();
	const [draft, setDraft] = (0, import_react.useState)("");
	const inputRef = (0, import_react.useRef)(null);
	const bottomRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		inputRef.current?.focus();
	}, []);
	(0, import_react.useEffect)(() => {
		bottomRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "end"
		});
	}, [conversations.length, askPending]);
	(0, import_react.useEffect)(() => {
		if (!askPending) inputRef.current?.focus();
	}, [askPending]);
	const submit = (e) => {
		e.preventDefault();
		if (!draft.trim() || askPending) return;
		ask(draft);
		setDraft("");
	};
	const isEmpty = conversations.length === 0 && !askPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-[calc(100vh-3.5rem)] min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 border-b border-border px-4 py-3.5 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-sm font-semibold text-foreground",
					children: "AI Code Assistant"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: "Ask questions about your repository using semantic search and retrieval-augmented generation."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6",
				children: isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-2xl flex-col items-center py-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-11 w-11 place-items-center rounded-lg border border-primary/25 bg-primary/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "h-5 w-5 text-primary" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 text-lg font-semibold tracking-tight text-foreground",
							children: "Ask anything about your codebase"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-lg text-sm text-muted-foreground",
							children: "Understand architecture, locate implementation details, trace dependencies, and explore unfamiliar code."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2",
							children: SAMPLE_QUERIES.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => ask(q),
								className: "panel panel-hover flex items-start gap-2 p-3 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 text-xs text-muted-foreground",
									children: q
								})]
							}, q))
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-3xl space-y-8",
					children: [
						conversations.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-end gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "max-w-[85%] rounded-lg rounded-tr-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground",
									children: msg.query
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-card",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3.5 w-3.5 text-muted-foreground" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-7 w-7 shrink-0 place-items-center rounded-md border border-primary/25 bg-primary/10",
									children: msg.failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5 text-destructive" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "h-3.5 w-3.5 text-primary" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "min-w-0 flex-1 animate-in fade-in slide-in-from-bottom-1 duration-300",
									children: msg.failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md border border-destructive/25 bg-destructive/10 p-3 text-xs text-foreground",
										children: [msg.answer, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												size: "sm",
												onClick: () => ask(msg.query),
												children: "Retry"
											})
										})]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "prose-answer min-w-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, { children: msg.answer })
									}), msg.citations && msg.citations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 border-t border-border pt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-2.5 flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCodeCorner, { className: "h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
												children: ["Source citations · ", msg.citations.length]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid grid-cols-1 gap-2.5 md:grid-cols-2",
											children: msg.citations.map((cit, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CitationCard, { citation: cit }, `${cit.file_path}-${i}`))
										})]
									})] })
								})]
							})]
						}, msg.id)),
						askPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-end gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "max-w-[85%] rounded-lg rounded-tr-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground",
									children: pendingQuery
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-card",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3.5 w-3.5 text-muted-foreground" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-7 w-7 shrink-0 place-items-center rounded-md border border-primary/25 bg-primary/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "h-3.5 w-3.5 animate-pulse text-primary" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-[72%]" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-[88%]" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-[54%]" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "pt-1 text-[11px] text-muted-foreground",
											children: "Analyzing repository…"
										})
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottomRef })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 border-t border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "mx-auto flex max-w-3xl items-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						ref: inputRef,
						rows: 1,
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								submit(e);
							}
						},
						placeholder: "Ask about architecture, modules, functions or dependencies…",
						className: "max-h-40 min-h-[2.5rem] w-full min-w-0 flex-1 resize-none rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						className: "h-10 w-10 shrink-0",
						disabled: askPending || !draft.trim(),
						"aria-label": "Send question",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-2 max-w-3xl text-[11px] text-muted-foreground",
					children: "Answers are grounded in retrieved source code · Enter to send, Shift+Enter for a new line"
				})]
			})
		]
	});
}
//#endregion
export { Assistant as component };
