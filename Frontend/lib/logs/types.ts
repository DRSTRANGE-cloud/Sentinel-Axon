export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";

export interface LogRecord {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  application: string;
  event: string;
  message: string;
  raw: Record<string, string | number | boolean | null | string[]>;
  relatedForensicsId?: string;
  relatedIncidentId?: string;
}

export interface LogFilters {
  search: string;
  level: "ALL" | LogLevel;
  application: "ALL" | string;
  event: "ALL" | string;
}
