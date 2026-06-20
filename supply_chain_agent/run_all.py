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

# Fix encoding for Windows console
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'

def main():
    print("=" * 70)
    print("[*] ChainPulse - Starting All Services")
    print("=" * 70)
    print()
    
    root_dir = Path(__file__).parent
    backend_dir = root_dir / "backend"
    frontend_dir = root_dir / "frontend"
    
    # Check if required directories exist
    if not backend_dir.exists():
        print(f"[ERROR] Backend directory not found: {backend_dir}")
        sys.exit(1)
    
    if not frontend_dir.exists():
        print(f"[ERROR] Frontend directory not found: {frontend_dir}")
        sys.exit(1)
    
    print("[INFO] Detected Folder Structure:")
    print(f"   [OK] Backend:  {backend_dir}")
    print(f"   [OK] Frontend: {frontend_dir}")
    print()
    
    # Start Backend
    print("[1/2] [*] Starting Backend...")
    backend_process = subprocess.Popen(
        [sys.executable, "run.py"],
        cwd=str(backend_dir)
    )
    print(f"      [OK] Backend process started (PID: {backend_process.pid})")
    
    # Wait a moment for backend to initialize
    time.sleep(2)
    
    # Start Frontend
    print("[2/2] [*] Starting Frontend...")
    frontend_process = subprocess.Popen(
        [sys.executable, "run.py"],
        cwd=str(frontend_dir)
    )
    print(f"      [OK] Frontend process started (PID: {frontend_process.pid})")
    
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
                print(f"\n[ERROR] Backend process exited with code {backend_status}")
                print("[*] Frontend still running, press Ctrl+C to stop it")
                break
            
            if frontend_status is not None:
                print(f"\n[ERROR] Frontend process exited with code {frontend_status}")
                print("[*] Backend still running, press Ctrl+C to stop it")
                break
            
            time.sleep(1)
    
    except KeyboardInterrupt:
        print("\n\n[*] Stopping all services...")
        
        # Terminate processes
        try:
            backend_process.terminate()
            frontend_process.terminate()
            
            # Wait for graceful shutdown
            backend_process.wait(timeout=5)
            frontend_process.wait(timeout=5)
            print("[OK] All services stopped gracefully")
        except:
            # Force kill if needed
            backend_process.kill()
            frontend_process.kill()
            print("[OK] All services forcefully stopped")
        
        sys.exit(0)

if __name__ == "__main__":
    main()
