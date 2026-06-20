"""
ChainPulse - Organized Folder Structure
Separates Backend and Frontend for cleaner architecture
"""

# 📂 FOLDER STRUCTURE
# ==================
#
# supply_chain_agent/
# ├── backend/                          # 🔧 Backend Logic
# │   ├── orchestrator.py              # Main orchestrator
# │   ├── config.py                    # Configuration
# │   ├── requirements.txt             # Backend dependencies
# │   ├── run.py                       # Backend starter
# │   ├── agents/                      # 12 specialized agents
# │   │   ├── __init__.py
# │   │   ├── supplier_monitor_agent.py
# │   │   ├── disruption_detector_agent.py
# │   │   ├── risk_assessment_agent.py
# │   │   ├── mitigation_agent.py
# │   │   ├── stakeholder_notification_agent.py
# │   │   └── ... (7 more agents)
# │   ├── data/                        # Supply chain data files
# │   │   ├── suppliers.json
# │   │   ├── shipments.json
# │   │   └── disruptions.json
# │   └── utils/                       # Utilities & helpers
# │       ├── __init__.py
# │       └── helpers.py
# │
# ├── frontend/                         # 🎨 Frontend UI
# │   ├── run.py                       # Frontend starter
# │   ├── website/                     # Web dashboard
# │   │   ├── index.html               # Landing page + AI chatbot
# │   │   ├── mission-control.html     # Operations dashboard
# │   │   ├── war-room.html            # Multi-agent war room
# │   │   ├── admin-portal.html        # Admin operations
# │   │   ├── styles.css               # Global styling
# │   │   ├── script.js                # JavaScript functions
# │   │   ├── server.py                # HTTP server
# │   │   └── dashboard.html           # Legacy dashboard
# │   └── assets/                      # Images, fonts, etc (optional)
# │
# ├── shared/                          # 📦 Shared Resources (optional)
# │   ├── README.md                    # Project documentation
# │   ├── requirements.txt             # All dependencies
# │   └── config.env                   # Environment variables
# │
# ├── RUN_SERVICES.md                  # Quick start guide
# ├── START_SERVICES.bat               # Windows batch launcher
# ├── run_all.py                       # Run both services
# └── FOLDER_STRUCTURE.md              # This file


# 🚀 HOW TO USE THE NEW STRUCTURE
# ================================

# 1. BACKEND ONLY
# ===============
# cd backend
# python run.py

# 2. FRONTEND ONLY
# ================
# cd frontend
# python run.py

# 3. BOTH SERVICES (from root)
# =============================
# python run_all.py

# 4. OR USE WINDOWS BATCH FILE
# =============================
# START_SERVICES.bat


# 📋 MIGRATION CHECKLIST
# ======================
# □ Copy orchestrator.py, config.py to /backend/
# □ Copy agents/ folder to /backend/agents/
# □ Copy data/ files to /backend/data/
# □ Copy utils/ folder to /backend/utils/
# □ Copy website/ contents to /frontend/website/
# □ Create backend/run.py
# □ Create frontend/run.py
# □ Create root-level run_all.py
# □ Update imports in all Python files
# □ Test both services separately
# □ Test both services together


# ✨ BENEFITS OF THIS STRUCTURE
# ==============================
# • Clear separation of concerns (backend vs frontend)
# • Independent development and testing
# • Easier to scale (add multiple backends/frontends)
# • Better code organization
# • Simpler deployment
# • Easier for new developers to understand architecture
# • Can run services on different machines/ports
