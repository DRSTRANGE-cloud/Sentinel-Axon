"use client";

import { useMemo, useState } from "react";
import {
  ForensicsHeader,
  ForensicsSidebar,
  NetworkEvidencePanel,
} from "@/components/forensics";
import { forensicEvent, formatPayload } from "@/lib/forensics";

export default function ForensicDeepDive() {
  const [copied, setCopied] = useState(false);
  const payload = useMemo(() => formatPayload(forensicEvent.payload), []);

  const copyEvidence = async () => {
    const text = [
      `Event ID: ${forensicEvent.id}`,
      `Timestamp: ${forensicEvent.timestamp}`,
      `Severity: ${forensicEvent.severity}`,
      `Application: ${forensicEvent.application}`,
      `Source: ${forensicEvent.source.ip}:${forensicEvent.source.port ?? "unknown"}`,
      `Destination: ${forensicEvent.destination.ip}:${forensicEvent.destination.port ?? "unknown"}`,
      `Protocol: ${forensicEvent.protocol ?? "Unknown"}`,
      "",
      "Payload:",
      payload,
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 font-sans min-h-[calc(100vh-5rem)]">
      <ForensicsHeader event={forensicEvent} copied={copied} onCopy={copyEvidence} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
        <main className="lg:col-span-8 flex flex-col gap-3 min-w-0">
          <NetworkEvidencePanel event={forensicEvent} payload={payload} />
        </main>

        <ForensicsSidebar event={forensicEvent} />
      </div>
    </div>
  );
}
