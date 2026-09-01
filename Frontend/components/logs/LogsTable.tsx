"use client";

import type { LogRecord } from "@/lib/logs";
import { logLevelStyles } from "./log-level";

interface LogsTableProps {
  logs: LogRecord[];
  isLoading: boolean;
  onSelect: (log: LogRecord) => void;
}

export function LogsTable({ logs, isLoading, onSelect }: LogsTableProps) {
  if (isLoading) {
    return (
      <div className="pane overflow-hidden">
        <TableHeader />
        <div className="divide-y divide-[#30363d]">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[9rem_6rem_10rem_10rem_10rem_minmax(18rem,1fr)] gap-3 px-4 py-3">
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <div key={cellIndex} className="h-3 bg-[#30363d] animate-pulse rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="pane p-8 text-center">
        <p className="font-mono text-sm font-bold text-[#e2e2e8]">NO LOGS MATCH THE CURRENT FILTERS</p>
        <p className="mt-2 text-xs text-[#849495]">Adjust search or filters to inspect available telemetry.</p>
      </div>
    );
  }

  return (
    <div className="pane overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left">
          <TableHeader asTable />
          <tbody className="divide-y divide-[#30363d]">
            {logs.map((log) => (
              <tr
                key={log.id}
                tabIndex={0}
                onClick={() => onSelect(log)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(log);
                  }
                }}
                className="cursor-pointer bg-[#161b22] hover:bg-[#1c2128] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#00f0ff]"
              >
                <td className="px-4 py-3 font-mono text-[11px] text-[#b9cacb] whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex border px-2 py-0.5 font-mono text-[10px] font-bold ${logLevelStyles[log.level]}`}>
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#00f0ff]">{log.source}</td>
                <td className="px-4 py-3 text-xs text-[#e2e2e8]">{log.application}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#5bffa1]">{log.event}</td>
                <td className="px-4 py-3 text-xs text-[#b9cacb]">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableHeader({ asTable = false }: { asTable?: boolean }) {
  const labels = ["TIMESTAMP", "LEVEL", "SOURCE", "APPLICATION", "EVENT", "MESSAGE"];

  if (asTable) {
    return (
      <thead className="pane-header">
        <tr>
          {labels.map((label) => (
            <th key={label} className="px-4 py-2.5 font-mono text-[10px] font-bold tracking-wider text-[#849495]">
              {label}
            </th>
          ))}
        </tr>
      </thead>
    );
  }

  return (
    <div className="pane-header grid grid-cols-[9rem_6rem_10rem_10rem_10rem_minmax(18rem,1fr)] gap-3 px-4 py-2.5 font-mono text-[10px] font-bold tracking-wider text-[#849495]">
      {labels.map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
  );
}
