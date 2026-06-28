# ChainPulse

ChainPulse is a supply chain operations dashboard with:

- a `FastAPI` backend on port `5000`
- a `React + Vite` frontend on port `8000`
- JWT auth with `Admin / Analyst / Viewer` roles
- SQLite-backed users, pipeline runs, alerts, and chat history
- PDF report generation
- optional real-time NewsAPI and OpenWeatherMap intelligence feeds

This README is organized around how to run and work with the repo today.

## What's in the app

### Core product areas

- `Dashboard`: KPIs, inventory, supplier risk, live alerts, demand charts
- `Orders`: backlog, critical commitments, and fulfillment risk
- `Warehouses`: utilization, staffing, and shipment throughput
- `Copilot`: chat UI with local fallback responses and voice input
- `Reports`: pipeline history and PDF download
- `War Room`: restricted pipeline execution view
- `Supply Chain Map`: supplier/shipment/disruption visualization
- `ESG`: carbon and sustainability dashboards

### Legacy and experimental modules

The repo also still includes older hackathon-era Python surfaces outside the current FastAPI + React app:

- `advanced_orchestrator.py`: older multi-agent orchestration entrypoint
- `dashboard.py`: Streamlit dashboard prototype
- `digital_twin.py`: what-if simulation prototype
- `copilot.py` and `copilot_chat.py`: earlier conversational interfaces
- `email_generator.py`, `report_generator.py`, `sustainability.py`: standalone feature prototypes

These can still be useful for reference or demos, but the main supported app flow is the FastAPI backend plus React frontend described in this README.

### Current auth model

- `admin`: full access
- `analyst`: can view the product and run pipeline workflows
- `viewer`: read-only access

## Project structure

```text
supply_chain_agent/
|- backend/
|  |- app/
|  |  |- core/           # config, logging, exceptions
|  |  |- data/           # mock data generation
|  |  |- models/         # Pydantic + SQLAlchemy models
|  |  |- routers/        # FastAPI route modules
|  |  `- services/       # auth, orchestration, email, intelligence
|  |- logs/
|  |- requirements.txt
|  `- run.py
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- context/
|  |  |- hooks/
|  |  |- pages/
|  |  `- utils/
|  |- package.json
|  `- vite.config.js
|- tests/
|- run_frontend.py
|- run_all.py
`- README.md
```

## Requirements

### Backend

- Python `3.11+` recommended
- virtual environment strongly recommended

### Frontend

- Node.js `18+`
- npm

## Quick start

### 1. Create and activate a virtual environment

From `supply_chain_agent`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\venv\Scripts\Activate.ps1
```

### 2. Install backend dependencies

```powershell
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

### 3. Install frontend dependencies

```powershell
cd frontend
npm install
cd ..
```

### 4. Configure environment variables

Create `backend\.env` or `.env` depending on how you run the backend. The current backend config reads `.env`.

Example:

```env
# Core app
DATABASE_URL=sqlite:///./chainpulse.db
SECRET_KEY=change-me-in-production
FRONTEND_URL=http://localhost:8000

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# LLM / chat provider
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4

# Real-time intelligence
NEWS_API_KEY=
WEATHER_API_KEY=
NEWS_FETCH_INTERVAL_MINUTES=30
WEATHER_FETCH_INTERVAL_MINUTES=60
```

### 5. Run the app

Recommended:

```powershell
.\venv\Scripts\python.exe run_all.py
```

`run_all.py` checks for missing backend packages before launch and exits with a clear fix command if the environment is incomplete.

### 6. Open the frontend

```text
http://127.0.0.1:8000
```

## Running services individually

### Backend only

```powershell
.\venv\Scripts\python.exe backend\run.py
```

Backend URL:

```text
http://localhost:5000
```

### Frontend only

```powershell
cd frontend
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:8000
```

Note:

- the frontend uses `--strictPort`
- if port `8000` is busy, Vite fails instead of silently switching ports
- if PowerShell blocks `npm`, use `cmd /c npm run dev`

Alternative launcher from the project root:

```powershell
.\venv\Scripts\python.exe run_frontend.py
```

## Default login

On first successful backend startup, the app seeds a default admin user if the database is empty:

- username: `admin`
- email: `admin@chainpulse.ai`
- password: `admin123`

If login feels like it is "hanging", it usually means the backend is not running or is missing dependencies. Start by checking whether `http://localhost:5000/api/health` responds.

## Backend highlights

### Main services

- `backend/app/main.py`
  - FastAPI app
  - route registration
  - pipeline lifecycle
  - PDF generation
  - startup seeding
- `backend/app/services/auth_service.py`
  - password hashing
  - JWT creation and validation
  - role guards
- `backend/app/services/email_service.py`
  - welcome email
  - pipeline completion email
- `backend/app/services/news_service.py`
  - NewsAPI integration with mock fallback
- `backend/app/services/weather_service.py`
  - OpenWeatherMap integration with mock fallback
- `backend/app/services/orchestrator.py`
  - async multi-agent pipeline execution

### Database tables

- `users`
- `pipeline_runs`
- `alerts`
- `chat_history`

### Supply chain functional coverage

ChainPulse now covers the main operational agent flows you listed:

- `Inventory and order management`: inventory levels, reorder alerts, demand forecasting, order backlog, fill-rate visibility
- `Warehouse operations`: warehouse utilization, staffing gaps, storage health, pending shipments, picking efficiency
- `Logistics and transportation`: shipment tracking, delay monitoring, disruption-linked lanes, route-focused recommendations
- `Supplier management`: supplier portfolio, risk scoring, disruption exposure, alternate supplier recommendations
- `Cross-functional coordination`: multi-agent orchestration, war room execution, shared recommendations, PDF reporting, alerts

### Protected route pattern

- public: auth login/register/refresh
- viewer+: dashboard, suppliers, shipments, chat, reports, intelligence
- analyst+: pipeline execution, war room
- admin: user management

## Frontend highlights

### Main files

- `frontend/src/App.jsx`
  - routing
  - protected route boundaries
- `frontend/src/context/AuthContext.jsx`
  - session state
- `frontend/src/hooks/useAuth.js`
  - auth hook
- `frontend/src/utils/api.js`
  - authenticated API client
  - timeout and error handling
- `frontend/src/pages/Auth.jsx`
  - login/register screen
- `frontend/src/components/shared/NewsFeed.jsx`
  - live intelligence feed widget

## Real-time intelligence

ChainPulse can combine:

- NewsAPI headlines for supply chain disruption detection
- OpenWeatherMap weather checks for supplier-country risk alerts

Available backend endpoints:

- `GET /api/intelligence/news`
- `GET /api/intelligence/weather`
- `GET /api/intelligence/feed`

If the keys are missing, the services fall back to mock data so the UI still works.

## Legacy advanced system notes

Before the current web app structure, this project also explored a broader hackathon-style agent platform with:

- expanded multi-agent orchestration
- digital twin simulations
- standalone email/report generation flows
- sustainability and cost-impact experiments

If you want to explore those modules, the most relevant entrypoints are:

- `advanced_orchestrator.py`
- `digital_twin.py`
- `dashboard.py`
- `copilot.py`

Treat those as secondary or experimental compared with the current backend/frontend application.

## Reports

PDF reports are generated by the backend and downloaded through authenticated frontend requests.

Main endpoint:

- `GET /api/report/download/{run_id}`

## Deployment

ChainPulse is prepared for:

- `Railway` for the FastAPI backend
- `Vercel` for the React + Vite frontend

### Backend on Railway

- Root directory: `backend`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health endpoints:
  - `GET /health`
  - `GET /api/health`
- API docs: `/docs`

Recommended Railway environment variables:

```env
SECRET_KEY=change-this-in-railway
DATABASE_URL=sqlite:////tmp/chainpulse.db
FRONTEND_URL=https://your-vercel-project.vercel.app
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4
NEWS_API_KEY=
WEATHER_API_KEY=
SMTP_USER=
SMTP_PASSWORD=
```

Notes:

- The backend now defaults to `/tmp/chainpulse.db` and `/tmp/logs/app.log` when running on Railway.
- CORS allows local development origins plus `FRONTEND_URL` and any extra `CORS_ORIGINS` you configure.

### Frontend on Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Set these Vercel environment variables:

```env
VITE_API_BASE=https://your-railway-service.up.railway.app/api
VITE_WS_BASE=wss://your-railway-service.up.railway.app/ws
```

Helpful files already included:

- `frontend/vercel.json`
- `frontend/.env.development`
- `frontend/.env.production`
- `backend/Procfile`
- `backend/nixpacks.toml`
- `backend/runtime.txt`

## Testing and validation

### Python syntax checks

```powershell
.\venv\Scripts\python.exe -m py_compile backend\app\main.py
```

### Backend tests

```powershell
.\venv\Scripts\python.exe -m pytest -q
```

### Frontend build

```powershell
cd frontend
cmd /c npm run build
cd ..
```

## Common issues

### Backend request timed out on login

Cause:

- backend not running
- backend missing packages such as `fastapi`

Fix:

```powershell
.\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\venv\Scripts\python.exe backend\run.py
```

### `run_all.py` stops immediately

Cause:

- missing backend dependencies
- frontend port `8000` already in use

Fix:

- install backend requirements
- stop the process already using `8000`, then rerun

### News or weather feed shows mock data

Cause:

- `NEWS_API_KEY` or `WEATHER_API_KEY` not configured

Fix:

- add valid keys to `.env`
- restart the backend

## Useful commands

### Install backend requirements

```powershell
.\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

### Start backend

```powershell
.\venv\Scripts\python.exe backend\run.py
```

### Start frontend

```powershell
.\venv\Scripts\python.exe run_frontend.py
```

### Start both

```powershell
.\venv\Scripts\python.exe run_all.py
```

## Notes

- The repo still contains older hackathon-era scripts and documents that do not reflect the current FastAPI + React app exactly.
- This README is intentionally centered on the current working app, not the older experimental surfaces.
- The backend uses a mix of live integrations and mock fallback behavior so the UI remains usable without every external API configured.
- For deeper deployment or feature-specific notes, also see `DEPLOYMENT.md` and `FEATURES.md`.
