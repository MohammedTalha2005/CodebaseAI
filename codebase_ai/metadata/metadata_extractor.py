from typing import Dict, Any
from codebase_ai.chunker.code_chunker import ProcessedChunk


class MetadataExtractor:
    """Enriches and formats metadata for Pinecone storage."""

    @staticmethod
    def prepare_pinecone_metadata(chunk: ProcessedChunk) -> Dict[str, Any]:
        meta = dict(chunk.metadata)
        meta["lines_count"] = meta.get("end_line", 0) - meta.get("start_line", 0) + 1
        
        # Trim text snippet if extremely long to fit Pinecone metadata limits (40KB max per vector)
        raw_text = meta.get("text", "")
        if len(raw_text) > 8000:
            meta["text"] = raw_text[:8000] + "\n...[truncated]"

        return meta
