#!/usr/bin/env python
"""
ChainPulse Frontend Server Launcher
Starts the web dashboard on http://localhost:8000
"""

import sys
import os
from pathlib import Path

def main():
    print("=" * 60)
    print("🎨 ChainPulse Frontend - Starting Web Dashboard")
    print("=" * 60)
    print()
    
    # Change to website directory
    website_dir = Path(__file__).parent / "website"
    
    if not website_dir.exists():
        print(f"❌ Website directory not found: {website_dir}")
        sys.exit(1)
    
    os.chdir(website_dir)
    
    print(f"📂 Working directory: {os.getcwd()}")
    print()
    print("🌐 Starting HTTP server...")
    print("✅ Frontend available at: http://localhost:8000")
    print()
    print("📄 Pages:")
    print("  • Landing Page:        http://localhost:8000")
    print("  • Mission Control:     http://localhost:8000/mission-control.html")
    print("  • War Room:            http://localhost:8000/war-room.html")
    print("  • Admin Portal:        http://localhost:8000/admin-portal.html")
    print()
    print("Press Ctrl+C to stop")
    print("-" * 60)
    print()
    
    try:
        # Import and run server
        from server import start_server
        start_server()
        
    except KeyboardInterrupt:
        print("\n\n⛔ Frontend stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Error starting frontend: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
