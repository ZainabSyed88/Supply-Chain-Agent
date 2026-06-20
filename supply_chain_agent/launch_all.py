#!/usr/bin/env python3
"""
LAUNCH ALL FEATURES
Run this to start all systems at once

Usage:
    python launch_all.py
"""

import os
import subprocess
import time
import platform
from pathlib import Path

def main():
    print("\n" + "="*60)
    print("🚀 CHAINPULSE - SUPPLY CHAIN CONTROL CENTER")
    print("="*60 + "\n")
    
    features = {
        "Command Center": {
            "cmd": "streamlit run command_center.py --port 8501",
            "url": "http://localhost:8501",
            "description": "Global supply chain visibility dashboard"
        },
        "Executive Copilot": {
            "cmd": "streamlit run copilot_chat.py --port 8502",
            "url": "http://localhost:8502",
            "description": "AI-powered Q&A for supply chain decisions"
        },
        "Digital Twin": {
            "cmd": "streamlit run digital_twin.py --port 8503",
            "url": "http://localhost:8503",
            "description": "What-if scenario simulator"
        },
        "News Intelligence": {
            "cmd": "streamlit run news_intelligence.py --port 8504",
            "url": "http://localhost:8504",
            "description": "Real-time disruption detection from external sources"
        },
        "Mobile Dashboard": {
            "cmd": "python dashboard_api.py",
            "url": "http://localhost:5000",
            "description": "Mobile-responsive web dashboard + REST API"
        }
    }
    
    print("📋 FEATURES AVAILABLE:\n")
    for i, (name, info) in enumerate(features.items(), 1):
        print(f"{i}. {name}")
        print(f"   📍 {info['description']}")
        print(f"   🌐 {info['url']}\n")
    
    print("="*60)
    print("INSTALLATION REQUIREMENTS")
    print("="*60 + "\n")
    
    print("1. Install Python 3.9+")
    print("2. Install dependencies:")
    print("   pip install -r requirements.txt\n")
    
    print("="*60)
    print("QUICK START OPTIONS")
    print("="*60 + "\n")
    
    print("Option A: Run Individual Features")
    print("   streamlit run command_center.py")
    print("   streamlit run copilot_chat.py")
    print("   streamlit run digital_twin.py")
    print("   streamlit run news_intelligence.py")
    print("   python dashboard_api.py\n")
    
    print("Option B: Run Main Orchestrator")
    print("   python orchestrator.py\n")
    
    print("Option C: Run All at Once")
    answer = input("Would you like to start all systems now? (y/n): ").strip().lower()
    
    if answer == 'y':
        print("\n🔄 Starting all systems...\n")
        
        # Start features
        processes = {}
        for name, info in features.items():
            print(f"Starting {name}...")
            
            try:
                if platform.system() == "Windows":
                    # Windows
                    if "streamlit" in info['cmd']:
                        process = subprocess.Popen(
                            info['cmd'].split(),
                            creationflags=subprocess.CREATE_NEW_CONSOLE
                        )
                    else:
                        process = subprocess.Popen(
                            info['cmd'].split(),
                            creationflags=subprocess.CREATE_NEW_CONSOLE
                        )
                else:
                    # Linux/Mac
                    process = subprocess.Popen(
                        info['cmd'],
                        shell=True,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE
                    )
                
                processes[name] = process
                time.sleep(1)  # Stagger starts
                
            except Exception as e:
                print(f"❌ Failed to start {name}: {e}")
        
        print("\n" + "="*60)
        print("✅ ALL SYSTEMS STARTED")
        print("="*60 + "\n")
        
        print("📱 ACCESS DASHBOARDS:\n")
        for name, info in features.items():
            status = "✓" if processes.get(name) else "✗"
            print(f"{status} {name}")
            print(f"   {info['url']}\n")
        
        print("="*60)
        print("NEXT STEPS")
        print("="*60 + "\n")
        
        print("1. Open all URLs in your browser")
        print("2. Start with Command Center for overview")
        print("3. Try asking Copilot questions")
        print("4. Run Digital Twin scenarios")
        print("5. Check News Intelligence for real-time alerts\n")
        
        print("Press Ctrl+C to stop all systems\n")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n🛑 Shutting down all systems...")
            for process in processes.values():
                try:
                    process.terminate()
                except:
                    pass
            print("✓ All systems stopped")
    
    else:
        print("\nTo start features later, run:")
        print("  python launch_all.py\n")

if __name__ == "__main__":
    main()
