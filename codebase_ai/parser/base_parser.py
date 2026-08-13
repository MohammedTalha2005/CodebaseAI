from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
from codebase_ai.scanner.repo_scanner import CodeFile


@dataclass
class CodeUnit:
    file_path: str
    unit_name: str
    unit_type: str         # 'function', 'class', 'method', 'module', 'chunk'
    start_line: int
    end_line: int
    code_text: str
    language: str
    parent_class: Optional[str] = None
    imports: List[str] = field(default_factory=list)
    docstring: Optional[str] = None


class BaseParser(ABC):
    """Abstract base class for all language-specific AST/code parsers."""

    @abstractmethod
    def parse(self, code_file: CodeFile) -> List[CodeUnit]:
        """Parses a CodeFile into structural CodeUnit nodes."""
        pass
