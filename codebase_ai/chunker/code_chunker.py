import hashlib
from dataclasses import dataclass
from typing import Dict, Any, List
from codebase_ai.parser.base_parser import CodeUnit


@dataclass
class ProcessedChunk:
    chunk_id: str
    formatted_text: str
    metadata: Dict[str, Any]


class CodeChunker:
    """Prepares structured CodeUnit objects into contextualized, vectorizable chunks."""

    def __init__(self, max_token_length: int = 1000):
        self.max_token_length = max_token_length

    def create_chunk_id(self, unit: CodeUnit) -> str:
        raw_key = f"{unit.file_path}::{unit.unit_name}::{unit.start_line}-{unit.end_line}"
        hash_suffix = hashlib.md5(raw_key.encode("utf-8")).hexdigest()[:8]
        clean_path = unit.file_path.replace("/", "_").replace("\\", "_").replace(".", "_")
        clean_name = unit.unit_name.replace(" ", "_")
        return f"{clean_path}__{clean_name}__{hash_suffix}"

    def build_context_header(self, unit: CodeUnit) -> str:
        header_lines = [
            f"# File: {unit.file_path}",
            f"# Language: {unit.language} | Type: {unit.unit_type} | Name: {unit.unit_name} | Lines: {unit.start_line}-{unit.end_line}"
        ]
        if unit.parent_class:
            header_lines.append(f"# Parent Class: {unit.parent_class}")
        if unit.imports:
            header_lines.append(f"# Imports: {', '.join(unit.imports[:10])}")
        if unit.docstring:
            first_line_doc = unit.docstring.strip().splitlines()[0]
            header_lines.append(f"# Docstring: {first_line_doc}")

        return "\n".join(header_lines) + "\n\n"

    def process_unit(self, unit: CodeUnit) -> ProcessedChunk:
        chunk_id = self.create_chunk_id(unit)
        header = self.build_context_header(unit)
        formatted_text = header + unit.code_text

        metadata: Dict[str, Any] = {
            "file_path": unit.file_path,
            "unit_name": unit.unit_name,
            "unit_type": unit.unit_type,
            "start_line": unit.start_line,
            "end_line": unit.end_line,
            "language": unit.language,
            "parent_class": unit.parent_class or "",
            "imports": unit.imports,
            "text": unit.code_text,
        }

        return ProcessedChunk(
            chunk_id=chunk_id,
            formatted_text=formatted_text,
            metadata=metadata,
        )

    def process_units(self, units: List[CodeUnit]) -> List[ProcessedChunk]:
        return [self.process_unit(u) for u in units]
