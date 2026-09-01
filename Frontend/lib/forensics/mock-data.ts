import type { ForensicEvent } from "./types";

// MOCK - mirrors the current prototype pattern. Replace with API-backed event data when available.
export const forensicEvent: ForensicEvent = {
  id: "EVT-10292",
  timestamp: "2026-09-01 10:39:35 UTC",
  severity: "HIGH",
  application: "SecureShop",
  source: {
    label: "External origin",
    ip: "185.220.101.4",
    port: 49152,
  },
  destination: {
    label: "Production API",
    ip: "10.0.0.24",
    port: 443,
    hostname: "api.secureshop.internal",
  },
  protocol: "TCP / HTTPS",
  payload: `{
  "event": "login_failed",
  "application": "SecureShop",
  "username": "db_sync_svc",
  "source_ip": "185.220.101.4",
  "destination_ip": "10.0.0.24",
  "request_path": "/api/v1/session",
  "user_agent": "curl/8.1.2",
  "failure_reason": "invalid_mfa_token"
}`,
  aiMetadata: [
    { label: "Confidence", value: "94%" },
    { label: "Classification", value: "Suspicious Authentication" },
    { label: "Detection Source", value: "Threat Investigation Agent" },
    { label: "Analysis Status", value: "Correlated" },
    { label: "Correlation ID", value: "corr_72a91" },
  ],
  artifacts: [
    { type: "IP", value: "185.220.101.4" },
    { type: "USER", value: "db_sync_svc" },
    { type: "HOST", value: "api.secureshop.internal" },
    { type: "REQUEST", value: "/api/v1/session" },
    { type: "INCIDENT", value: "INC-001" },
  ],
  mitre: [
    { tactic: "Credential Access", id: "T1110", name: "Brute Force" },
    { tactic: "Initial Access", id: "T1078", name: "Valid Accounts" },
    { tactic: "Defense Evasion", id: "T1027", name: "Obfuscated Files or Information" },
  ],
};
