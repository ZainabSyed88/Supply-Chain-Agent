#!/usr/bin/env python
"""
Frontend Server Launcher
Starts the web dashboard on http://localhost:8000
Located at: frontend/run.py
"""

import sys
import os
from pathlib import Path

# Fix encoding for Windows console
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'

def main():
    print("=" * 70)
    print("[*] ChainPulse Frontend - Web Dashboard")
    print("=" * 70)
    print()
    
    # Get frontend and website directories
    frontend_dir = Path(__file__).parent
    website_dir = frontend_dir / "website"
    
    if not website_dir.exists():
        print(f"[ERROR] Website directory not found: {website_dir}")
        print(f"\n   Please ensure the following structure exists:")
        print(f"   frontend/")
        print(f"   ├─ website/")
        print(f"   │  ├─ index.html")
        print(f"   │  ├─ styles.css")
        print(f"   │  ├─ script.js")
        print(f"   │  ├─ server.py")
        print(f"   │  └─ *.html (other pages)")
        sys.exit(1)
    
    # Change to website directory
    os.chdir(website_dir)
    
    print(f"[DIR] Frontend directory: {frontend_dir}")
    print(f"[DIR] Website directory: {website_dir}")
    print(f"[DIR] Working directory: {os.getcwd()}")
    print()
    
    print("[*] Starting HTTP server...")
    print()
    print("[OK] Frontend available at:")
    print()
    print("   [HOME] Landing Page:     http://localhost:8000")
    print("   [DASH] Mission Control:  http://localhost:8000/mission-control.html")
    print("   [WAR]  War Room:         http://localhost:8000/war-room.html")
    print("   [ADMIN] Admin Portal:    http://localhost:8000/admin-portal.html")
    print()
    print("[CHAT] Chat with AI: Click 'Ask Me' button in top-right")
    print()
    print("[*] Press Ctrl+C to stop")
    print("-" * 70)
    print()
    
    try:
        # Add website directory to path so we can import server
        sys.path.insert(0, str(website_dir))
        
        # Change to website directory for file serving
        os.chdir(website_dir)
        
        # Import and run server
        from server import start_server
        start_server()
        
    except KeyboardInterrupt:
        print("\n\n[STOP] Frontend stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n[ERROR] Error starting frontend: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
