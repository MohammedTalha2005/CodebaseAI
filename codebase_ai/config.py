import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "codebase-ai")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
VECTOR_DIMENSION = 384

DEFAULT_IGNORE_DIRS = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "__pycache__",
    "build",
    "dist",
    ".egg-info",
    ".idea",
    ".vscode",
    ".gemini",
    ".pytest_cache",
    "cloned_repos",
}

DEFAULT_IGNORE_FILES = {
    ".env",
    ".ds_store",
    "thumbs.db",
    "package-lock.json",
    "yarn.lock",
}

# Binary media, compiled outputs, and archives to ignore by default
DEFAULT_IGNORE_EXTENSIONS = {
    ".pyc", ".pyo", ".pyd",
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".bmp", ".tiff",
    ".mp3", ".mp4", ".wav", ".avi", ".mov", ".flv", ".webm",
    ".zip", ".tar", ".gz", ".7z", ".rar", ".bz2", ".xz",
    ".exe", ".dll", ".so", ".dylib", ".bin", ".o", ".a", ".obj",
    ".class", ".jar",
    ".db", ".sqlite", ".sqlite3",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
}

# None means allow all non-ignored file extensions by default
DEFAULT_ALLOWED_EXTENSIONS = None


