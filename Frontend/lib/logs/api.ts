import type { LogLevel, LogRecord } from "./types";
import { formatIstTimestamp } from "@/lib/time";
import { apiJson } from "@/lib/api";

interface EventsApiResponse {
  events: BackendEvent[];
  total: number;
}

interface BackendEvent {
  id: string;
  application_id?: string | null;
  event_type?: string | null;
  created_at?: string | null;
  user_identifier?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  device_name?: string | null;
  location?: string | null;
  event_metadata?: Record<string, unknown> | null;
  risk_points?: number | null;
}

export async function fetchEventLogs(limit = 50): Promise<LogRecord[]> {
  const data = await apiJson<EventsApiResponse>(`/v1/events?limit=${limit}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!data || !Array.isArray(data.events)) {
    throw new Error("GET /v1/events returned an unexpected response shape.");
  }
  if (data.events.some((event) => !event || typeof event.id !== "string" || !event.id)) {
    throw new Error("GET /v1/events returned an event without a valid ID.");
  }

  return data.events.map(mapEventToLogRecord);
}

function mapEventToLogRecord(event: BackendEvent): LogRecord {
  const metadata = event.event_metadata ?? {};
  const eventType = event.event_type || "Unknown";

  return {
    id: event.id,
    timestamp: event.created_at ? formatIstTimestamp(event.created_at) : "Unknown",
    level: getLevel(metadata),
    source: event.ip_address ?? event.user_identifier ?? "Unknown",
    application: event.application_id || "Unknown",
    event: eventType,
    message: buildEventMessage(event),
    relatedForensicsId: event.id,
    raw: {
      ...metadata,
      id: event.id,
      application_id: event.application_id,
      event_type: eventType,
      created_at: event.created_at ? formatIstTimestamp(event.created_at) : null,
      user_identifier: event.user_identifier,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      device_name: event.device_name,
      location: event.location,
      risk_points: event.risk_points,
    },
  };
}

function getLevel(metadata: Record<string, unknown>): LogLevel {
  const rawLevel = metadata.level ?? metadata.severity;

  if (typeof rawLevel !== "string") {
    return "UNKNOWN";
  }

  const normalized = rawLevel.toUpperCase();
  const levels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"];

  return levels.includes(normalized as LogLevel) ? (normalized as LogLevel) : "UNKNOWN";
}

function buildEventMessage(event: BackendEvent) {
  const eventType = event.event_type || "Unknown";
  const actor = event.user_identifier ? ` for ${event.user_identifier}` : "";
  const origin = event.ip_address ? ` from ${event.ip_address}` : "";
  const device = event.device_name ? ` on ${event.device_name}` : "";

  return `${eventType}${actor}${origin}${device}`.trim();
}
