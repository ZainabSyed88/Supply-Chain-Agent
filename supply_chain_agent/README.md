# ChainPulse

ChainPulse is a supply chain control tower built around a FastAPI backend, a React frontend, and a staged disruption-response pipeline. The current repo includes the shipped web app plus earlier hackathon agents and orchestration experiments.

## What Is Current

The actively wired product lives in:

- `backend/` for the FastAPI API, auth, pipeline, reports, and WebSocket streams
- `frontend/` for the Vite + React dashboard
- `tests/` for backend-focused regression coverage

Older prototype scripts such as top-level orchestrators and standalone agents are still in the repo, but they are not the main runtime path for the web app.

## Current Product Surface

- Landing page and auth flow (`/`, `/login`, `/register`)
- Role-based access for `admin`, `analyst`, and `viewer`
- Dashboard, Orders, Suppliers, Shipments, Warehouses, ESG, Reports, Support, and Map views
- War Room for running the multi-agent pipeline
- Copilot chat backed by OpenAI when configured, with a local fallback path
- Live pipeline progress and alert streams over WebSockets
- PDF report download for completed pipeline runs

## Tech Stack

### Backend

- `FastAPI`
- `uvicorn`
- `SQLAlchemy`
- JWT auth with `python-jose`
- `passlib` for password hashing
- `loguru` for logging
- `reportlab` for PDF export

### Frontend

- `React 18`
- `Vite`
- `react-router-dom`
- `Tailwind CSS`
- `Recharts`
- `react-leaflet`
- `framer-motion`

## Project Structure

```text
supply_chain_agent/
|- agents/                  # earlier prototype agents
|- backend/                 # current API app
|  |- app/
|  |  |- core/
|  |  |- data/
|  |  |- models/
|  |  |- routers/
|  |  `- services/
|  |- .env.example
|  |- requirements.txt
|  |- run.py
|  `- run_api.py
|- frontend/                # current Vite app
|  |- src/
|  `- package.json
|- tests/
|- data/                    # legacy data and utilities
|- utils/
`- README.md
```

## Local Setup

Run these commands from the `supply_chain_agent` directory.

### 1. Create and activate a virtual environment

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install backend dependencies

```powershell
pip install -r backend\requirements.txt
```

### 3. Create the backend environment file

```powershell
Copy-Item backend\.env.example backend\.env
```

Set at least these values in `backend/.env`:

- `SECRET_KEY`
- `ADMIN_BOOTSTRAP_USERNAME`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`

Recommended optional values:

- `ADMIN_BOOTSTRAP_FULL_NAME`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NEWS_API_KEY`
- `WEATHER_API_KEY`
- `FRONTEND_URL`

Notes:

- The first four bootstrap values are only needed to create the initial admin in an empty database.
- The backend also reads a root `.env`, but `backend/.env` is the clearest place to keep local backend config.

### 4. Start the backend

```powershell
python backend\run_api.py
```

Backend URLs:

- API root: `http://localhost:5000`
- Health: `http://localhost:5000/health`
- API health: `http://localhost:5000/api/health`
- OpenAPI docs: `http://localhost:5000/docs`

### 5. Start the frontend

Open a second terminal in `supply_chain_agent` and run:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://127.0.0.1:8000`

## Frontend Environment

The frontend reads these environment variables:

- `VITE_API_BASE` with default `http://localhost:5000/api`
- `VITE_WS_BASE` with default `ws://localhost:5000/ws`

If you do not set them, local development still works with the defaults above.

## Pipeline Shape

The current War Room pipeline is organized into three stages:

1. `Supplier Monitor` and `Disruption Detector`
2. `Risk Assessor` and `Mitigation`
3. `Stakeholder Notification`

Useful runtime endpoints:

- `POST /api/pipeline/run`
- `GET /api/pipeline/runs`
- `GET /api/pipeline/history`
- `GET /api/pipeline/latest`
- `GET /api/pipeline/timing`
- `GET /api/pipeline/{run_id}`
- `GET /api/report/download/{run_id}`
- WebSocket: `/ws/pipeline/{run_id}`
- WebSocket: `/ws/alerts`

## Auth and API Notes

- Most business endpoints require a JWT bearer token.
- `viewer` can access read-only operational screens.
- `analyst` and `admin` can access the War Room.
- Public health checks are available at `/health` and `/api/health`.

Main router groups currently include:

- `/api/auth`
- `/api/agents`
- `/api/chat`
- `/api/disruptions`
- `/api/intelligence`
- `/api/inventory`
- `/api/orders`
- `/api/shipments`
- `/api/suppliers`
- `/api/tickets`
- `/api/warehouses`

## Testing

Backend tests:

```powershell
pytest tests -q
```

Quick backend import check:

```powershell
python -m py_compile backend\app\main.py
```

Frontend production build:

```powershell
cd frontend
npm run build
```

## Known Repo Notes

- `run.py` and `run_api.py` both start the FastAPI app on port `5000`.
- Local persistence defaults to SQLite via `./chainpulse.db` unless you override `DATABASE_URL`.
