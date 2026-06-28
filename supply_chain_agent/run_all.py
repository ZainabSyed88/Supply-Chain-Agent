#!/usr/bin/env python
"""
ChainPulse - Run All Services
Starts both Backend and Frontend in separate processes
"""

import subprocess
import sys
import time
import os
from pathlib import Path
import importlib.util

# Fix encoding for Windows console
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'


def stop_process(process):
    if process is None or process.poll() is not None:
        return
    try:
        process.terminate()
        process.wait(timeout=5)
    except Exception:
        process.kill()


def exit_with_failure(message, backend_process=None, frontend_process=None):
    print(f"\n[ERROR] {message}")
    stop_process(frontend_process)
    stop_process(backend_process)
    sys.exit(1)


def find_missing_backend_modules():
    required_modules = {
        "fastapi": "fastapi",
        "uvicorn": "uvicorn",
        "sqlalchemy": "sqlalchemy",
        "jose": "python-jose",
        "passlib": "passlib",
        "httpx": "httpx",
    }
    missing = []
    for module_name, package_name in required_modules.items():
        if importlib.util.find_spec(module_name) is None:
            missing.append(package_name)
    return missing

def main():
    print("=" * 70)
    print("[*] ChainPulse - Starting All Services")
    print("=" * 70)
    print()
    
    root_dir = Path(__file__).parent
    backend_dir = root_dir / "backend"
    frontend_dir = root_dir / "frontend"
    frontend_launcher = root_dir / "run_frontend.py"
    
    # Check if required directories exist
    if not backend_dir.exists():
        print(f"[ERROR] Backend directory not found: {backend_dir}")
        sys.exit(1)
    
    if not frontend_dir.exists():
        print(f"[ERROR] Frontend directory not found: {frontend_dir}")
        sys.exit(1)

    if not frontend_launcher.exists():
        print(f"[ERROR] Frontend launcher not found: {frontend_launcher}")
        sys.exit(1)
    
    print("[INFO] Detected Folder Structure:")
    print(f"   [OK] Backend:  {backend_dir}")
    print(f"   [OK] Frontend: {frontend_dir}")
    print()

    missing_modules = find_missing_backend_modules()
    if missing_modules:
        package_list = ", ".join(missing_modules)
        print("[ERROR] Backend dependencies are missing in the current Python environment.")
        print(f"        Missing modules: {package_list}")
        print()
        print("[FIX] Run this first:")
        print(r"   .\venv\Scripts\python.exe -m pip install -r backend\requirements.txt")
        print()
        sys.exit(1)
    
    # Start Backend
    print("[1/2] [*] Starting Backend...")
    backend_process = subprocess.Popen(
        [sys.executable, "run.py"],
        cwd=str(backend_dir)
    )
    print(f"      [OK] Backend process started (PID: {backend_process.pid})")
    
    # Wait a moment for backend to initialize
    time.sleep(2)
    if backend_process.poll() is not None:
        exit_with_failure(
            f"Backend exited immediately with code {backend_process.returncode}. Install backend dependencies in the active venv and try again.",
            backend_process=backend_process,
        )
    
    # Start Frontend
    print("[2/2] [*] Starting Frontend...")
    frontend_process = subprocess.Popen(
        [sys.executable, str(frontend_launcher)],
        cwd=str(root_dir)
    )
    print(f"      [OK] Frontend process started (PID: {frontend_process.pid})")

    time.sleep(2)
    if frontend_process.poll() is not None:
        exit_with_failure(
            f"Frontend exited immediately with code {frontend_process.returncode}. Check the Vite output above for the exact port or startup issue.",
            backend_process=backend_process,
            frontend_process=frontend_process,
        )
    
    print()
    print("=" * 70)
    print("[OK] ALL SERVICES STARTED!")
    print("=" * 70)
    print()
    print("[WEB] Open your browser:")
    print("   http://localhost:8000")
    print()
    print("[SERVICES] Running:")
    print(f"   Backend:  PID {backend_process.pid}")
    print(f"   Frontend: PID {frontend_process.pid}")
    print()
    print("[*] Press Ctrl+C to stop all services")
    print()
    
    try:
        # Wait for both processes
        print("\n[*] Monitoring services... (this runs in foreground)")
        print("[*] Check the service windows that opened for detailed output")
        print()
        
        while True:
            backend_status = backend_process.poll()
            frontend_status = frontend_process.poll()
            
            if backend_status is not None:
                exit_with_failure(
                    f"Backend process exited with code {backend_status}",
                    backend_process=backend_process,
                    frontend_process=frontend_process,
                )
            
            if frontend_status is not None:
                exit_with_failure(
                    f"Frontend process exited with code {frontend_status}",
                    backend_process=backend_process,
                    frontend_process=frontend_process,
                )
            
            time.sleep(1)
    
    except KeyboardInterrupt:
        print("\n\n[*] Stopping all services...")
        
        # Terminate processes
        try:
            stop_process(backend_process)
            stop_process(frontend_process)
            print("[OK] All services stopped gracefully")
        except:
            stop_process(backend_process)
            stop_process(frontend_process)
            print("[OK] All services forcefully stopped")
        
        sys.exit(0)

if __name__ == "__main__":
    main()
