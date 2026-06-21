# 📂 ChainPulse - Organized Folder Structure

> Clean, professional separation of Frontend and Backend services

## 🎯 Quick Start

### Run Everything at Once:
```bash
python run_all.py
```

### Or Run Separately:

**Terminal 1 - Frontend:**
```bash
cd frontend
python run.py
```

**Terminal 2 - Backend:**
```bash
cd backend
python run.py
```

### Or Use Windows Batch:
```bash
START_SERVICES.bat
```

---

## 📁 Folder Structure

```
supply_chain_agent/
│
├── 🔧 backend/                    Backend Services
│   ├── run.py                    Start backend only
│   ├── orchestrator.py           Main orchestrator
│   ├── config.py                 Configuration
│   ├── requirements.txt          Dependencies
│   ├── agents/                   12 Specialized agents
│   ├── data/                     Supply chain data
│   └── utils/                    Helper utilities
│
├── 🎨 frontend/                   Frontend UI
│   ├── run.py                    Start frontend only
│   └── website/
│       ├── index.html            Landing page + AI chatbot
│       ├── mission-control.html  Operations dashboard
│       ├── war-room.html         Multi-agent war room
│       ├── admin-portal.html     Admin operations
│       ├── styles.css            Global styling
│       ├── script.js             JavaScript
│       └── server.py             HTTP server
│
├── run_all.py                     Start both services
├── MIGRATION_GUIDE.md             How to migrate files
└── START_SERVICES.bat             Windows launcher
```

---

## 🚀 Launch Options

| Option | Command | Use Case |
|--------|---------|----------|
| **Run All** | `python run_all.py` | 👍 Recommended - start both services |
| **Run Frontend** | `cd frontend && python run.py` | 💻 Frontend development only |
| **Run Backend** | `cd backend && python run.py` | 🔧 Backend development only |
| **Batch File** | `START_SERVICES.bat` | 🪟 Windows - opens 2 terminals |

---

## 📊 Services Overview

### 🎨 Frontend (Port 8000)
- Web dashboard and UI
- AI chatbot interface
- 4 main pages:
  - Landing Page: http://localhost:8000
  - Mission Control: http://localhost:8000/mission-control.html
  - War Room: http://localhost:8000/war-room.html
  - Admin Portal: http://localhost:8000/admin-portal.html

### 🔧 Backend (Port 5000)
- Supply chain orchestrator
- 12 specialized agents
- Real-time data processing
- AI/LLM integration (OpenAI or NVIDIA)

---

## 📋 Migration Checklist

Ready to reorganize? See **MIGRATION_GUIDE.md** for step-by-step instructions.

Quick summary:
1. ✅ Create `/backend` and `/frontend` folders (already done)
2. 📋 Copy files to appropriate folders (see MIGRATION_GUIDE.md)
3. ✅ Update imports if needed
4. ✅ Test both services
5. ✅ Delete old files from root

---

## 🔗 URLs After Starting

| Page | URL |
|------|-----|
| Landing Page | http://localhost:8000 |
| Mission Control | http://localhost:8000/mission-control.html |
| War Room | http://localhost:8000/war-room.html |
| Admin Portal | http://localhost:8000/admin-portal.html |

---

## 💡 Key Features

✅ **Independent Services** - Run frontend/backend separately
✅ **Clean Organization** - Easy to find files
✅ **Professional Structure** - Industry-standard layout
✅ **Easy Deployment** - Can deploy to different servers
✅ **Scalable** - Add multiple instances easily
✅ **Team-Friendly** - New devs understand architecture

---

## 🎯 Next Steps

1. **Read MIGRATION_GUIDE.md** - Copy files to new structure
2. **Run services** - `python run_all.py`
3. **Test everything** - Open http://localhost:8000
4. **Delete old files** - Clean up root directory (optional)

---

## ⚠️ Troubleshooting

**Port Already in Use?**
```powershell
# Find process using port
netstat -ano | findstr :8000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

**Import Errors?**
- Ensure `__init__.py` exists in all Python folders
- Check `backend/agents/__init__.py` exists
- Check `backend/utils/__init__.py` exists

**Files Not Found?**
- Verify structure matches the diagram above
- Check file paths in scripts
- See MIGRATION_GUIDE.md for details

---

## 📚 Documentation Files

- **README.md** - Main project documentation
- **MIGRATION_GUIDE.md** - How to migrate files to new structure
- **FOLDER_STRUCTURE.md** - Detailed structure explanation
- **RUN_SERVICES.md** - Service running instructions

---

Made with ❤️ for ChainPulse Supply Chain Intelligence Platform
