import ast
from typing import List, Optional
from codebase_ai.scanner.repo_scanner import CodeFile
from codebase_ai.parser.base_parser import BaseParser, CodeUnit


class PythonParser(BaseParser):
    """AST-based code parser for Python source files."""

    def parse(self, code_file: CodeFile) -> List[CodeUnit]:
        code_text = code_file.content
        lines = code_text.splitlines()
        code_units: List[CodeUnit] = []

        try:
            tree = ast.parse(code_text, filename=code_file.file_path)
        except SyntaxError:
            # Fallback if Python file has syntax errors
            return self._create_file_fallback(code_file, lines)

        # Collect top-level imports
        file_imports: List[str] = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    file_imports.append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    file_imports.append(node.module)

        # Helper to extract exact lines for AST nodes
        def get_source_lines(start_line: int, end_line: int) -> str:
            sub_lines = lines[start_line - 1 : end_line]
            return "\n".join(sub_lines)

        # Module docstring
        module_docstring = ast.get_docstring(tree)

        class ASTVisitor(ast.NodeVisitor):
            def __init__(self):
                self.current_class: Optional[str] = None

            def visit_ClassDef(self, node: ast.ClassDef):
                docstring = ast.get_docstring(node)
                start_l = getattr(node, "lineno", 1)
                end_l = getattr(node, "end_lineno", len(lines))
                
                snippet = get_source_lines(start_l, end_l)
                code_units.append(
                    CodeUnit(
                        file_path=code_file.file_path,
                        unit_name=node.name,
                        unit_type="class",
                        start_line=start_l,
                        end_line=end_l,
                        code_text=snippet,
                        language="python",
                        parent_class=None,
                        imports=file_imports,
                        docstring=docstring,
                    )
                )

                old_class = self.current_class
                self.current_class = node.name
                self.generic_visit(node)
                self.current_class = old_class

            def _visit_function(self, node: ast.FunctionDef | ast.AsyncFunctionDef):
                docstring = ast.get_docstring(node)
                start_l = getattr(node, "lineno", 1)
                end_l = getattr(node, "end_lineno", len(lines))

                snippet = get_source_lines(start_l, end_l)
                unit_type = "method" if self.current_class else "function"

                code_units.append(
                    CodeUnit(
                        file_path=code_file.file_path,
                        unit_name=node.name,
                        unit_type=unit_type,
                        start_line=start_l,
                        end_line=end_l,
                        code_text=snippet,
                        language="python",
                        parent_class=self.current_class,
                        imports=file_imports,
                        docstring=docstring,
                    )
                )

            def visit_FunctionDef(self, node: ast.FunctionDef):
                self._visit_function(node)

            def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
                self._visit_function(node)

        visitor = ASTVisitor()
        visitor.visit(tree)

        # If no classes or functions were found, create a module-level unit
        if not code_units:
            return self._create_file_fallback(code_file, lines, file_imports, module_docstring)

        return code_units

    def _create_file_fallback(
        self,
        code_file: CodeFile,
        lines: List[str],
        imports: Optional[List[str]] = None,
        docstring: Optional[str] = None,
    ) -> List[CodeUnit]:
        return [
            CodeUnit(
                file_path=code_file.file_path,
                unit_name=code_file.file_path,
                unit_type="module",
                start_line=1,
                end_line=len(lines),
                code_text=code_file.content,
                language="python",
                parent_class=None,
                imports=imports or [],
                docstring=docstring,
            )
        ]
