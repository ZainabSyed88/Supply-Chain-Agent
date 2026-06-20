# 🚀 ChainPulse - Separate Frontend & Backend

## Quick Start

### Option 1: Run Both Separately (Recommended for Development)

Open **TWO terminal windows** and run these commands:

#### Terminal 1 - Frontend (Web Dashboard)
```bash
cd c:\Users\dell\OneDrive\Desktop\my_project_hackathon\supply_chain_agent
python run_frontend.py
```
✅ Open browser to: **http://localhost:8000**

#### Terminal 2 - Backend (Orchestrator)
```bash
cd c:\Users\dell\OneDrive\Desktop\my_project_hackathon\supply_chain_agent
python run_backend.py
```
✅ Backend listening on: **http://localhost:5000**

---

## What Each Service Does

### 🎨 Frontend (`run_frontend.py`)
- Hosts the web dashboard on **port 8000**
- Serves HTML, CSS, JavaScript files
- Provides the ChainPulse AI chatbot UI
- Available pages:
  - Landing Page: http://localhost:8000
  - Mission Control: http://localhost:8000/mission-control.html
  - War Room: http://localhost:8000/war-room.html
  - Admin Portal: http://localhost:8000/admin-portal.html

### 🔧 Backend (`run_backend.py`)
- Runs the supply chain orchestrator
- Manages all 12 agents (supplier monitoring, disruption detection, risk assessment, etc.)
- Processes supply chain data
- Handles AI/LLM responses
- Runs on **port 5000** (by default)

---

## PowerShell Quick Commands

If you want to run from PowerShell in one line:

**Start Frontend:**
```powershell
cd c:\Users\dell\OneDrive\Desktop\my_project_hackathon\supply_chain_agent; python run_frontend.py
```

**Start Backend:**
```powershell
cd c:\Users\dell\OneDrive\Desktop\my_project_hackathon\supply_chain_agent; python run_backend.py
```

---

## Stopping Services

- **Frontend**: Press `Ctrl+C` in the terminal
- **Backend**: Press `Ctrl+C` in the terminal

---

## Troubleshooting

### Port Already in Use?
- Frontend (8000): `netstat -ano | findstr :8000`
- Backend (5000): `netstat -ano | findstr :5000`

Kill process:
```powershell
taskkill /PID <PID> /F
```

### Frontend won't load?
1. Check if server.py is in `website/` directory
2. Verify port 8000 is not blocked
3. Clear browser cache (Ctrl+Shift+Del)

### Backend won't start?
1. Check Python dependencies: `pip install -r requirements.txt`
2. Verify Ollama is running (if using local LLM)
3. Check config.py for API keys

---

## Architecture

```
ChainPulse Application
├── Frontend (Port 8000)
│   ├── index.html - Landing page with AI chatbot
│   ├── mission-control.html - Operations dashboard
│   ├── war-room.html - Multi-agent war room
│   ├── admin-portal.html - Admin operations
│   └── script.js, styles.css
│
├── Backend (Port 5000)
│   ├── orchestrator.py - Main agent orchestrator
│   ├── agents/ - 12 specialized agents
│   ├── data/ - Supply chain data
│   └── config.py - Settings
```

---

## Next Steps

1. ✅ Start both services in separate terminals
2. 🌐 Open http://localhost:8000 in your browser
3. 💬 Click "Ask Me" button to open AI chatbot
4. 🎯 Test the supply chain management features
5. 📊 Check War Room for real-time agent status

Happy supply chain optimizing! 🚀
