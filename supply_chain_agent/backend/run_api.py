#!/usr/bin/env python
"""
Backend API launcher for the FastAPI app.
Starts the Supply Chain API on port 5000.
"""

import sys
from pathlib import Path
import uvicorn

if sys.platform == 'win32':
    import os
    os.environ['PYTHONIOENCODING'] = 'utf-8'


def main():
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


if __name__ == "__main__":
    main()
