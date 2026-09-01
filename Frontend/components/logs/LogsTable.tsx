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
        <TableStatusBar />
        <div className="overflow-x-auto">
          <div className="min-w-[1040px]">
            <TableSkeletonHeader />
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[11rem_6rem_12rem_13rem_12rem_minmax(18rem,1fr)] gap-3 border-t border-[#30363d] px-4 py-3"
              >
                {Array.from({ length: 6 }).map((__, cellIndex) => (
                  <div key={cellIndex} className="h-3 bg-[#30363d] animate-pulse rounded" />
                ))}
              </div>
            ))}
          </div>
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
      <TableStatusBar />
      <div className="overflow-x-auto">
        <table className="min-w-[1040px] w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[11rem]" />
            <col className="w-[6rem]" />
            <col className="w-[12rem]" />
            <col className="w-[13rem]" />
            <col className="w-[12rem]" />
            <col />
          </colgroup>
          <thead className="bg-[#0f1318] border-y border-[#30363d]">
            <tr>
              {["TIMESTAMP", "LEVEL", "SOURCE", "APPLICATION", "EVENT", "MESSAGE"].map((label) => (
                <th
                  key={label}
                  className="px-4 py-2.5 font-mono text-[10px] font-bold tracking-wider text-[#849495]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
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
                <td className="px-4 py-3 font-mono text-[11px] text-[#b9cacb] whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex border px-2 py-0.5 font-mono text-[10px] font-bold ${logLevelStyles[log.level]}`}>
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#00f0ff] truncate" title={log.source}>
                  {log.source}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#e2e2e8] truncate" title={log.application}>
                  {log.application}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#5bffa1] truncate" title={log.event}>
                  {log.event}
                </td>
                <td className="px-4 py-3 text-xs text-[#b9cacb] truncate" title={log.message}>
                  {log.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableStatusBar() {
  return (
    <div className="pane-header px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-[10px] font-bold tracking-wider text-[#00f0ff]">
          EVENT STREAM
        </span>
        <span className="font-mono text-[10px] text-[#849495] truncate">
          backend:/v1/events timezone:IST
        </span>
      </div>
      <span className="font-mono text-[10px] text-[#849495] shrink-0">CLICK ROW FOR DETAILS</span>
    </div>
  );
}

function TableSkeletonHeader() {
  return (
    <div className="grid grid-cols-[11rem_6rem_12rem_13rem_12rem_minmax(18rem,1fr)] gap-3 bg-[#0f1318] border-y border-[#30363d] px-4 py-2.5 font-mono text-[10px] font-bold tracking-wider text-[#849495]">
      {["TIMESTAMP", "LEVEL", "SOURCE", "APPLICATION", "EVENT", "MESSAGE"].map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
  );
}
