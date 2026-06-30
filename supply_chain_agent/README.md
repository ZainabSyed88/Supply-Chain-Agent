# ChainPulse

AI-assisted supply chain control tower for disruption detection, operational triage, and mitigation planning.

## Live Demo

- Frontend: `https://chainpulseapp.vercel.app`
- Backend API: `https://soothing-adventure-production-86ec.up.railway.app`
- Authentication note: most backend endpoints require a JWT. If you open the API URL directly without first authenticating through the frontend, you should expect a response such as `{"detail":"Not authenticated"}`.

## Quick Start (Local Development)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd supply_chain_agent
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies and create the backend environment file:

```powershell
pip install -r requirements.txt
Copy-Item .env.example .env
```

Update `.env` with at least:

- `SECRET_KEY`
- `ADMIN_BOOTSTRAP_USERNAME`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`

Optional but recommended for the full copilot experience:

- `OPENAI_API_KEY`

Then run the API:

```powershell
python run_api.py
```

Alternative:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

### 3. Start the frontend

From the repository root, or after backend setup run `cd ..\frontend`:

```bash
cd frontend
npm install
npm run dev
```

Local URLs:

- Frontend: `http://127.0.0.1:8000`
- Backend: `http://localhost:5000`

## Current Product Surface

The deployed application consists of:

- `Dashboard`: KPIs, anomaly views, demand and carbon summaries
- `Orders`: backlog visibility and fulfillment risk
- `Suppliers`: supplier portfolio and risk scoring
- `Shipments`: delay and in-transit monitoring
- `Warehouses`: utilization and throughput visibility
- `War Room`: authenticated pipeline execution and live run telemetry
- `Reports`: persisted run history and PDF export
- `Copilot`: executive Q&A over current operational context
- `Supply Chain Map`: geographic risk and movement visualization
- `ESG Dashboard`: sustainability and carbon views
- `Support Tickets`: lightweight issue intake and tracking

## Architecture and Tech Stack

### Backend

- `FastAPI` application served by `uvicorn`
- `SQLAlchemy` for persistence
- JWT authentication using `python-jose` and `passlib`/bcrypt
- `loguru` for application logging
- WebSocket updates for pipeline progress and alerts
- PDF report generation with `reportlab`

### Frontend

- `React 18` with `Vite`
- `react-router-dom` for routing
- `Tailwind CSS` for styling
- `Recharts` for KPI and performance charts
- `react-leaflet` / `leaflet` for the supply chain map

### LLM Integration

- OpenAI API via `chat.completions`
- The Executive Copilot uses a single prompt built from live app context plus recent chat history
- If `OPENAI_API_KEY` is not configured or the request fails, the app falls back to a local rules-based copilot response

## Pipeline Architecture

The current backend pipeline and War Room UI are aligned on the same five agents:

1. `Supplier Monitor`
2. `Disruption Detector`
3. `Risk Assessor`
4. `Mitigation`
5. `Stakeholder Notification`

Execution model:

- Tier 1 runs `Supplier Monitor` and `Disruption Detector` in parallel
- Tier 2 runs `Risk Assessor` and `Mitigation` in parallel
- `Stakeholder Notification` runs last to preserve ordered output

## Authentication Model

Role-based access is enforced with JWTs:

- `admin`: full platform access
- `analyst`: operational access plus pipeline execution
- `viewer`: read-only access to permitted dashboards and reports

Public health endpoints:

- `GET /health`
- `GET /api/health`

Most business endpoints under `/api/*` require authentication.

## Project Structure

```text
supply_chain_agent/
|- backend/
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
|- frontend/
|  |- src/
|  |- package.json
|  `- vite.config.js
|- tests/
`- README.md
```

## Deployment

### Backend on Railway

Current deployment model:

- Platform: `Railway`
- Root Directory: `backend`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Recommended public endpoints:

- Health: `/health` or `/api/health`
- OpenAPI docs: `/docs`

Railway environment variables:

Required for deployed operation:

```env
SECRET_KEY=replace-with-a-long-random-secret
ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_EMAIL=admin@yourcompany.com
ADMIN_BOOTSTRAP_PASSWORD=replace-with-a-strong-password
OPENAI_API_KEY=...
FRONTEND_URL=https://chainpulseapp.vercel.app
```

Supported by the backend configuration and commonly set in Railway:

```env
ENVIRONMENT=production
DATABASE_URL=sqlite:////tmp/chainpulse.db
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
OPENAI_MODEL=gpt-4
NEWS_API_KEY=
WEATHER_API_KEY=
NEWS_FETCH_INTERVAL_MINUTES=30
WEATHER_FETCH_INTERVAL_MINUTES=60
ADMIN_BOOTSTRAP_FULL_NAME=ChainPulse Admin
RUN_TIMEOUT_SECONDS=30
LOG_LEVEL=INFO
LOG_FILE=/tmp/logs/app.log
LOG_ROTATION_SIZE=10 MB
LOG_BACKUP_COUNT=5
CORS_ORIGINS=["https://chainpulseapp.vercel.app"]
CACHE_TTL_SECONDS=60
```

Notes:

- The backend defaults to SQLite, and on Railway the fallback path is `/tmp/chainpulse.db`.
- `SECRET_KEY` is mandatory at startup.
- The initial admin bootstrap variables are required on first startup when the database is empty.
- `OPENAI_API_KEY` enables the live OpenAI-backed copilot; without it, the app still boots and falls back to the local copilot response path.
- CORS must explicitly allow the Vercel frontend domain. In practice, set `FRONTEND_URL=https://chainpulseapp.vercel.app` and include that domain in `CORS_ORIGINS` if you allow additional origins.

### Frontend on Vercel

Current deployment model:

- Platform: `Vercel`
- Root Directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Frontend environment variables:

```env
VITE_API_BASE=https://soothing-adventure-production-86ec.up.railway.app/api
VITE_WS_BASE=wss://soothing-adventure-production-86ec.up.railway.app/ws
```

Note:

- The checked-in frontend currently reads `VITE_API_BASE` and `VITE_WS_BASE` from `frontend/src/utils/constants.js`. If your Vercel project uses a `VITE_API_URL` naming convention, it should point to the same Railway backend, but the current code expects `VITE_API_BASE`.

## API and Runtime Notes

- The frontend talks to the REST API under `/api`.
- The War Room and alert stream use WebSockets under `/ws`.
- PDF reports are downloaded from `GET /api/report/download/{run_id}`.
- Most dashboard, supplier, shipment, ticket, chat, and pipeline history endpoints require a valid bearer token.

## Known Limitations / Future Work

- The Executive Copilot currently uses single-shot LLM prompting rather than full tool-calling or function-calling orchestration.
- SQLite is used instead of a production database such as Postgres. This is acceptable for demo scale, but it is not yet designed for concurrent multi-user production load.
- Pipeline run state is kept in memory. There is no Redis-backed state layer or persistent job queue yet.
- Formal database migration tooling such as Alembic is not in place yet, so schema changes currently require manual handling.
- Business-outcome metrics such as mitigation adoption rate or avoided-loss estimates are not yet tracked; current KPIs are primarily operational.

## Testing and Validation

Backend syntax check:

```powershell
python -m py_compile backend\app\main.py
```

Backend tests:

```powershell
pytest -q
```

Frontend production build:

```powershell
cd frontend
npm run build
```

## Repository Notes

- The repository still contains earlier hackathon prototype files outside the deployed FastAPI and React application.
- This README is intentionally scoped to the current shipped web product and the five-agent backend pipeline that powers the War Room.
