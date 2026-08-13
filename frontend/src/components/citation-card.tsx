import { ArrowUpRight, CornerDownRight, FileCode2 } from "lucide-react";
import { type Citation, languageFromPath } from "@/lib/api";
import { useAppState } from "@/lib/app-state";
import { Button } from "@/components/ui/button";

export function CitationCard({ citation }: { citation: Citation }) {
  const { openFile } = useAppState();
  const segments = citation.file_path.split(/[\\/]/).filter(Boolean);
  const fileName = segments[segments.length - 1] ?? citation.file_path;
  const dir = segments.slice(0, -1).join("/");

  const open = () =>
    openFile({
      filePath: citation.file_path,
      startLine: citation.start_line ?? null,
      endLine: citation.end_line ?? null,
    });

  return (
    <div className="panel panel-hover group flex min-w-0 flex-col gap-2.5 p-3">
      <div className="flex min-w-0 items-start gap-2">
        <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-1 font-mono text-xs">
            {dir ? <span className="truncate text-muted-foreground">{dir}/</span> : null}
            <span className="truncate font-medium text-foreground">{fileName}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CornerDownRight className="h-3 w-3" />
              {citation.unit_name ? `${citation.unit_name}` : "module scope"}
            </span>
            {citation.start_line != null && (
              <span className="text-primary/90">
                Lines {citation.start_line}–{citation.end_line ?? citation.start_line}
              </span>
            )}
            <span className="opacity-70">{languageFromPath(citation.file_path)}</span>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={open}
        className="h-7 w-full justify-center gap-1.5 text-xs"
      >
        Open Source
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
