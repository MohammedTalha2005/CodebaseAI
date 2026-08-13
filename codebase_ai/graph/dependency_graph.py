import ast
from dataclasses import dataclass, field
from typing import List, Dict, Any
from pathlib import Path
from codebase_ai.scanner.repo_scanner import RepoScanner, CodeFile


@dataclass
class CodeNode:
    id: str
    label: str
    type: str
    language: str
    size: int


@dataclass
class CodeEdge:
    source: str
    target: str
    type: str


@dataclass
class CodeGraph:
    nodes: List[CodeNode]
    edges: List[CodeEdge]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "nodes": [
                {
                    "id": n.id,
                    "label": n.label,
                    "type": n.type,
                    "language": n.language,
                    "size": n.size,
                }
                for n in self.nodes
            ],
            "edges": [
                {
                    "source": e.source,
                    "target": e.target,
                    "type": e.type,
                }
                for e in self.edges
            ],
        }


class DependencyGraphBuilder:
    """Builds a dependency graph connecting codebase modules and import linkages."""

    def __init__(self, scanner: RepoScanner = None):
        self.scanner = scanner or RepoScanner()

    def build_graph(self, repo_dir: str | Path) -> CodeGraph:
        code_files: List[CodeFile] = self.scanner.scan_directory(repo_dir)

        nodes_map: Dict[str, CodeNode] = {}
        edges: List[CodeEdge] = []

        file_paths_set = {cf.file_path for cf in code_files}

        for cf in code_files:
            nodes_map[cf.file_path] = CodeNode(
                id=cf.file_path,
                label=Path(cf.file_path).name,
                type="module",
                language=cf.language,
                size=len(cf.content.splitlines()),
            )

        for cf in code_files:
            if cf.language == "python":
                try:
                    tree = ast.parse(cf.content, filename=cf.file_path)
                    for node in ast.walk(tree):
                        module_target = None
                        if isinstance(node, ast.Import):
                            for alias in node.names:
                                module_target = alias.name.replace(".", "/") + ".py"
                        elif isinstance(node, ast.ImportFrom):
                            if node.module:
                                module_target = node.module.replace(".", "/") + ".py"

                        if module_target:
                            for known_path in file_paths_set:
                                if known_path.endswith(module_target) or module_target in known_path:
                                    if known_path != cf.file_path:
                                        edges.append(
                                            CodeEdge(
                                                source=cf.file_path,
                                                target=known_path,
                                                type="import",
                                            )
                                        )
                except Exception:
                    pass

        # Deduplicate edges
        unique_edges = []
        seen_pairs = set()
        for edge in edges:
            pair = (edge.source, edge.target)
            if pair not in seen_pairs:
                seen_pairs.add(pair)
                unique_edges.append(edge)

        return CodeGraph(nodes=list(nodes_map.values()), edges=unique_edges)
