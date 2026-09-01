import { Activity, ArrowDown } from "lucide-react";
import type { ForensicEvent } from "@/lib/forensics/types";
import { EndpointPanel } from "./EndpointPanel";
import { PayloadViewer } from "./PayloadViewer";

interface NetworkEvidencePanelProps {
  event: ForensicEvent;
  payload: string;
}

export function NetworkEvidencePanel({ event, payload }: NetworkEvidencePanelProps) {
  return (
    <section className="pane flex-1 flex flex-col overflow-hidden">
      <div className="pane-header px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-4 h-4 text-[#00f0ff] shrink-0" />
          <div className="min-w-0">
            <h2 className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">
              FORENSIC EVENT // NETWORK ANALYSIS
            </h2>
            <p className="text-[11px] text-[#849495]">
              Raw network/security evidence for analyst review
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 font-mono text-[11px]">
          <div>
            <dt className="text-[#849495]">EVENT ID</dt>
            <dd className="text-[#00f0ff] font-bold">{event.id}</dd>
          </div>
          <div>
            <dt className="text-[#849495]">TIMESTAMP</dt>
            <dd className="text-[#b9cacb]">{event.timestamp}</dd>
          </div>
          <div>
            <dt className="text-[#849495]">APP</dt>
            <dd className="text-[#e2e2e8]">{event.application}</dd>
          </div>
          <div>
            <dt className="text-[#849495]">PROTOCOL</dt>
            <dd className="text-[#5bffa1] font-bold">{event.protocol ?? "Unknown"}</dd>
          </div>
        </dl>
      </div>

      <div className="p-4 bg-[#0a0c10] flex flex-col gap-4 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
          <EndpointPanel endpoint={event.source} tone="source" />
          <div className="hidden md:flex items-center justify-center px-1" aria-hidden="true">
            <div className="w-8 h-8 rounded bg-[#111318] border border-[#30363d] flex items-center justify-center">
              <ArrowDown className="w-4 h-4 text-[#849495] -rotate-90" />
            </div>
          </div>
          <EndpointPanel endpoint={event.destination} tone="destination" />
        </div>

        <PayloadViewer payload={payload} />
      </div>
    </section>
  );
}
