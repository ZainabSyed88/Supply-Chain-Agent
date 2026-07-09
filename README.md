# ChainPulse

ChainPulse is an AI-powered supply chain control tower built for disruption monitoring, risk analysis, and operational decision support.

This repository contains the current product app inside `supply_chain_agent/`, along with generated runtime logs in `output/`.

## Main App

The active application lives in:

- `supply_chain_agent/backend` - FastAPI API, auth, pipeline, reports, and WebSocket services
- `supply_chain_agent/frontend` - React + Vite dashboard and landing experience
- `supply_chain_agent/tests` - backend-focused regression tests

## Quick Start

From the `supply_chain_agent` directory:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python backend\run_api.py
```

In a second terminal:

```powershell
cd supply_chain_agent\frontend
npm install
npm run dev
```

## Local URLs

- Frontend: `http://127.0.0.1:8000`
- Backend: `http://localhost:5000`
- API docs: `http://localhost:5000/docs`

## Detailed Documentation

For the full setup guide, environment variables, architecture notes, and testing commands, see [supply_chain_agent/README.md](supply_chain_agent/README.md).
