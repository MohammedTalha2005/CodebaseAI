import { createFileRoute } from "@tanstack/react-router";
import { Bot, FileCode2, Send, Sparkles, TriangleAlert, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { SAMPLE_QUERIES } from "@/lib/api";
import { useAppState } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CitationCard } from "@/components/citation-card";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Code Assistant — Codebase AI Engineer" },
      {
        name: "description",
        content:
          "Ask questions about your repository using semantic search and retrieval-augmented generation, with source-level citations.",
      },
      { property: "og:title", content: "AI Code Assistant — Codebase AI Engineer" },
      {
        property: "og:description",
        content: "Retrieval-augmented answers about your codebase with exact file and line citations.",
      },
    ],
  }),
  component: Assistant,
});

function Assistant() {
  const { conversations, ask, askPending, pendingQuery } = useAppState();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversations.length, askPending]);

  useEffect(() => {
    if (!askPending) inputRef.current?.focus();
  }, [askPending]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || askPending) return;
    ask(draft);
    setDraft("");
  };

  const isEmpty = conversations.length === 0 && !askPending;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3.5 sm:px-6">
        <h1 className="text-sm font-semibold text-foreground">AI Code Assistant</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Ask questions about your repository using semantic search and retrieval-augmented
          generation.
        </p>
      </div>

      {/* Conversation */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {isEmpty ? (
          <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-lg border border-primary/25 bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
              Ask anything about your codebase
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Understand architecture, locate implementation details, trace dependencies, and explore
              unfamiliar code.
            </p>

            <div className="mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {SAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="panel panel-hover flex items-start gap-2 p-3 text-left"
                >
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" />
                  <span className="min-w-0 text-xs text-muted-foreground">{q}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-8">
            {conversations.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User */}
                <div className="flex items-start justify-end gap-2.5">
                  <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                    {msg.query}
                  </div>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-card">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                </div>

                {/* Assistant */}
                <div className="flex items-start gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-primary/25 bg-primary/10">
                    {msg.failed ? (
                      <TriangleAlert className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    {msg.failed ? (
                      <div className="rounded-md border border-destructive/25 bg-destructive/10 p-3 text-xs text-foreground">
                        {msg.answer}
                        <div className="mt-2">
                          <Button variant="outline" size="sm" onClick={() => ask(msg.query)}>
                            Retry
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="prose-answer min-w-0">
                          <ReactMarkdown>{msg.answer}</ReactMarkdown>
                        </div>

                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 border-t border-border pt-4">
                            <div className="mb-2.5 flex items-center gap-2">
                              <FileCode2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Source citations · {msg.citations.length}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                              {msg.citations.map((cit, i) => (
                                <CitationCard key={`${cit.file_path}-${i}`} citation={cit} />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {askPending && (
              <div className="space-y-4">
                <div className="flex items-start justify-end gap-2.5">
                  <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                    {pendingQuery}
                  </div>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-card">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-primary/25 bg-primary/10">
                    <Bot className="h-3.5 w-3.5 animate-pulse text-primary" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-[72%]" />
                    <Skeleton className="h-3 w-[88%]" />
                    <Skeleton className="h-3 w-[54%]" />
                    <p className="pt-1 text-[11px] text-muted-foreground">Analyzing repository…</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <form onSubmit={submit} className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e);
              }
            }}
            placeholder="Ask about architecture, modules, functions or dependencies…"
            className="max-h-40 min-h-[2.5rem] w-full min-w-0 flex-1 resize-none rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={askPending || !draft.trim()}
            aria-label="Send question"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-[11px] text-muted-foreground">
          Answers are grounded in retrieved source code · Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
