import Link from "next/link";
import { ArrowRight, Bot, Fingerprint, GitBranch } from "lucide-react";
import type { ForensicEvent } from "@/lib/forensics/types";
import { DetailRow } from "./DetailRow";
import { SidebarSection } from "./SidebarSection";

interface ForensicsSidebarProps {
  event: ForensicEvent;
}

export function ForensicsSidebar({ event }: ForensicsSidebarProps) {
  return (
    <aside className="lg:col-span-4 flex flex-col gap-3 min-w-0">
      <SidebarSection icon={Bot} title="AI METADATA" count={`${event.aiMetadata.length} FIELDS`} ai>
        {event.aiMetadata.length > 0 ? (
          <dl className="space-y-2">
            {event.aiMetadata.map((item) => (
              <DetailRow key={item.label} label={item.label} value={item.value} />
            ))}
          </dl>
        ) : (
          <p className="text-xs text-[#849495]">No AI metadata available for this event.</p>
        )}
      </SidebarSection>

      <SidebarSection icon={Fingerprint} title="RELATED ARTIFACTS" count={`${event.artifacts.length} ITEMS`}>
        <div className="space-y-2">
          {event.artifacts.map((artifact) => (
            <div
              key={`${artifact.type}-${artifact.value}`}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 items-center border border-[#30363d] bg-[#0a0c10] px-3 py-2"
            >
              <span className="font-mono text-[10px] font-bold text-[#849495]">{artifact.type}</span>
              <span className="min-w-0 break-all font-mono text-[11px] text-[#e2e2e8]">{artifact.value}</span>
            </div>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection icon={GitBranch} title="MITRE ATT&CK" count={`${event.mitre.length} TECHNIQUES`}>
        {event.mitre.length > 0 ? (
          <div className="space-y-2">
            {event.mitre.map((technique) => (
              <article
                key={technique.id}
                className="border border-[#30363d] bg-[#0a0c10] px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] font-bold text-[#00f0ff]">{technique.id}</span>
                  <span className="text-[10px] text-[#849495] text-right">{technique.tactic}</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#e2e2e8]">{technique.name}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#849495]">No MITRE mapping available for this event.</p>
        )}
      </SidebarSection>

      <Link
        href="/outcomes"
        className="bg-[#00f0ff] text-[#00363a] font-mono font-bold text-xs py-2.5 rounded text-center transition-all hover:bg-[#7df4ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7df4ff] hud-glow flex items-center justify-center gap-2"
      >
        PROCEED TO RESPONSE OUTCOMES
        <ArrowRight className="w-4 h-4" />
      </Link>
    </aside>
  );
}
