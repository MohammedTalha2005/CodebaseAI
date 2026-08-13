import { useState, useRef, useEffect } from "react";
import { Github, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ReindexDialogProps {
  open: boolean;
  loading: boolean;
  onConfirm: (url: string) => void;
  onCancel: () => void;
}

function isValidGithubUrl(url: string): boolean {
  try {
    const trimmed = url.trim();
    if (
      !trimmed.startsWith("https://github.com/") &&
      !trimmed.startsWith("http://github.com/")
    ) {
      return false;
    }
    const withoutProtocol = trimmed.replace(/^https?:\/\/github\.com\//, "");
    const parts = withoutProtocol.replace(/\.git$/, "").split("/");
    return parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0;
  } catch {
    return false;
  }
}

const EXAMPLES = [
  "https://github.com/openai/whisper",
  "https://github.com/facebook/react",
];

export function ReindexDialog({
  open,
  loading,
  onConfirm,
  onCancel,
}: ReindexDialogProps) {
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const valid = isValidGithubUrl(url);
  const showError = touched && url.trim().length > 0 && !valid;

  useEffect(() => {
    if (open) {
      setUrl("");
      setTouched(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (valid) onConfirm(url.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reindex-dialog-title"
      onKeyDown={handleKeyDown}
    >
      <div className="panel w-full max-w-md overflow-hidden rounded-lg shadow-float animate-in slide-in-from-bottom-4 duration-200 mx-4">
        {/* Header */}
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Github className="h-4 w-4 text-primary" />
              <h2
                id="reindex-dialog-title"
                className="text-sm font-semibold text-foreground"
              >
                Index a GitHub Repository
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter a public GitHub repository URL to scan, parse, and index its
            source code.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="github-url-input"
              className="text-xs font-medium text-foreground"
            >
              Repository URL
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                id="github-url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="https://github.com/owner/repository"
                className={cn(
                  "pl-9 font-mono text-xs",
                  showError && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={loading}
                autoComplete="url"
                spellCheck={false}
              />
            </div>

            {showError ? (
              <div className="flex items-center gap-1.5 text-xs text-destructive animate-in fade-in duration-150">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Please enter a valid GitHub URL (e.g.
                  https://github.com/owner/repo)
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Only GitHub repositories are supported. Local paths are not
                allowed.
              </p>
            )}
          </div>

          {/* Example chips */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Examples
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setUrl(ex);
                    setTouched(false);
                  }}
                  className="rounded border border-border bg-secondary/50 px-2 py-1 font-mono text-[10px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {ex.replace("https://github.com/", "")}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-elevated/50 px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
            disabled={loading || !valid}
            className="min-w-[100px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Indexing…
              </>
            ) : (
              <>
                <Github className="mr-2 h-3.5 w-3.5" />
                Index Repo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
