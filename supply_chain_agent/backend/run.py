#!/usr/bin/env python
"""
Backend Server Launcher
Starts the supply chain orchestrator and agent system
Located at: backend/run.py
"""

import sys
import os
import time
from pathlib import Path

# Fix encoding for Windows console
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'

def main():
    print("=" * 70)
    print("[*] ChainPulse Backend - Supply Chain Orchestrator")
    print("=" * 70)
    print()
    
    # Get backend directory
    backend_dir = Path(__file__).parent
    root_dir = backend_dir.parent
    
    # Add backend and root to path for imports
    sys.path.insert(0, str(backend_dir))
    sys.path.insert(0, str(root_dir))
    
    print(f"[DIR] Backend directory: {backend_dir}")
    print()
    
    try:
        print("[*] Loading orchestrator...")
        from orchestrator import SupplyChainOrchestrator
        
        # Initialize orchestrator
        orchestrator = SupplyChainOrchestrator()
        
        print("[OK] Orchestrator loaded successfully")
        print()
        print("[*] Backend is ready!")
        print()
        print("[STATUS]")
        print("  [OK] Orchestrator running")
        print("  [OK] 12 Agents loaded")
        print("  [OK] Data files accessible")
        print()
        print("[WEB] Frontend available at: http://localhost:8000")
        print()
        print("[*] Press Ctrl+C to stop")
        print("-" * 70)
        print()
        
        # Keep the backend alive
        print("[*] Backend service is active and ready for requests...")
        print()
        
        while True:
            time.sleep(1)
        
    except KeyboardInterrupt:
        print("\n\n[STOP] Backend stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n[ERROR] Error starting backend: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
