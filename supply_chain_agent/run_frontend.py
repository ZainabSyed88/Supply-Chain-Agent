#!/usr/bin/env python
"""
ChainPulse Frontend Launcher
Runs the React app through Vite on http://localhost:8000
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


def main() -> None:
    project_dir = Path(__file__).parent
    frontend_dir = project_dir / "frontend"
    package_json = frontend_dir / "package.json"

    print("=" * 60)
    print("ChainPulse Frontend - Starting Vite Dev Server")
    print("=" * 60)
    print()

    if not package_json.exists():
        print(f"Frontend package.json not found: {package_json}")
        sys.exit(1)

    npm_cmd = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm_cmd:
        print("npm was not found on PATH. Please install Node.js and npm first.")
        sys.exit(1)

    print(f"Working directory: {frontend_dir}")
    print("Frontend available at: http://localhost:8000")
    print("Backend API should be running at: http://localhost:5000")
    print("Press Ctrl+C to stop")
    print("-" * 60)
    print()

    try:
        subprocess.run([npm_cmd, "run", "dev"], cwd=frontend_dir, check=True)
    except KeyboardInterrupt:
        print("\nFrontend stopped by user")
    except subprocess.CalledProcessError as exc:
        print(f"\nFrontend failed to start (exit code {exc.returncode}).")
        sys.exit(exc.returncode)


if __name__ == "__main__":
    main()
