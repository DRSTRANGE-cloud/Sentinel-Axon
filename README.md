# Sentinel AI

**Agentic AI for Real-Time Cybersecurity Investigation**

> Detect • Correlate • Investigate • Explain • Respond

## Overview

Sentinel AI is an agentic AI-powered SOC platform that transforms fragmented security telemetry into correlated, risk-scored, evidence-backed incidents.

Instead of showing analysts isolated alerts, Sentinel correlates related events, reconstructs attack activity, applies deterministic risk scoring, and uses specialized AI agents to produce investigation findings and response recommendations.

**Core idea:** Turn raw security logs into explained, investigated, and actionable incidents.

**Integration model:** An external application sends telemetry to Sentinel through the Security Events API. Sentinel does not scan arbitrary websites by itself.

---

## Table of Contents

- [Key Features](#key-features)
- [Architecture](#architecture)
- [Core Data Model](#core-data-model)
- [AI Agents](#ai-agents)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [API Surface](#api-surface)
- [Getting Started](#getting-started)
- [Investigation Workflow](#investigation-workflow)
- [Troubleshooting](#troubleshooting)
- [Design Principles](#design-principles)
- [License](#license)

---

## Key Features

- **Real-Time Event Monitoring** — Ingests authentication and application telemetry such as failed logins, IP changes, and new-device activity.
- **Threat Detection & Correlation** — Identifies suspicious patterns and connects related events into an attack chain.
- **Deterministic Risk Scoring** — Calculates a transparent, reproducible risk score and severity from detected security factors.
- **Multi-Agent AI Investigation** — Uses dedicated agents for log analysis, threat investigation, and response recommendations.
- **Incident Management** — Persists attack type, severity, risk score, evidence, attack chain, AI summary, and status.
- **Evidence Inspection** — Lets analysts inspect the telemetry supporting an incident.
- **Response Recommendations** — Provides AI-generated actions without falsely representing recommendations as executed actions.
- **Incident Reports** — Generates structured reports from persisted incident data without running another AI investigation.
- **Sensitive Data Redaction** — Redacts fields such as `password`, `secret`, `token`, `api_key`, `apikey`, and `authorization` from reports.

---

## Architecture

```text
Security Event
      ↓
Event Ingestion & Normalization
      ↓
Threat Detection
      ↓
Event Correlation / Attack Chain
      ↓
Deterministic Risk Scoring
      ↓
┌─────────────────────────────────────┐
│       AI Investigation Layer        │
│                                      │
│  Log Analysis Agent                 │
│  Threat Investigation Agent         │
│  Response Recommendation Agent      │
└──────────────────┬───────────────────┘
                    ↓
             Incident Creation
                    ↓
        Evidence + AI Findings
                    ↓
         Response Recommendations
                    ↓
            Incident Report
```

### Deterministic + AI Design

- **Deterministic layer:** event persistence, detection, correlation, risk scoring, and evidence form the authoritative security record.
- **AI layer:** investigation, explanation, and response recommendations reason over that verified security context.

This keeps the core security outputs reproducible and evidence-based while using AI where contextual reasoning adds value.

---

## Core Data Model

| Concept | Meaning |
|---|---|
| **Events** | What happened |
| **Agent Outputs** | What the AI analyzed/concluded |
| **Incidents** | The security conclusion |
| **Incident Events** | Events associated with an incident |

---

## AI Agents

| Agent | Responsibility |
|---|---|
| **Log Analysis Agent** | Interprets raw security telemetry and identifies meaningful signals. |
| **Threat Investigation Agent** | Correlates activity and assesses the security significance of the incident. |
| **Response Recommendation Agent** | Generates recommended response actions from the investigation context. |

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Sonner |
| **Backend** | Python, FastAPI, SQLAlchemy |
| **Database** | PostgreSQL (Neon) |
| **AI** | Groq-hosted LLM + multi-agent investigation |
| **Deployment** | Vercel · Render · Neon |

---

## Project Structure

```text
Sentinel-Axon/
├── Backend/
│   ├── app/
│   │   ├── api/routes/       # API endpoints
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Request/response schemas
│   │   ├── services/         # Application services
│   │   └── main.py           # FastAPI entry point
│   └── requirements.txt
│
├── Frontend/
│   ├── app/                  # Next.js routes/pages
│   ├── components/           # UI components
│   ├── lib/                  # API/client utilities
│   └── package.json
│
└── README.md
```

---

## API Surface

All endpoints are versioned under `/v1`.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/v1/health` | Backend health check |
| `GET` | `/v1/events` | Security telemetry for the Logs interface |
| `GET` | `/v1/incidents` | List persisted incidents |
| `GET` | `/v1/incidents/{id}` | Retrieve an incident and investigation context |
| `POST` | `/v1/incidents/{id}/report` | Generate an incident report |

Health response:

```json
{
  "status": "ok",
  "service": "sentinel-ai-backend"
}
```

Interactive API documentation: `http://127.0.0.1:8000/docs`

### Event Telemetry Fields

```text
created_at, event_type, application_id, ip_address, user_identifier,
user_agent, device_name, location, risk_points, event_metadata
```

### Incident Fields

```text
id, application_id, title, attack_type, severity, risk_score,
status, attack_chain, evidence, ai_summary
```

---

## Getting Started

### Prerequisites

- Python 3.x
- Node.js + npm
- PostgreSQL-compatible database (Neon)
- Groq API key

### 1. Backend

```bash
cd Backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend: `http://127.0.0.1:8000`

### 2. Frontend

Open a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

### Environment Variables

```bash
# Backend
DATABASE_URL=<postgresql-connection-string>
GROQ_API_KEY=<groq-api-key>

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Use the backend configuration files as the source of truth for exact variable names. Never commit real secrets or `.env` files.

---

## Investigation Workflow

```text
Security Event
     ↓
Persist Telemetry
     ↓
Detect Suspicious Activity
     ↓
Correlate Related Events
     ↓
Calculate Risk
     ↓
AI Investigation
     ↓
Create Incident
     ↓
Review Evidence & Findings
     ↓
Review Response Recommendations
     ↓
Generate Report
```

The frontend is designed around the analyst's key questions:

> What happened? → Why is it suspicious? → What evidence supports it? → How did it progress? → What does the AI conclude? → What should be considered next?

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Port 8000 already in use** | `netstat -ano \| findstr :8000` — check whether an existing backend is already running before starting another instance. |
| **`<<<<<<< HEAD` syntax error** | Unresolved Git conflict markers. Run `git grep -n -E "^(<<<<<<<\|=======\|>>>>>>>)"`, resolve the conflicts, then validate with `cd Backend && python -m compileall app`. |
| **`'next' is not recognized`** | Run `cd Frontend && npm install`, then `npm run dev`. |
| **Frontend cannot reach backend** | Check `http://127.0.0.1:8000/v1/health`, verify `NEXT_PUBLIC_API_BASE_URL`, and restart the Next.js server after changing environment variables. |
| **Incident API returns 404 after changes** | Restart the FastAPI server so the updated route table is loaded. |

---

## Design Principles

- **Evidence First** — Security conclusions remain tied to observable telemetry.
- **Deterministic Risk** — Risk scoring is reproducible rather than solely LLM-derived.
- **Specialized AI** — Investigation responsibilities are divided across dedicated agents.
- **No Fake Execution** — Recommendations are never presented as executed without backend evidence.
- **Analyst-Centric UX** — Prioritizes investigation context over raw alert volume.
- **Progressive Disclosure** — Detailed evidence and attack sequences remain available without overwhelming the main dashboard.

---

## License

This project is licensed under the [MIT License](LICENSE).