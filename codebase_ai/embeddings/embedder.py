from typing import List, Optional
from sentence_transformers import SentenceTransformer
from codebase_ai.config import EMBEDDING_MODEL_NAME


class CodeEmbedder:
    """Wrapper for SentenceTransformer embedding models."""

    _instance: Optional[SentenceTransformer] = None

    def __init__(self, model_name: str = EMBEDDING_MODEL_NAME, batch_size: int = 64):
        self.model_name = model_name
        self.batch_size = batch_size
        if CodeEmbedder._instance is None:
            CodeEmbedder._instance = SentenceTransformer(model_name)
        self.model = CodeEmbedder._instance

    def encode_text(self, text: str) -> List[float]:
        vector = self.model.encode(text, convert_to_numpy=True)
        return vector.tolist()

    def encode_batch(self, texts: List[str], batch_size: Optional[int] = None) -> List[List[float]]:
        bs = batch_size if batch_size is not None else self.batch_size
        vectors = self.model.encode(texts, batch_size=bs, convert_to_numpy=True, show_progress_bar=False)
        return vectors.tolist()
