import type { LogLevel, LogRecord } from "./types";
import { formatIstTimestamp } from "@/lib/time";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

interface EventsApiResponse {
  events: BackendEvent[];
  total: number;
}

interface BackendEvent {
  id: string;
  application_id: string;
  event_type: string;
  created_at: string;
  user_identifier?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  device_name?: string | null;
  location?: string | null;
  event_metadata: Record<string, unknown>;
  risk_points: number;
}

export async function fetchEventLogs(limit = 50): Promise<LogRecord[]> {
  const response = await fetch(`${apiBaseUrl}/v1/events?limit=${limit}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GET /v1/events failed with ${response.status}`);
  }

  const data = (await response.json()) as EventsApiResponse;
  return data.events.map(mapEventToLogRecord);
}

function mapEventToLogRecord(event: BackendEvent): LogRecord {
  return {
    id: event.id,
    timestamp: formatIstTimestamp(event.created_at),
    level: getLevel(event.event_metadata),
    source: event.ip_address ?? event.user_identifier ?? "Unknown",
    application: event.application_id,
    event: event.event_type,
    message: buildEventMessage(event),
    relatedForensicsId: event.id,
    raw: {
      ...event.event_metadata,
      id: event.id,
      application_id: event.application_id,
      event_type: event.event_type,
      created_at: formatIstTimestamp(event.created_at),
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
  const actor = event.user_identifier ? ` for ${event.user_identifier}` : "";
  const origin = event.ip_address ? ` from ${event.ip_address}` : "";
  const device = event.device_name ? ` on ${event.device_name}` : "";

  return `${event.event_type}${actor}${origin}${device}`.trim();
}
