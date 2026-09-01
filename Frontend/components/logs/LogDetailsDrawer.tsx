"use client";

import Link from "next/link";
import { Copy, ExternalLink, X } from "lucide-react";
import type { LogRecord } from "@/lib/logs";
import { logLevelStyles } from "./log-level";

interface LogDetailsDrawerProps {
  log: LogRecord | null;
  copied: boolean;
  onCopy: (log: LogRecord) => void;
  onClose: () => void;
}

export function LogDetailsDrawer({ log, copied, onCopy, onClose }: LogDetailsDrawerProps) {
  if (!log) return null;

  const rawText = JSON.stringify(log.raw, null, 2);

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/45" role="dialog" aria-modal="true" aria-labelledby="log-details-title">
      <button className="flex-1 cursor-default" aria-label="Close log details" onClick={onClose} />
      <aside className="h-full w-full max-w-xl bg-[#111318] border-l border-[#30363d] shadow-2xl flex flex-col">
        <div className="pane-header px-4 py-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold tracking-wider text-[#849495]">LOG DETAILS</p>
            <h2 id="log-details-title" className="mt-1 font-mono text-sm font-bold text-[#dbfcff] break-all">
              {log.id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 border border-[#30363d] bg-[#161b22] hover:border-[#00f0ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00f0ff] flex items-center justify-center rounded"
            aria-label="Close log details"
          >
            <X className="w-4 h-4 text-[#e2e2e8]" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Detail label="Timestamp" value={log.timestamp} />
            <div className="border border-[#30363d] bg-[#0a0c10] p-3">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#849495]">Level</dt>
              <dd className={`mt-2 inline-flex border px-2 py-0.5 font-mono text-[10px] font-bold ${logLevelStyles[log.level]}`}>
                {log.level}
              </dd>
            </div>
            <Detail label="Source" value={log.source} />
            <Detail label="Application" value={log.application} />
            <Detail label="Event" value={log.event} />
            <Detail label="Message" value={log.message} wide />
          </dl>

          <section className="border border-[#30363d] bg-[#0a0c10] overflow-hidden">
            <div className="px-3 py-2 border-b border-[#30363d] flex items-center justify-between gap-3">
              <h3 className="font-mono text-xs font-bold tracking-wider text-[#e2e2e8]">RAW LOG</h3>
              <span className="font-mono text-[10px] text-[#849495]">TEXT/JSON SAFE VIEW</span>
            </div>
            <pre className="max-h-72 overflow-auto p-3 whitespace-pre text-[12px] leading-6 font-mono text-[#d6e7e8]">
              {rawText}
            </pre>
          </section>

          {(log.relatedForensicsId || log.relatedIncidentId) && (
            <section className="border border-[#30363d] bg-[#0a0c10] p-3">
              <h3 className="font-mono text-xs font-bold tracking-wider text-[#e2e2e8]">RELATED CONTEXT</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {log.relatedForensicsId ? (
                  <Link
                    href="/forensics"
                    className="inline-flex items-center gap-1.5 border border-[#30363d] bg-[#161b22] px-3 py-1.5 font-mono text-[11px] text-[#00f0ff] hover:border-[#00f0ff] rounded"
                  >
                    Forensics {log.relatedForensicsId}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : null}
                {log.relatedIncidentId ? (
                  <Link
                    href="/outcomes"
                    className="inline-flex items-center gap-1.5 border border-[#30363d] bg-[#161b22] px-3 py-1.5 font-mono text-[11px] text-[#5bffa1] hover:border-[#00f0ff] rounded"
                  >
                    Incident {log.relatedIncidentId}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : null}
              </div>
            </section>
          )}
        </div>

        <div className="pane-header p-3 border-t border-[#30363d]">
          <button
            type="button"
            onClick={() => onCopy(log)}
            className="w-full bg-[#00f0ff] text-[#00363a] font-mono font-bold text-xs py-2 rounded transition-all hover:bg-[#7df4ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7df4ff] hud-glow flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? "LOG COPIED" : "COPY RAW LOG"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function Detail({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`border border-[#30363d] bg-[#0a0c10] p-3 ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#849495]">{label}</dt>
      <dd className="mt-2 break-words font-mono text-[11px] text-[#e2e2e8]">{value}</dd>
    </div>
  );
}
