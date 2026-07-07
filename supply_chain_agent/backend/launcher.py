#!/usr/bin/env python
"""Shared FastAPI launcher used by backend entrypoints."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import uvicorn


if sys.platform == "win32":
    os.environ["PYTHONIOENCODING"] = "utf-8"


def run() -> None:
    backend_dir = Path(__file__).parent
    root_dir = backend_dir.parent
    sys.path.insert(0, str(backend_dir))
    sys.path.insert(0, str(root_dir))

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info",
    )
