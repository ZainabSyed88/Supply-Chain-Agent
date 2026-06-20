#!/usr/bin/env python3
"""
Simple HTTP Server for ChainPulse Website
Runs the website locally for viewing
"""

import http.server
import socketserver
import os
import webbrowser
import time
import socket
from pathlib import Path

PORT = 8000
WEBSITE_DIR = Path(__file__).parent

def get_local_ip():
    """Get local machine IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def start_server():
    """Start HTTP server"""
    os.chdir(WEBSITE_DIR)
    
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        # Bind to all interfaces (0.0.0.0) so all browsers can access it
        with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
            local_ip = get_local_ip()
            
            print("\n" + "="*70)
            print("🚀 ChainPulse Website Server Started!")
            print("="*70)
            print(f"\n📍 Open your browser to:\n")
            print(f"   • Localhost:  http://localhost:{PORT}")
            print(f"   • Local IP:   http://{local_ip}:{PORT}")
            print(f"   • 127.0.0.1:  http://127.0.0.1:{PORT}\n")
            print("Pages:")
            print(f"  • Landing Page: http://localhost:{PORT}")
            print(f"  • War Room:     http://localhost:{PORT}/war-room.html")
            print(f"  • Mission Control: http://localhost:{PORT}/mission-control.html")
            print(f"  • Admin Portal: http://localhost:{PORT}/admin-portal.html\n")
            print("Press Ctrl+C to stop the server\n")
            print("="*70 + "\n")
            
            # Open browser (try localhost first)
            time.sleep(1)
            try:
                webbrowser.open(f'http://localhost:{PORT}')
            except:
                pass
            
            # Keep server running
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48 or e.errno == 98:  # Port already in use
            print(f"\n❌ Port {PORT} is already in use!")
            print(f"   Try: http://localhost:{PORT}")
        else:
            print(f"\n❌ Error: {e}")
        return False
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped")
        return True

if __name__ == "__main__":
    start_server()
