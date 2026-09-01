This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Sentinel AI

**Plug in your application. Let AI investigate the threats.**

Sentinel AI is an agentic AI cybersecurity assistant (SIH26-S01) that ingests security telemetry from connected applications, detects and correlates suspicious activity, runs multi-agent AI investigation, and produces analyst-ready incident reports. This repo contains the frontend — a Security Operations Center (SOC) dashboard built with Next.js.

Sentinel does not scan arbitrary websites. An external application must explicitly send events to the Sentinel Security API before it can be monitored.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React
- **Backend:** FastAPI (Python)

---

## Getting Started

### 1. Start the backend

```bash
cd Backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Start the frontend

```bash
cd Frontend
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### 3. Point the frontend at a different backend (optional)

By default the frontend calls `http://127.0.0.1:8000`. To use a different backend URL, set:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### 4. Verify the backend is up

```http
GET /v1/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "sentinel-ai-backend"
}
```

---

## App Routes & Data Sources

| Route | Purpose | Backend Source |
|---|---|---|
| `/logs` | Real-time security event telemetry. Polls the backend, no dummy data. | `GET /v1/events` |
| `/outcomes` | Latest incident: summary, risk context, attack sequence, evidence snapshot. Recommendations are intentionally not shown here. | `GET /v1/incidents` |

### Logs page — key event fields

- `created_at`
- `event_type`
- `application_id`
- `ip_address`
- `user_identifier`
- `user_agent`
- `device_name`
- `location`
- `risk_points`
- `event_metadata`

### Outcomes page — key incident fields

- `id`
- `application_id`
- `title`
- `description`
- `attack_type`
- `severity`
- `risk_score`
- `status`
- `attack_chain`
- `evidence`
- `ai_summary`

---

## Incident Report Generation

Triggered from the **Generate Incident Report** action on the Outcomes page.

```http
POST /v1/incidents/{incident_id}/report
```

The report is built entirely from data already stored in the backend (`incidents`, `incident_events`, `events`, `agent_outputs`) — generating a report does **not** trigger a new AI investigation call.

**Report sections:**

1. Incident Header
2. Executive Summary
3. Correlated Security Telemetry
4. Risk Breakdown
5. Multi-Agent AI Findings
6. Response Recommendations

**Redaction:** any field whose key contains `password`, `secret`, `token`, `api_key`, `apikey`, or `authorization` is redacted before the report is rendered.

---

## Troubleshooting

### `GET /v1/incidents` returns 404

FastAPI can keep a stale route table in memory across code changes. Restart the backend process, then verify:

```bash
curl http://127.0.0.1:8000/v1/incidents
```

Expected: HTTP `200` with an `incidents` array.

---
