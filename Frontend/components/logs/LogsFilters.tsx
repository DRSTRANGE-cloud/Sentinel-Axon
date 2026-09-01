"use client";

import { Search } from "lucide-react";
import type { LogFilters, LogLevel } from "@/lib/logs";

const levels: Array<"ALL" | LogLevel> = ["ALL", "UNKNOWN", "DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"];

interface LogsFiltersProps {
  filters: LogFilters;
  applications: string[];
  events: string[];
  onChange: (filters: LogFilters) => void;
}

export function LogsFilters({ filters, applications, events, onChange }: LogsFiltersProps) {
  return (
    <section className="pane p-3 grid grid-cols-1 lg:grid-cols-[minmax(20rem,1fr)_10rem_13rem_13rem] gap-3 items-end">
      <label className="flex flex-col gap-1 min-w-0">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#849495]">
          Search
        </span>
        <span className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#849495]" />
          <input
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Search timestamp, source, event, message..."
            className="h-9 w-full bg-[#0a0c10] border border-[#30363d] pl-9 pr-3 font-mono text-xs text-[#e2e2e8] placeholder:text-[#849495] focus:outline-none focus:border-[#00f0ff]"
          />
        </span>
      </label>

      <FilterSelect
        label="Level"
        value={filters.level}
        options={levels}
        onChange={(value) => onChange({ ...filters, level: value as LogFilters["level"] })}
      />
      <FilterSelect
        label="Application"
        value={filters.application}
        options={["ALL", ...applications]}
        onChange={(value) => onChange({ ...filters, application: value })}
      />
      <FilterSelect
        label="Event"
        value={filters.event}
        options={["ALL", ...events]}
        onChange={(value) => onChange({ ...filters, event: value })}
      />
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#849495]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 bg-[#0a0c10] border border-[#30363d] px-2 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#00f0ff]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
