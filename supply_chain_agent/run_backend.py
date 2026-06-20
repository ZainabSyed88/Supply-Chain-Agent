#!/usr/bin/env python
"""
ChainPulse Backend Server Launcher
Starts the supply chain orchestrator and agent system
"""

import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

def main():
    print("=" * 60)
    print("🚀 ChainPulse Backend - Starting Supply Chain Orchestrator")
    print("=" * 60)
    print()
    
    try:
        # Import the orchestrator
        from orchestrator import main as orchestrator_main
        
        print("✅ Orchestrator loaded successfully")
        print()
        print("Backend is ready to receive requests on port 5000")
        print("Frontend should connect to: http://localhost:5000")
        print()
        print("Press Ctrl+C to stop")
        print("-" * 60)
        print()
        
        # Run the orchestrator
        orchestrator_main()
        
    except KeyboardInterrupt:
        print("\n\n⛔ Backend stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Error starting backend: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
