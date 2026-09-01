"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ForensicsHeader,
  ForensicsSidebar,
  NetworkEvidencePanel,
} from "@/components/forensics";
import { fetchForensicEvent, formatPayload, type ForensicEvent } from "@/lib/forensics";

export default function ForensicDeepDive() {
  return (
    <Suspense fallback={<ForensicsLoading />}>
      <ForensicDeepDiveContent />
    </Suspense>
  );
}

function ForensicDeepDiveContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? undefined;
  const [event, setEvent] = useState<ForensicEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payload = useMemo(() => formatPayload(event?.payload), [event?.payload]);

  useEffect(() => {
    let cancelled = false;

    fetchForensicEvent(eventId)
      .then((record) => {
        if (cancelled) return;
        setEvent(record);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setEvent(null);
        setError(err instanceof Error ? err.message : "Unable to load forensic event");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const copyEvidence = async () => {
    if (!event) return;

    const text = [
      `Event ID: ${event.id}`,
      `Timestamp: ${event.timestamp}`,
      `Severity: ${event.severity}`,
      `Application: ${event.application}`,
      `Source: ${event.source.ip}:${event.source.port ?? "unknown"}`,
      `Destination: ${event.destination.ip}:${event.destination.port ?? "unknown"}`,
      `Protocol: ${event.protocol ?? "Unknown"}`,
      "",
      "Payload:",
      payload,
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <ForensicsLoading />;
  }

  if (error) {
    return (
      <div className="pane p-6 border-[#ffb4ab]/60 bg-[#ffb4ab]/10">
        <p className="font-mono text-sm font-bold text-[#ffb4ab]">FORENSIC EVENT LOAD FAILED</p>
        <p className="mt-2 text-xs text-[#e2e2e8]">{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pane p-8 text-center">
        <p className="font-mono text-sm font-bold text-[#e2e2e8]">NO FORENSIC EVENT AVAILABLE</p>
        <p className="mt-2 text-xs text-[#849495]">No backend event was returned for deep-dive inspection.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 font-sans min-h-[calc(100vh-5rem)]">
      <ForensicsHeader event={event} copied={copied} onCopy={copyEvidence} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
        <main className="lg:col-span-8 flex flex-col gap-3 min-w-0">
          <NetworkEvidencePanel event={event} payload={payload} />
        </main>

        <ForensicsSidebar event={event} />
      </div>
    </div>
  );
}

function ForensicsLoading() {
  return (
    <div className="pane p-8 font-mono text-sm text-[#849495]">
      Loading forensic event from backend...
    </div>
  );
}
