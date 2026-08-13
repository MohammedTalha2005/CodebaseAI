import os
import fnmatch
import subprocess
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import List, Set, Optional
from codebase_ai.config import (
    DEFAULT_IGNORE_DIRS,
    DEFAULT_IGNORE_FILES,
    DEFAULT_IGNORE_EXTENSIONS,
    DEFAULT_ALLOWED_EXTENSIONS,
)

EXTENSION_TO_LANGUAGE = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".java": "java",
    ".c": "c",
    ".h": "c",
    ".cpp": "cpp",
    ".hpp": "cpp",
    ".cs": "csharp",
    ".go": "go",
    ".rs": "rust",
    ".rb": "ruby",
    ".php": "php",
    ".html": "html",
    ".htm": "html",
    ".css": "css",
    ".scss": "scss",
    ".sql": "sql",
    ".sh": "bash",
    ".bash": "bash",
    ".zsh": "bash",
    ".xml": "xml",
    ".toml": "toml",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".json": "json",
    ".csv": "csv",
    ".tsv": "csv",
    ".pkl": "pickle",
    ".pickle": "pickle",
    ".md": "markdown",
    ".txt": "plaintext",
    ".ini": "ini",
    ".cfg": "ini",
    ".conf": "ini",
}


@dataclass
class CodeFile:
    file_path: str        # Relative path (e.g., "backend/auth.py")
    absolute_path: Path
    extension: str
    language: str
    content: str


class RepoScanner:
    """Scans a local repository or clones and scans a GitHub repository URL."""

    def __init__(
        self,
        allowed_extensions: Optional[Set[str]] = None,
        ignore_dirs: Optional[Set[str]] = None,
        ignore_files: Optional[Set[str]] = None,
        ignore_extensions: Optional[Set[str]] = None,
    ):
        self.allowed_extensions = allowed_extensions or DEFAULT_ALLOWED_EXTENSIONS
        self.ignore_dirs = ignore_dirs or DEFAULT_IGNORE_DIRS
        self.ignore_files = ignore_files or DEFAULT_IGNORE_FILES
        self.ignore_extensions = ignore_extensions or DEFAULT_IGNORE_EXTENSIONS

    def _safe_remove_dir(self, dir_path: Path):
        if not dir_path.exists():
            return
        import stat
        try:
            for root, dirs, files in os.walk(dir_path, topdown=False):
                for file in files:
                    p = os.path.join(root, file)
                    try:
                        os.chmod(p, stat.S_IWRITE)
                        os.remove(p)
                    except Exception:
                        pass
                for d in dirs:
                    p = os.path.join(root, d)
                    try:
                        os.chmod(p, stat.S_IWRITE)
                        os.rmdir(p)
                    except Exception:
                        pass
            os.chmod(dir_path, stat.S_IWRITE)
            shutil.rmtree(dir_path, ignore_errors=True)
        except Exception:
            pass

    def _is_valid_repo_dir(self, target_dir: Path) -> bool:
        if not target_dir.exists() or not target_dir.is_dir():
            return False
        # Check if there is at least one non-ignored code file
        for root, dirs, files in os.walk(target_dir):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs and not d.startswith(".")]
            for file in files:
                if file in self.ignore_files or file.startswith("."):
                    continue
                ext = Path(file).suffix.lower()
                if self.ignore_extensions and ext in self.ignore_extensions:
                    continue
                if self.allowed_extensions is None or ext in self.allowed_extensions:
                    return True
        return False

    def _download_github_zip(self, github_url: str, target_dir: Path) -> bool:
        import urllib.request
        import zipfile
        import io

        clean_url = github_url.rstrip(" /\t\n\r")
        if clean_url.endswith(".git"):
            clean_url = clean_url[:-4]

        parts = clean_url.split("github.com/")
        if len(parts) < 2:
            return False
        repo_part = parts[1].strip("/")
        repo_split = repo_part.split("/")
        if len(repo_split) < 2:
            return False

        owner = repo_split[0]
        repo_name = repo_split[1]

        branches = ["main", "master"]
        repo_names = [repo_name]
        if repo_name.endswith("."):
            repo_names.append(repo_name.rstrip("."))

        for r_name in repo_names:
            for branch in branches:
                urls_to_try = [
                    f"https://github.com/{owner}/{r_name}/archive/refs/heads/{branch}.zip",
                    f"https://codeload.github.com/{owner}/{r_name}/zip/refs/heads/{branch}",
                ]
                for zip_url in urls_to_try:
                    try:
                        req = urllib.request.Request(
                            zip_url,
                            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
                        )
                        with urllib.request.urlopen(req, timeout=60) as resp:
                            if resp.status == 200:
                                zip_buffer = io.BytesIO()
                                while chunk := resp.read(1024 * 1024):
                                    zip_buffer.write(chunk)
                                zip_buffer.seek(0)
                                with zipfile.ZipFile(zip_buffer) as z:
                                    if target_dir.exists():
                                        self._safe_remove_dir(target_dir)
                                    target_dir.mkdir(parents=True, exist_ok=True)

                                    top_dirs = {name.split("/")[0] for name in z.namelist() if "/" in name}
                                    root_prefix = list(top_dirs)[0] + "/" if len(top_dirs) == 1 else ""

                                    for member in z.infolist():
                                        target_path_str = member.filename
                                        if root_prefix and target_path_str.startswith(root_prefix):
                                            target_path_str = target_path_str[len(root_prefix):]
                                        if not target_path_str:
                                            continue
                                        
                                        path_parts = target_path_str.replace("\\", "/").split("/")
                                        clean_parts = [part.strip(" .") if i < len(path_parts) - 1 else part for i, part in enumerate(path_parts)]
                                        clean_path_str = "/".join([p for p in clean_parts if p])
                                        if not clean_path_str:
                                            continue

                                        ext = Path(clean_path_str).suffix.lower()
                                        if ext in {".pth", ".pt", ".bin", ".h5", ".hdf5", ".onnx", ".pkl", ".pickle", ".model", ".tflite", ".pb", ".zip", ".tar", ".gz"} or member.file_size > 10_000_000:
                                            continue

                                        out_path = target_dir / clean_path_str
                                        if member.is_dir():
                                            out_path.mkdir(parents=True, exist_ok=True)
                                        else:
                                            out_path.parent.mkdir(parents=True, exist_ok=True)
                                            with z.open(member) as source, open(out_path, "wb") as target:
                                                target.write(source.read())

                                if self._is_valid_repo_dir(target_dir):
                                    return True
                    except Exception:
                        pass
        return False

    def _download_github_api(self, github_url: str, target_dir: Path) -> bool:
        import urllib.request
        import json

        clean_url = github_url.rstrip(" /\t\n\r")
        if clean_url.endswith(".git"):
            clean_url = clean_url[:-4]

        parts = clean_url.split("github.com/")
        if len(parts) < 2:
            return False
        repo_part = parts[1].strip("/")
        repo_split = repo_part.split("/")
        if len(repo_split) < 2:
            return False

        owner = repo_split[0]
        repo_name = repo_split[1]

        branches = ["main", "master"]
        repo_names = [repo_name]
        if repo_name.endswith("."):
            repo_names.append(repo_name.rstrip("."))

        supported_exts = {
            ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".c", ".cpp", ".h",
            ".hpp", ".cs", ".go", ".rs", ".rb", ".php", ".swift", ".kt",
            ".scala", ".html", ".css", ".json", ".yaml", ".yml", ".md", ".txt"
        }

        for r_name in repo_names:
            for branch in branches:
                try:
                    tree_url = f"https://api.github.com/repos/{owner}/{r_name}/git/trees/{branch}?recursive=1"
                    req = urllib.request.Request(tree_url, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        if resp.status != 200:
                            continue
                        data = json.loads(resp.read().decode("utf-8"))
                        tree = data.get("tree", [])
                        if not tree:
                            continue

                        if target_dir.exists():
                            self._safe_remove_dir(target_dir)
                        target_dir.mkdir(parents=True, exist_ok=True)

                        for item in tree:
                            item_path = item.get("path", "")
                            if item.get("type") == "blob":
                                ext = Path(item_path).suffix.lower()
                                filename = Path(item_path).name.lower()
                                if ext in supported_exts or filename in {"dockerfile", "makefile"}:
                                    raw_url = f"https://raw.githubusercontent.com/{owner}/{r_name}/{branch}/{item_path}"
                                    raw_req = urllib.request.Request(raw_url, headers={"User-Agent": "Mozilla/5.0"})
                                    try:
                                        with urllib.request.urlopen(raw_req, timeout=10) as r_resp:
                                            if r_resp.status == 200:
                                                out_file = target_dir / item_path
                                                out_file.parent.mkdir(parents=True, exist_ok=True)
                                                out_file.write_bytes(r_resp.read())
                                    except Exception:
                                        pass

                        if self._is_valid_repo_dir(target_dir):
                            return True
                except Exception:
                    pass
        return False

    def resolve_repo_path(self, repo_path_or_url: str | Path) -> Path:
        raw_str = str(repo_path_or_url).strip()
        if not raw_str:
            return Path("./").resolve()

        is_git_url = (
            raw_str.startswith("http://")
            or raw_str.startswith("https://")
            or raw_str.startswith("git@")
            or raw_str.endswith(".git")
            or "github.com/" in raw_str
        )

        if is_git_url:
            clean_url = raw_str.rstrip(" /\t\n\r")
            if not (clean_url.startswith("http://") or clean_url.startswith("https://") or clean_url.startswith("git@")):
                git_fetch_url = f"https://{clean_url}"
            else:
                git_fetch_url = clean_url

            raw_folder_name = git_fetch_url.rstrip("/").split("/")[-1]
            if raw_folder_name.endswith(".git"):
                raw_folder_name = raw_folder_name[:-4]
            clean_name = raw_folder_name.strip(" .") or "repository"

            target_dir = Path("cloned_repos") / clean_name
            target_dir.parent.mkdir(parents=True, exist_ok=True)

            if self._is_valid_repo_dir(target_dir):
                return target_dir.resolve()

            if target_dir.exists():
                self._safe_remove_dir(target_dir)

            if "github.com" in git_fetch_url:
                try:
                    if self._download_github_api(git_fetch_url, target_dir):
                        return target_dir.resolve()
                except Exception:
                    pass
                try:
                    if self._download_github_zip(git_fetch_url, target_dir):
                        return target_dir.resolve()
                except Exception:
                    pass

            # Fallback to git clone if zip download failed
            clone_urls = [git_fetch_url]
            if not git_fetch_url.endswith(".git"):
                clone_urls.append(f"{git_fetch_url}.git")

            env = os.environ.copy()
            env["GIT_TERMINAL_PROMPT"] = "0"
            env["GIT_ASKPASS"] = ""
            env["GIT_LFS_SKIP_SMUDGE"] = "1"

            last_error = ""
            for url in clone_urls:
                if target_dir.exists():
                    self._safe_remove_dir(target_dir)
                try:
                    res = subprocess.run(
                        ["git", "clone", "--depth", "1", url, str(target_dir)],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                        env=env,
                        timeout=30,
                    )
                    if res.returncode == 0 and self._is_valid_repo_dir(target_dir):
                        return target_dir.resolve()
                    err_msg = res.stderr.strip() or res.stdout.strip()
                    last_error = f"URL '{url}': {err_msg}"
                    if target_dir.exists():
                        self._safe_remove_dir(target_dir)
                except Exception as ex:
                    last_error = f"URL '{url}': {str(ex)}"
                    if target_dir.exists():
                        self._safe_remove_dir(target_dir)

            raise ValueError(f"Could not clone or download repository '{raw_str}'. Details: {last_error or 'Unknown error'}")

        local_path = Path(raw_str).resolve()
        if not local_path.exists():
            raise ValueError(f"Repository path '{raw_str}' does not exist.")
        return local_path



    def _parse_gitignore(self, repo_dir: Path) -> List[str]:
        gitignore_path = repo_dir / ".gitignore"
        patterns = []
        if gitignore_path.is_file():
            try:
                with open(gitignore_path, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#"):
                            patterns.append(line)
            except Exception:
                pass
        return patterns

    def _is_ignored_by_gitignore(self, rel_path_str: str, patterns: List[str]) -> bool:
        normalized_path = rel_path_str.replace("\\", "/")
        parts = normalized_path.split("/")
        
        for pattern in patterns:
            pattern = pattern.rstrip("/")
            if fnmatch.fnmatch(normalized_path, pattern) or fnmatch.fnmatch(normalized_path, f"*/{pattern}"):
                return True
            for part in parts:
                if fnmatch.fnmatch(part, pattern):
                    return True
        return False

    def scan_directory(self, repo_dir: str | Path) -> List[CodeFile]:
        repo_path = self.resolve_repo_path(repo_dir)
        if not repo_path.exists() or not repo_path.is_dir():
            raise ValueError(f"Invalid repository directory: {repo_dir}")

        gitignore_patterns = self._parse_gitignore(repo_path)
        code_files: List[CodeFile] = []

        for root, dirs, files in os.walk(repo_path):
            # Exclude ignored directories in-place to prevent os.walk from recursing into them
            dirs[:] = [
                d for d in dirs
                if d not in self.ignore_dirs and not d.startswith(".")
            ]

            rel_root = Path(root).relative_to(repo_path)

            for file in files:
                if file in self.ignore_files or file.startswith("."):
                    continue

                ext = Path(file).suffix.lower()
                if self.ignore_extensions and ext in self.ignore_extensions:
                    continue

                if self.allowed_extensions is not None and ext not in self.allowed_extensions:
                    continue

                file_abs = Path(root) / file
                rel_path = file_abs.relative_to(repo_path)
                rel_path_str = str(rel_path)

                if self._is_ignored_by_gitignore(rel_path_str, gitignore_patterns):
                    continue

                try:
                    with open(file_abs, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()

                    # Skip empty files
                    if not content.strip():
                        continue

                    language = EXTENSION_TO_LANGUAGE.get(ext, ext.lstrip(".") if ext else "plaintext")

                    code_files.append(
                        CodeFile(
                            file_path=rel_path_str.replace("\\", "/"),
                            absolute_path=file_abs,
                            extension=ext,
                            language=language,
                            content=content,
                        )
                    )
                except Exception as e:
                    # Non-readable / binary file fallback
                    continue

        return code_files
