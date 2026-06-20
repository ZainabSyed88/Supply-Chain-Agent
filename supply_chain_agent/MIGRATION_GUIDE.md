# 📂 ChainPulse - New Organized Structure

## 🎯 New Folder Organization

```
supply_chain_agent/
├── backend/                    # 🔧 Backend Services
│   ├── run.py                 # ⭐ Start backend only
│   ├── orchestrator.py
│   ├── config.py
│   ├── agents/
│   ├── data/
│   └── utils/
│
├── frontend/                   # 🎨 Frontend UI
│   ├── run.py                 # ⭐ Start frontend only
│   └── website/
│       ├── index.html
│       ├── styles.css
│       ├── script.js
│       └── server.py
│
├── run_all.py                 # ⭐ Start both services
└── RUN_SERVICES.md            # Documentation
```

---

## 🚀 Quick Start

### Option 1: Run Both (Recommended)
```bash
cd c:\Users\dell\OneDrive\Desktop\my_project_hackathon\supply_chain_agent
python run_all.py
```
✅ Automatically starts Frontend + Backend

---

### Option 2: Run Separately in Different Terminals

**Terminal 1 - Frontend:**
```bash
cd c:\Users\dell\OneDrive\Desktop\my_project_hackathon\supply_chain_agent\frontend
python run.py
```
→ Opens **http://localhost:8000**

**Terminal 2 - Backend:**
```bash
cd c:\Users\dell\OneDrive\Desktop\my_project_hackathon\supply_chain_agent\backend
python run.py
```
→ Runs on **port 5000**

---

## 📋 Migration Steps

### ✅ Step 1: Copy Backend Files
From `supply_chain_agent/` to `supply_chain_agent/backend/`:
- `orchestrator.py`
- `config.py`
- `agents/` (entire folder)
- `data/` (entire folder)
- `utils/` (entire folder)
- `requirements.txt`

### ✅ Step 2: Copy Frontend Files
From `supply_chain_agent/website/` to `supply_chain_agent/frontend/website/`:
- All `.html` files (index.html, mission-control.html, war-room.html, admin-portal.html)
- `styles.css`
- `script.js`
- `server.py`
- `dashboard.html` (if exists)
- Any other website assets

### ✅ Step 3: Copy `__init__.py` Files
- `backend/agents/__init__.py`
- `backend/utils/__init__.py`
- `frontend/website/__init__.py` (optional)

### ✅ Step 4: Update Imports (if needed)
For any files that import from agents or utils, update paths:
```python
# Before:
from agents.supplier_monitor_agent import SupplierMonitorAgent

# After (if running from backend):
from agents.supplier_monitor_agent import SupplierMonitorAgent  # Same if in backend dir

# Or with absolute imports:
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from agents.supplier_monitor_agent import SupplierMonitorAgent
```

---

## 🎯 Commands Cheat Sheet

| Task | Command |
|------|---------|
| **Start Everything** | `python run_all.py` |
| **Start Backend Only** | `cd backend && python run.py` |
| **Start Frontend Only** | `cd frontend && python run.py` |
| **Backend + Frontend** (2 terminals) | See Option 2 above |

---

## 🔗 Access Points

After starting services:

| Service | URL |
|---------|-----|
| **Landing Page** | http://localhost:8000 |
| **Mission Control** | http://localhost:8000/mission-control.html |
| **War Room** | http://localhost:8000/war-room.html |
| **Admin Portal** | http://localhost:8000/admin-portal.html |
| **Backend API** | http://localhost:5000 |

---

## ✨ Benefits of New Structure

✅ **Clear Separation** - Backend and frontend completely separate
✅ **Independent Development** - Work on each independently
✅ **Easier Deployment** - Deploy to different servers/ports
✅ **Better Organization** - Find files quickly
✅ **Scalable** - Easy to add multiple backends/frontends
✅ **Professional** - Industry-standard structure
✅ **Team-Friendly** - New developers understand architecture

---

## ⚠️ Troubleshooting

### Port Already in Use?
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Find what's using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Import Errors?
Make sure all `__init__.py` files exist:
- `backend/agents/__init__.py`
- `backend/utils/__init__.py`

### Can't Find website folder?
Ensure this structure exists:
```
frontend/
└── website/
    ├── server.py
    └── *.html files
```

---

## 📖 Next Steps

1. **Copy files to new structure** (see Migration Steps)
2. **Start services** with `python run_all.py`
3. **Open browser** to http://localhost:8000
4. **Test features** (chatbot, buttons, pages)
5. **Delete old files** from root directory (once verified working)

Happy supply chain optimization! 🚀
