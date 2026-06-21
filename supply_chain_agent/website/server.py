from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


def start_server(host: str = "127.0.0.1", port: int = 8000) -> None:
    project_root = Path(__file__).resolve().parent.parent
    frontend_dir = project_root / "frontend"
    npm_cmd = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm_cmd:
        raise FileNotFoundError("npm was not found on PATH.")

    print(f"Starting Vite dev server at http://{host}:{port}")
    subprocess.run(
        [npm_cmd, "run", "dev", "--", "--host", host, "--port", str(port)],
        cwd=frontend_dir,
        check=True,
    )
