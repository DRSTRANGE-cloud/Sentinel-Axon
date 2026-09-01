"use client";

import { Copy, Network } from "lucide-react";
import type { ForensicEvent } from "@/lib/forensics/types";
import { severityStyles } from "./severity";

interface ForensicsHeaderProps {
  event: ForensicEvent;
  copied: boolean;
  onCopy: () => void;
}

export function ForensicsHeader({ event, copied, onCopy }: ForensicsHeaderProps) {
  return (
    <div className="pane p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded bg-[#0a0c10] border border-[#00f0ff] flex items-center justify-center hud-glow shrink-0">
          <Network className="w-5 h-5 text-[#00f0ff]" />
        </div>
        <div className="min-w-0">
          <h1 className="font-mono text-base sm:text-lg font-bold text-[#dbfcff] tracking-wide">
            FORENSIC DEEP-DIVE // NETWORK & EVENT ANALYSIS
          </h1>
          <p className="font-mono text-xs text-[#849495]">
            SECURITY EVENT TELEMETRY & CORRELATED FORENSIC EVIDENCE
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className={`px-2.5 py-1 border font-bold ${severityStyles[event.severity]}`}>
          SEVERITY: {event.severity}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="px-3 py-1.5 bg-[#161b22] border border-[#30363d] hover:border-[#00f0ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00f0ff] text-[#e2e2e8] rounded transition-all flex items-center gap-2"
          aria-label="Copy forensic event evidence"
        >
          <Copy className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span>{copied ? "EVIDENCE COPIED" : "COPY EVENT EVIDENCE"}</span>
        </button>
      </div>
    </div>
  );
}
