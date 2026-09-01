"use client";

import { RefreshCw, ScrollText } from "lucide-react";

interface LogsHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export function LogsHeader({ isLoading, onRefresh }: LogsHeaderProps) {
  return (
    <div className="pane p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded bg-[#0a0c10] border border-[#00f0ff] flex items-center justify-center hud-glow shrink-0">
          <ScrollText className="w-5 h-5 text-[#00f0ff]" />
        </div>
        <div className="min-w-0">
          <h1 className="font-mono text-lg font-bold text-[#dbfcff] tracking-wide">LOGS</h1>
          <p className="font-mono text-xs text-[#849495]">
            Raw security and application telemetry received by Sentinel.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="px-3 py-1.5 bg-[#161b22] border border-[#30363d] hover:border-[#00f0ff] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00f0ff] text-[#e2e2e8] rounded transition-all flex items-center gap-2 font-mono text-xs font-bold"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-[#00f0ff] ${isLoading ? "animate-spin" : ""}`} />
        <span>{isLoading ? "REFRESHING" : "REFRESH"}</span>
      </button>
    </div>
  );
}
