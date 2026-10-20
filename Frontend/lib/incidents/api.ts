import { apiBlob, apiJson } from "@/lib/api";

interface IncidentListResponse {
  incidents: IncidentSummary[];
  total: number;
}

export interface IncidentSummary {
  id: string;
  application_id: string;
  title: string;
  description?: string | null;
  attack_type?: string | null;
  severity: string;
  risk_score: number;
  status?: string | null;
  recommendation?: string | null;
  incident_metadata?: Record<string, unknown> | null;
  attack_chain?: unknown[] | Record<string, unknown> | null;
  evidence?: Record<string, unknown> | unknown[] | null;
  ai_summary?: string | null;
}

export async function fetchLatestIncident(): Promise<IncidentSummary | null> {
  const data = await apiJson<IncidentListResponse>("/v1/incidents", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!data || !Array.isArray(data.incidents)) {
    throw new Error("GET /v1/incidents returned an unexpected response shape.");
  }

  const incident = data.incidents[0];
  if (incident === undefined) return null;
  if (
    !incident ||
    typeof incident.id !== "string" ||
    typeof incident.application_id !== "string" ||
    typeof incident.title !== "string" ||
    typeof incident.severity !== "string" ||
    typeof incident.risk_score !== "number"
  ) {
    throw new Error("GET /v1/incidents returned an invalid incident record.");
  }

  return incident;
}

export async function generateIncidentReport(incidentId: string): Promise<Blob> {
  return apiBlob(`/v1/incidents/${encodeURIComponent(incidentId)}/report`, {
    method: "POST",
    headers: {
      Accept: "application/pdf",
    },
  });
}
