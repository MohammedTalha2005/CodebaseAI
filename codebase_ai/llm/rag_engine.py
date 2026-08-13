from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from codebase_ai.vectorstore.pinecone_store import QueryResult
from codebase_ai.llm.llm_client import LLMClient


@dataclass
class CodeCitation:
    file_path: str
    start_line: int
    end_line: int
    unit_name: str
    unit_type: str
    score: float
    code_snippet: str


@dataclass
class RAGResponse:
    query: str
    answer: str
    citations: List[CodeCitation]


class RAGEngine:
    """Code Retrieval-Augmented Generation (RAG) engine."""

    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()

    def generate_answer(self, query: str, search_results: List[QueryResult]) -> RAGResponse:
        import re

        all_citations: List[CodeCitation] = []
        context_blocks: List[str] = []

        for idx, res in enumerate(search_results, 1):
            meta = res.metadata
            file_path = meta.get("file_path", "unknown")
            start_l = int(meta.get("start_line", 1))
            end_l = int(meta.get("end_line", 1))
            unit_name = meta.get("unit_name", "")
            unit_type = meta.get("unit_type", "")
            text = meta.get("text", "")

            citation = CodeCitation(
                file_path=file_path,
                start_line=start_l,
                end_line=end_l,
                unit_name=unit_name,
                unit_type=unit_type,
                score=res.score,
                code_snippet=text,
            )
            all_citations.append(citation)

            block = (
                f"--- CITATION [{idx}] ---\n"
                f"File: {file_path} (Lines {start_l}-{end_l})\n"
                f"Unit Name: {unit_name} ({unit_type})\n"
                f"Code:\n```\n{text}\n```\n"
            )
            context_blocks.append(block)

        context_str = "\n\n".join(context_blocks)
        system_prompt = (
            "You are an expert AI Software Engineer. Analyze the provided codebase context snippets "
            "and answer the user's question accurately. Reference specific file paths and line numbers "
            "where relevant. When citing a source from the context, reference it using its citation "
            "number in square brackets, e.g. [1] or [2]. Only cite sources that are directly relevant "
            "to your answer — do not mention sources that are not pertinent to the question."
        )

        user_prompt = (
            f"USER QUESTION: {query}\n\n"
            f"RELEVANT CODEBASE CONTEXT:\n{context_str}\n\n"
            "Provide a clear, detailed technical explanation answering the question. "
            "Use [N] notation to reference citation numbers that are directly relevant."
        )

        llm_answer = self.llm_client.generate(user_prompt, system_prompt=system_prompt)

        if not llm_answer:
            # Fallback reasoning synthesis
            llm_answer = self._synthesize_local_answer(query, all_citations)
            return RAGResponse(query=query, answer=llm_answer, citations=all_citations)

        # Filter citations to only those the LLM actually referenced in its answer
        referenced_indices = {int(m) for m in re.findall(r'\[(\d+)\]', llm_answer)}
        if referenced_indices:
            filtered_citations = [
                c for i, c in enumerate(all_citations, 1)
                if i in referenced_indices
            ]
        else:
            # LLM didn't use [N] notation — fall back to top result only
            filtered_citations = all_citations[:1] if all_citations else []

        return RAGResponse(
            query=query,
            answer=llm_answer,
            citations=filtered_citations,
        )

    def _synthesize_local_answer(self, query: str, citations: List[CodeCitation]) -> str:
        if not citations:
            return "No relevant code snippets were found in the indexed repository for your query."

        primary = citations[0]
        summary_lines = [
            f"Based on repository intelligence search for **\"{query}\"**:\n",
            f"### Primary Implementation Source",
            f"- **File**: `{primary.file_path}` (Lines {primary.start_line}–{primary.end_line})",
            f"- **Component**: `{primary.unit_name}` (`{primary.unit_type}`)",
            f"- **Relevance Score**: `{primary.score:.4f}`\n",
            "```python",
            primary.code_snippet[:600] + ("\n..." if len(primary.code_snippet) > 600 else ""),
            "```\n",
        ]

        if len(citations) > 1:
            summary_lines.append("### Related Code References")
            for c in citations[1:]:
                summary_lines.append(
                    f"- **`{c.file_path}`** lines {c.start_line}–{c.end_line} (`{c.unit_name}`)"
                )

        return "\n".join(summary_lines)
