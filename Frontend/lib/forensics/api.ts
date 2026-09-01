import { formatIstTimestamp } from "@/lib/time";
import type { Artifact, ForensicEvent, MetadataItem, Severity } from "./types";

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

export async function fetchForensicEvent(eventId?: string): Promise<ForensicEvent | null> {
  const response = await fetch(`${apiBaseUrl}/v1/events?limit=50`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GET /v1/events failed with ${response.status}`);
  }

  const data = (await response.json()) as EventsApiResponse;
  const event = eventId
    ? data.events.find((record) => record.id === eventId)
    : data.events[0];

  return event ? mapEventToForensicEvent(event) : null;
}

function mapEventToForensicEvent(event: BackendEvent): ForensicEvent {
  const metadata = event.event_metadata;
  const destinationIp = getString(metadata.destination_ip) ?? getString(metadata.dst_ip);
  const destinationPort = getNumber(metadata.destination_port) ?? getNumber(metadata.dst_port);
  const sourcePort = getNumber(metadata.source_port) ?? getNumber(metadata.src_port);
  const protocol = getString(metadata.protocol);
  const payload = getString(metadata.payload) ?? JSON.stringify(buildRawEvent(event), null, 2);

  return {
    id: event.id,
    timestamp: formatIstTimestamp(event.created_at),
    severity: getSeverity(metadata),
    application: event.application_id,
    source: {
      label: "Event source",
      ip: event.ip_address ?? "Unknown",
      port: sourcePort,
      hostname: event.user_identifier ?? undefined,
    },
    destination: {
      label: "Destination",
      ip: destinationIp ?? "Unknown",
      port: destinationPort,
    },
    protocol,
    payload,
    aiMetadata: buildAiMetadata(metadata),
    artifacts: buildArtifacts(event),
    mitre: [],
  };
}

function buildRawEvent(event: BackendEvent) {
  return {
    id: event.id,
    application_id: event.application_id,
    event_type: event.event_type,
    created_at: formatIstTimestamp(event.created_at),
    user_identifier: event.user_identifier,
    ip_address: event.ip_address,
    user_agent: event.user_agent,
    device_name: event.device_name,
    location: event.location,
    event_metadata: event.event_metadata,
    risk_points: event.risk_points,
  };
}

function buildArtifacts(event: BackendEvent): Artifact[] {
  return [
    event.ip_address ? { type: "IP", value: event.ip_address } : null,
    event.user_identifier ? { type: "USER", value: event.user_identifier } : null,
    event.device_name ? { type: "DEVICE", value: event.device_name } : null,
    event.location ? { type: "LOCATION", value: event.location } : null,
    { type: "EVENT", value: event.event_type },
    { type: "APP", value: event.application_id },
  ].filter((artifact): artifact is Artifact => artifact !== null);
}

function buildAiMetadata(metadata: Record<string, unknown>): MetadataItem[] {
  return [
    getString(metadata.confidence) ? { label: "Confidence", value: getString(metadata.confidence) as string } : null,
    getString(metadata.classification) ? { label: "Classification", value: getString(metadata.classification) as string } : null,
    getString(metadata.analysis_status) ? { label: "Analysis Status", value: getString(metadata.analysis_status) as string } : null,
    getString(metadata.correlation_id) ? { label: "Correlation ID", value: getString(metadata.correlation_id) as string } : null,
  ].filter((item): item is MetadataItem => item !== null);
}

function getSeverity(metadata: Record<string, unknown>): Severity {
  const rawSeverity = metadata.severity ?? metadata.level;

  if (typeof rawSeverity !== "string") {
    return "UNKNOWN";
  }

  const normalized = rawSeverity.toUpperCase();
  const severities: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  return severities.includes(normalized as Severity) ? (normalized as Severity) : "UNKNOWN";
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
