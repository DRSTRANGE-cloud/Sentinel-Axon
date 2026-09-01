export type Severity = "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Endpoint {
  label: string;
  ip: string;
  port?: number;
  hostname?: string;
}

export interface MetadataItem {
  label: string;
  value: string;
}

export interface Artifact {
  type: string;
  value: string;
}

export interface MitreTechnique {
  tactic: string;
  id: string;
  name: string;
}

export interface ForensicEvent {
  id: string;
  timestamp: string;
  severity: Severity;
  application: string;
  source: Endpoint;
  destination: Endpoint;
  protocol?: string;
  payload?: string;
  aiMetadata: MetadataItem[];
  artifacts: Artifact[];
  mitre: MitreTechnique[];
}
