const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

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
  incident_metadata: Record<string, unknown>;
  attack_chain?: unknown[] | Record<string, unknown> | null;
  evidence?: Record<string, unknown> | unknown[] | null;
  ai_summary?: string | null;
}

export async function fetchLatestIncident(): Promise<IncidentSummary | null> {
  const response = await fetch(`${apiBaseUrl}/v1/incidents`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GET /v1/incidents failed with ${response.status}`);
  }

  const data = (await response.json()) as IncidentListResponse;
  return data.incidents[0] ?? null;
}

export async function generateIncidentReport(incidentId: string): Promise<Blob> {
  const response = await fetch(`${apiBaseUrl}/v1/incidents/${incidentId}/report`, {
    method: "POST",
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    throw new Error(`POST /v1/incidents/${incidentId}/report failed with ${response.status}`);
  }

  return response.blob();
}
