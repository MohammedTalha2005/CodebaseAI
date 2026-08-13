from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from pinecone import Pinecone, ServerlessSpec
from codebase_ai.config import (
    PINECONE_API_KEY,
    PINECONE_INDEX_NAME,
    VECTOR_DIMENSION,
)


@dataclass
class QueryResult:
    chunk_id: str
    score: float
    metadata: Dict[str, Any]


class PineconeStore:
    """Manages Pinecone index creation, upserting, and vector searching."""

    def __init__(
        self,
        api_key: str = PINECONE_API_KEY,
        index_name: str = PINECONE_INDEX_NAME,
        dimension: int = VECTOR_DIMENSION,
    ):
        if not api_key:
            raise ValueError("PINECONE_API_KEY is not set in environment or configuration.")

        self.index_name = index_name
        self.dimension = dimension
        self.pc = Pinecone(api_key=api_key)
        self._index_handle = None
        self._ensure_index()

    @property
    def index(self):
        if self._index_handle is None:
            self._ensure_index()
            if self._index_handle is None:
                # Direct attempt fallback if index handle still None
                self._index_handle = self.pc.Index(self.index_name)
        return self._index_handle

    def _ensure_index(self):
        try:
            existing_indexes = [idx["name"] for idx in self.pc.list_indexes()]
            if self.index_name not in existing_indexes:
                self.pc.create_index(
                    name=self.index_name,
                    dimension=self.dimension,
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
                )
            if self._index_handle is None:
                self._index_handle = self.pc.Index(self.index_name)
        except Exception as e:
            print(f"[PineconeStore Warning] Could not connect to Pinecone index: {e}")



    def upsert_chunks(
        self,
        chunk_ids: List[str],
        vectors: List[List[float]],
        metadatas: List[Dict[str, Any]],
        batch_size: int = 100,
    ) -> int:
        vectors_to_upsert = []
        for c_id, vec, meta in zip(chunk_ids, vectors, metadatas):
            vectors_to_upsert.append({
                "id": c_id,
                "values": vec,
                "metadata": meta,
            })

        total_upserted = 0
        for i in range(0, len(vectors_to_upsert), batch_size):
            batch = vectors_to_upsert[i : i + batch_size]
            self.index.upsert(vectors=batch)
            total_upserted += len(batch)

        return total_upserted

    def query(
        self,
        query_vector: List[float],
        top_k: int = 5,
        metadata_filter: Optional[Dict[str, Any]] = None,
    ) -> List[QueryResult]:
        response = self.index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True,
            filter=metadata_filter,
        )

        results: List[QueryResult] = []
        for match in response.matches:
            results.append(
                QueryResult(
                    chunk_id=match.id,
                    score=match.score,
                    metadata=match.metadata,
                )
            )

        return results

    def clear_index(self):
        try:
            self.index.delete(delete_all=True)
        except Exception:
            # Ignore if index or namespace is empty
            pass
