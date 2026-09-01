import type { LogFilters, LogRecord } from "./types";

export const defaultLogFilters: LogFilters = {
  search: "",
  level: "ALL",
  application: "ALL",
  event: "ALL",
};

export function filterLogs(records: LogRecord[], filters: LogFilters) {
  const query = filters.search.trim().toLowerCase();

  return records.filter((record) => {
    const matchesSearch =
      !query ||
      [
        record.id,
        record.timestamp,
        record.level,
        record.source,
        record.application,
        record.event,
        record.message,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesLevel = filters.level === "ALL" || record.level === filters.level;
    const matchesApplication =
      filters.application === "ALL" || record.application === filters.application;
    const matchesEvent = filters.event === "ALL" || record.event === filters.event;

    return matchesSearch && matchesLevel && matchesApplication && matchesEvent;
  });
}

export function getFilterOptions(records: LogRecord[]) {
  return {
    applications: Array.from(new Set(records.map((record) => record.application))).sort(),
    events: Array.from(new Set(records.map((record) => record.event))).sort(),
  };
}
