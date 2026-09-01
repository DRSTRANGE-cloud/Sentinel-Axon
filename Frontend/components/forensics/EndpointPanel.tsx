import type { Endpoint } from "@/lib/forensics/types";

interface EndpointPanelProps {
  endpoint: Endpoint;
  tone: "source" | "destination";
}

export function EndpointPanel({ endpoint, tone }: EndpointPanelProps) {
  const accent = tone === "source" ? "#00f0ff" : "#5bffa1";

  return (
    <section className="bg-[#0a0c10] border border-[#30363d] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-[11px] font-bold tracking-wider text-[#849495]">
          {tone === "source" ? "SOURCE" : "DESTINATION"}
        </h3>
        <span className="text-[10px] text-[#849495]">{endpoint.label}</span>
      </div>
      <p className="mt-3 font-mono text-xl font-bold tracking-normal" style={{ color: accent }}>
        {endpoint.ip}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-[#b9cacb]">
        {endpoint.port ? <span>Port {endpoint.port}</span> : <span>Port Unknown</span>}
        {endpoint.hostname ? <span className="break-all">{endpoint.hostname}</span> : null}
      </div>
    </section>
  );
}
