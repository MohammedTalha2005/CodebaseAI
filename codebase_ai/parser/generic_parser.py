from typing import List
from codebase_ai.scanner.repo_scanner import CodeFile
from codebase_ai.parser.base_parser import BaseParser, CodeUnit


class GenericParser(BaseParser):
    """Line-based sliding-window parser fallback for non-AST supported files."""

    def __init__(self, max_lines_per_chunk: int = 40, overlap_lines: int = 10):
        self.max_lines_per_chunk = max_lines_per_chunk
        self.overlap_lines = overlap_lines

    def parse(self, code_file: CodeFile) -> List[CodeUnit]:
        lines = code_file.content.splitlines()
        if not lines:
            return []

        total_lines = len(lines)

        # If file is small enough, return as a single unit
        if total_lines <= self.max_lines_per_chunk:
            return [
                CodeUnit(
                    file_path=code_file.file_path,
                    unit_name=f"{code_file.file_path}:L1-{total_lines}",
                    unit_type="chunk",
                    start_line=1,
                    end_line=total_lines,
                    code_text=code_file.content,
                    language=code_file.language,
                )
            ]

        code_units: List[CodeUnit] = []
        step = max(1, self.max_lines_per_chunk - self.overlap_lines)

        idx = 0
        chunk_number = 1

        while idx < total_lines:
            end_idx = min(idx + self.max_lines_per_chunk, total_lines)
            chunk_lines = lines[idx:end_idx]
            start_l = idx + 1
            end_l = end_idx

            snippet = "\n".join(chunk_lines)
            unit_name = f"{code_file.file_path}:chunk_{chunk_number} (L{start_l}-{end_l})"

            code_units.append(
                CodeUnit(
                    file_path=code_file.file_path,
                    unit_name=unit_name,
                    unit_type="chunk",
                    start_line=start_l,
                    end_line=end_l,
                    code_text=snippet,
                    language=code_file.language,
                )
            )

            if end_idx == total_lines:
                break

            idx += step
            chunk_number += 1

        return code_units
