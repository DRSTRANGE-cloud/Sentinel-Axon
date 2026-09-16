# 🛡️ Sentinel AI

### Agentic AI for Real-Time Cybersecurity Investigation

> **Detect • Correlate • Investigate • Explain • Respond**

Sentinel AI is an **agentic AI-powered Security Operations Center (SOC) platform** that transforms fragmented security telemetry into **correlated, risk-scored, evidence-backed security incidents**.

Instead of presenting analysts with isolated alerts, Sentinel correlates related events, reconstructs attack activity, applies deterministic risk scoring, and uses specialized AI agents to generate investigation findings and response recommendations.

> 🎯 **Core Idea:** Turn raw security logs into explained, investigated, and actionable incidents.

**Integration Model:** An external application sends security telemetry to Sentinel through the Security Events API. Sentinel does not independently scan arbitrary websites or applications.

---

## ✨ Key Features

| Capability | Description |
|---|---|
| 📡 **Real-Time Event Monitoring** | Ingests authentication and application telemetry such as failed logins, IP changes, new devices, and related security events. |
| 🔎 **Threat Detection & Correlation** | Identifies suspicious patterns and connects related events into a coherent attack chain. |
| 📊 **Deterministic Risk Scoring** | Calculates a transparent and reproducible risk score and severity from defined security factors. |
| 🤖 **Multi-Agent AI Investigation** | Uses specialized AI agents for log analysis, threat investigation, and response recommendations. |
| 🚨 **Incident Management** | Persists attack type, severity, risk score, evidence, attack chain, AI summary, and incident status. |
| 🧬 **Attack Chain Analysis** | Reconstructs the progression of suspicious activity from correlated security events. |
| 🔬 **Evidence Inspection** | Allows analysts to inspect the telemetry and evidence supporting an incident. |
| 💡 **Response Recommendations** | Generates AI-assisted response actions without representing recommendations as automatically executed actions. |
| 📄 **Incident Reports** | Generates structured reports from persisted incident data without running another AI investigation. |
| 🔐 **Sensitive Data Redaction** | Redacts fields such as `password`, `secret`, `token`, `api_key`, `apikey`, and `authorization` from reports. |
| 🖥️ **SOC Dashboard** | Provides a centralized interface for events, incidents, investigation findings, evidence, and response information. |

---

## 🏗️ Architecture

```text
┌──────────────────────┐
│   Security Events    │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Event Ingestion &    │
│ Normalization        │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Threat Detection     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Event Correlation &  │
│ Attack Chain         │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Deterministic Risk   │
│ Scoring              │
└──────────┬───────────┘
           ↓
┌─────────────────────────────────────┐
│       AI Investigation Layer        │
│                                     │
│  🔹 Log Analysis Agent              │
│  🔹 Threat Investigation Agent      │
│  🔹 Response Recommendation Agent   │
└──────────────────┬──────────────────┘
                   ↓
          ┌─────────────────┐
          │ Incident        │
          │ Creation        │
          └────────┬────────┘
                   ↓
          Evidence + AI Findings
                   ↓
          Response Recommendations
                   ↓
             Incident Report
```

### 🧠 Deterministic + AI Design

Sentinel AI deliberately separates **authoritative security processing** from **generative AI reasoning**.

**Deterministic Layer**

* Event persistence
* Threat detection
* Event correlation
* Attack-chain construction
* Risk scoring
* Evidence management
* Incident persistence

**AI Layer**

* Log interpretation
* Threat investigation
* Incident explanation
* Contextual reasoning
* Response recommendations

This keeps core security outputs **reproducible and evidence-based**, while using AI where contextual reasoning adds value.

---

## 🧬 Core Data Model

Sentinel separates different stages of security intelligence:

```text
Events
  │
  └── What happened

Agent Outputs
  │
  └── What the AI analyzed or concluded

Incidents
  │
  └── The resulting security conclusion

Incident Events
  │
  └── Events associated with an incident
```

This separation keeps raw telemetry, AI reasoning, and incident conclusions distinct.

---

## 🤖 Multi-Agent Investigation

| Agent | Responsibility |
|---|---|
| 📝 **Log Analysis Agent** | Interprets raw security telemetry and identifies meaningful signals. |
| 🔍 **Threat Investigation Agent** | Correlates activity and evaluates the security significance of observed behavior. |
| 🛠️ **Response Recommendation Agent** | Generates recommended response actions from the investigation context. |

### Response Principle

```text
AI Recommendation
       ≠
Executed Security Action
```

A response is considered executed only when corresponding execution evidence is provided by the backend.

---

## 📊 Technology Stack

| Layer | Technologies |
|---|---|
| 🎨 **Frontend** | Next.js · TypeScript · Tailwind CSS · shadcn/ui · Recharts · Framer Motion · Sonner |
| ⚙️ **Backend** | Python · FastAPI · SQLAlchemy |
| 🗄️ **Database** | PostgreSQL · Neon |
| 🧠 **AI Layer** | Groq-hosted LLM · Multi-Agent Investigation |
| ☁️ **Deployment** | Vercel · Render · Neon |

---

## 📁 Project Structure

```text
Sentinel-Axon/
│
├── Backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/         # API endpoints
│   │   ├── models/             # Database models
│   │   ├── schemas/            # Request/response schemas
│   │   ├── services/           # Application services
│   │   └── main.py             # FastAPI entry point
│   │
│   └── requirements.txt
│
├── Frontend/
│   ├── app/                    # Next.js routes/pages
│   ├── components/             # UI components
│   ├── lib/                    # API/client utilities
│   └── package.json
│
└── README.md
```

---

## 🔌 API Surface

All backend endpoints are versioned under `/v1`.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/v1/health` | Backend health check |
| `GET` | `/v1/events` | Security telemetry consumed by the Logs interface |
| `GET` | `/v1/incidents` | Retrieve persisted incidents |
| `GET` | `/v1/incidents/{id}` | Retrieve an incident and investigation context |
| `POST` | `/v1/incidents/{id}/report` | Generate a structured incident report |

### Health Check

```json
{
  "status": "ok",
  "service": "sentinel-ai-backend"
}
```

### API Documentation

When running locally:

```text
http://127.0.0.1:8000/docs
```

### Event Telemetry

Events can contain:

```text
created_at
event_type
application_id
ip_address
user_identifier
user_agent
device_name
location
risk_points
event_metadata
```

### Incident Data

Incidents contain information such as:

```text
id
application_id
title
attack_type
severity
risk_score
status
attack_chain
evidence
ai_summary
```

---

## 🚀 Getting Started

### Prerequisites

* Python 3.x
* Node.js + npm
* PostgreSQL-compatible database / Neon
* Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/DRSTRANGE-cloud/Sentinel-Axon.git
cd Sentinel-Axon
```

### 2. Start the Backend

```powershell
cd Backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

### 3. Start the Frontend

Open a second terminal:

```powershell
cd Frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

### 🔑 Environment Variables

```env
# Backend
DATABASE_URL=<postgresql-connection-string>
GROQ_API_KEY=<groq-api-key>

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Use the backend configuration files as the source of truth for exact environment variable names.

> ⚠️ Never commit real credentials, API keys, or `.env` files containing secrets.

---

## 🔄 Investigation Workflow

```text
Security Event
      ↓
Persist Telemetry
      ↓
Threat Detection
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
Generate Incident Report
```

The analyst workflow is centered around:

> **What happened? → Why is it suspicious? → What evidence supports it? → How did it progress? → What does the AI conclude? → What should be considered next?**

---

## 🛠️ Troubleshooting

### Port `8000` Already in Use

```powershell
netstat -ano | findstr :8000
```

Check whether an existing backend instance is already running before starting another.

### `<<<<<<< HEAD` Syntax Error

This indicates unresolved Git merge-conflict markers.

```powershell
git grep -n -E "^(<<<<<<<|=======|>>>>>>>)"
```

Resolve the conflicts, then validate the backend:

```powershell
cd Backend
python -m compileall app
```

### `'next' is not recognized`

Install the frontend dependencies:

```powershell
cd Frontend
npm install
npm run dev
```

### Frontend Cannot Reach Backend

Verify:

```text
http://127.0.0.1:8000/v1/health
```

Then check:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Restart the Next.js server after changing environment variables.

### Incident API Returns `404`

Restart the FastAPI server so the updated route table is loaded.

---

## 🎯 Design Principles

* **🔬 Evidence First** — Security conclusions remain tied to observable telemetry and persisted evidence.
* **📊 Deterministic Risk** — Risk scoring is reproducible rather than solely LLM-derived.
* **🤖 Specialized AI** — Investigation responsibilities are divided across dedicated agents.
* **🚫 No Fake Execution** — Recommendations are never presented as executed without backend evidence.
* **🧑‍💻 Analyst-Centric UX** — The interface prioritizes investigation context over raw alert volume.
* **📖 Progressive Disclosure** — Detailed evidence and attack sequences remain accessible without overwhelming the primary dashboard.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🔗 Repository

**Sentinel-Axon**

[https://github.com/DRSTRANGE-cloud/Sentinel-Axon](https://github.com/DRSTRANGE-cloud/Sentinel-Axon)

---

<p align="center">
  <strong>Sentinel AI</strong><br>
  From fragmented security telemetry to explained, actionable incidents.
</p>