from typing import List, Optional, Dict, Any
from codebase_ai.embeddings.embedder import CodeEmbedder
from codebase_ai.vectorstore.pinecone_store import PineconeStore, QueryResult


class CodeRetriever:
    """Performs semantic similarity retrieval over indexed codebase vectors."""

    def __init__(self, embedder: Optional[CodeEmbedder] = None, vector_store: Optional[PineconeStore] = None):
        self.embedder = embedder or CodeEmbedder()
        self.vector_store = vector_store or PineconeStore()

    def search(
        self,
        query: str,
        top_k: int = 5,
        metadata_filter: Optional[Dict[str, Any]] = None,
    ) -> List[QueryResult]:
        query_vector = self.embedder.encode_text(query)
        return self.vector_store.query(
            query_vector=query_vector,
            top_k=top_k,
            metadata_filter=metadata_filter,
        )
