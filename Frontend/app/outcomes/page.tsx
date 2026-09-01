"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  fetchLatestIncident,
  generateIncidentReport,
  type IncidentSummary,
} from "@/lib/incidents";

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return "Not available";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function collectRecommendations(incident: IncidentSummary): string[] {
  const items: string[] = [];
  if (incident.recommendation?.trim()) items.push(incident.recommendation.trim());

  const evidence = asRecord(incident.evidence);
  const raw = evidence?.recommendation ?? evidence?.recommendations ?? evidence?.response_recommendation;
  if (Array.isArray(raw)) items.push(...raw.map(String).filter(Boolean));
  if (typeof raw === "string" && raw.trim()) items.push(raw.trim());

  return [...new Set(items)];
}

function getAttackSteps(incident: IncidentSummary | null): Array<{ title: string; detail: string }> {
  if (!incident?.attack_chain) return [];

  if (Array.isArray(incident.attack_chain)) {
    return incident.attack_chain.map((step, index) => ({
      title: `Stage ${index + 1}`,
      detail: stringifyValue(step),
    }));
  }

  return Object.entries(incident.attack_chain).map(([key, value]) => ({
    title: key.replace(/_/g, " "),
    detail: stringifyValue(value),
  }));
}

function getSuspicion(incident: IncidentSummary | null) {
  if (!incident) {
    return {
      label: "Unknown",
      tone: "text-[#849495]",
      cardTone: "cyan" as const,
      reason: "No incident data available.",
    };
  }

  const severity = incident.severity?.toUpperCase();
  const suspicious = ["CRITICAL", "HIGH", "MEDIUM"].includes(severity) || incident.risk_score >= 50;

  return {
    label: suspicious ? "Suspicious Activity" : "Not Suspicious",
    tone: suspicious ? "text-[#ffb4ab]" : "text-[#5bffa1]",
    cardTone: suspicious ? "red" as const : "green" as const,
    reason: `Classified from backend severity ${incident.severity} and risk score ${incident.risk_score}/100.`,
  };
}

function buildAnalystSummary(incident: IncidentSummary): string {
  const parts = [
    incident.ai_summary || incident.description,
    incident.attack_type ? `Threat type: ${incident.attack_type}.` : null,
    `Priority is ${incident.severity} with risk score ${incident.risk_score}/100 and status ${incident.status ?? "unknown"}.`,
  ];

  const evidence = asRecord(incident.evidence);
  if (evidence?.events_analyzed) {
    parts.push(`Backend evidence indicates ${String(evidence.events_analyzed)} related event records were analyzed.`);
  }

  if (incident.attack_chain) {
    parts.push("Progression is represented in the backend attack/action sequence shown beside this summary.");
  }

  return parts.filter(Boolean).join("\n\n");
}

function summarizeEvidence(value: unknown): string[] {
  const record = asRecord(value);
  if (!record) return [stringifyValue(value)];

  const rows: string[] = [];
  for (const [key, item] of Object.entries(record).slice(0, 5)) {
    const label = key.replace(/_/g, " ").toUpperCase();
    const valueText = Array.isArray(item) ? `${item.length} item(s)` : stringifyValue(item);
    rows.push(`${label}: ${valueText}`);
  }

  return rows.length ? rows : ["No concise evidence fields available."];
}

export default function ResponseOutcome() {
  const [incident, setIncident] = useState<IncidentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);

  const attackSteps = useMemo(() => getAttackSteps(incident), [incident]);
  const suspicion = useMemo(() => getSuspicion(incident), [incident]);
  const recommendations = useMemo(() => incident ? collectRecommendations(incident) : [], [incident]);
  const evidenceValue = incident?.evidence ?? incident?.incident_metadata;
  const evidenceSummary = useMemo(() => summarizeEvidence(evidenceValue), [evidenceValue]);

  const loadIncident = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setIncident(await fetchLatestIncident());
    } catch (err) {
      setIncident(null);
      setLoadError(err instanceof Error ? err.message : "Unable to load incident response.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialIncident() {
      try {
        const record = await fetchLatestIncident();
        if (!cancelled) setIncident(record);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Unable to load incident response.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadInitialIncident();

    return () => {
      cancelled = true;
    };
  }, []);

  const exportReport = async () => {
    if (!incident) return;

    setReporting(true);
    setReportError(null);

    try {
      const blob = await generateIncidentReport(incident.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sentinel-incident-${incident.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Unable to generate incident report.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 font-sans min-h-[calc(100vh-5rem)] overflow-x-hidden">
      <div className="pane p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#111318]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded bg-[#0a0c10] border border-[#5bffa1] flex items-center justify-center hud-glow-emerald shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#5bffa1]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-mono text-lg font-bold text-[#dbfcff] tracking-wide break-words">
              RESPONSE // INCIDENT ANALYSIS
            </h1>
            <p className="font-mono text-xs text-[#849495]">
              Real backend AI response data for the latest incident.
            </p>
          </div>
        </div>

        <button
          onClick={exportReport}
          disabled={reporting || !incident}
          className="w-full sm:w-auto justify-center px-4 py-2 bg-[#00f0ff] text-[#00363a] font-mono text-xs font-bold rounded hover:bg-[#7df4ff] disabled:opacity-60 disabled:cursor-not-allowed transition-all hud-glow flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{reporting ? "GENERATING REPORT..." : downloaded ? "PDF REPORT DOWNLOADED" : "GENERATE INCIDENT REPORT"}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="pane p-6 font-mono text-sm text-[#849495]">Loading incident response...</div>
      ) : loadError ? (
        <div className="pane p-4 border-[#ffb4ab]/60 bg-[#ffb4ab]/10">
          <p className="font-mono text-sm font-bold text-[#ffb4ab]">Unable to load incident response.</p>
          <p className="mt-1 text-xs text-[#e2e2e8]">{loadError}</p>
          <button
            type="button"
            onClick={loadIncident}
            className="mt-3 border border-[#30363d] bg-[#161b22] px-3 py-1.5 font-mono text-xs text-[#00f0ff] hover:border-[#00f0ff] rounded"
          >
            Retry
          </button>
        </div>
      ) : !incident ? (
        <div className="pane p-6 text-center">
          <p className="font-mono text-sm font-bold text-[#e2e2e8]">No incident response available.</p>
        </div>
      ) : (
        <>
          {reportError ? (
            <div className="pane p-3 border-[#ffb4ab]/60 bg-[#ffb4ab]/10">
              <p className="font-mono text-xs font-bold text-[#ffb4ab]">REPORT GENERATION FAILED</p>
              <p className="mt-1 text-xs text-[#e2e2e8]">{reportError}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <SummaryCard label="CLASSIFICATION" value={suspicion.label} detail={suspicion.reason} tone={suspicion.cardTone} />
            <SummaryCard label="PRIORITY" value={incident.severity} detail={`${incident.risk_score}/100 risk score`} tone="red" />
            <SummaryCard label="STATUS" value={incident.status ?? "Unknown"} detail="Incident lifecycle status" tone="cyan" />
            <SummaryCard label="EXECUTION" value="Not Executed" detail="No backend execution confirmation provided" tone="cyan" />
            <SummaryCard label="APPLICATION" value={incident.application_id} detail={incident.title} tone="green" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 flex-1">
            <section className="xl:col-span-7 pane flex flex-col overflow-hidden min-w-0">
              <div className="pane-header px-4 py-2.5 flex items-center justify-between border-b border-[#30363d]">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#c7a6ff]" />
                  <span className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">AI RESPONSE SUMMARY</span>
                </div>
                <span className={`font-mono text-[10px] font-bold ${suspicion.tone}`}>
                  {suspicion.label.toUpperCase()}
                </span>
              </div>

              <div className="p-4 bg-[#0a0c10] flex flex-col gap-3 flex-1">
                <div className="border border-[#30363d] bg-[#111318] p-4">
                  <p className="font-mono text-[10px] font-bold text-[#849495] tracking-wider">WHAT HAPPENED / WHY IT MATTERS</p>
                  <p className="mt-3 text-sm leading-6 text-[#e2e2e8] whitespace-pre-wrap break-words">
                    {buildAnalystSummary(incident)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoBlock label="WHY CLASSIFIED THIS WAY" value={suspicion.reason} />
                  <InfoBlock
                    label="LIKELY IMPACT"
                    value={incident.attack_type ? `${incident.attack_type} activity with ${incident.severity} priority based on backend risk scoring.` : "Impact details are not available in the backend incident payload."}
                  />
                </div>

                <div className="border border-[#30363d] bg-[#111318] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] font-bold text-[#849495] tracking-wider">RECOMMENDED ACTIONS</p>
                    <span className="font-mono text-[10px] text-[#849495]">RECOMMENDED ONLY</span>
                  </div>
                  {recommendations.length ? (
                    <ul className="mt-3 space-y-2">
                      {recommendations.map((item, index) => (
                        <li key={`${item}-${index}`} className="border border-[#30363d] bg-[#0a0c10] p-2.5 text-xs leading-5 text-[#d6e7e8]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-[#849495]">
                      No backend recommendation was provided for this incident.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <aside className="xl:col-span-5 flex flex-col gap-3 min-w-0">
              <section className="pane overflow-hidden">
                <div className="pane-header px-4 py-2.5 flex items-center justify-between border-b border-[#30363d]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#ffb86b]" />
                    <span className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">ATTACK / ACTION SEQUENCE</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#849495]">{attackSteps.length} STEP(S)</span>
                </div>
                <div className="p-3 bg-[#0a0c10]">
                  {attackSteps.length > 0 ? (
                    <div className="space-y-2">
                      {attackSteps.slice(0, 6).map((step, index) => {
                        const open = expandedStep === index;
                        return (
                          <button
                            type="button"
                            key={`${step.title}-${index}`}
                            onClick={() => setExpandedStep(open ? null : index)}
                            className="w-full text-left border border-[#30363d] bg-[#111318] p-2.5 hover:border-[#00f0ff]/60 focus:outline-none focus:border-[#00f0ff]"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              {open ? <ChevronDown className="w-3.5 h-3.5 text-[#00f0ff] shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-[#849495] shrink-0" />}
                              <span className="font-mono text-[10px] text-[#00f0ff] shrink-0">STEP {index + 1}</span>
                              <span className="font-mono text-[11px] text-[#e2e2e8] truncate">{step.title}</span>
                            </span>
                            {open ? (
                              <span className="mt-2 block font-mono text-[11px] leading-5 text-[#d6e7e8] whitespace-pre-wrap break-words">
                                {step.detail}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                      {attackSteps.length > 6 ? (
                        <p className="font-mono text-[10px] text-[#849495] px-1">
                          {attackSteps.length - 6} additional backend step(s) available in full evidence.
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-[#849495]">No attack sequence available.</p>
                  )}
                </div>
              </section>

              <section className="pane overflow-hidden">
                <div className="pane-header px-4 py-2.5 flex items-center justify-between border-b border-[#30363d]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#5bffa1]" />
                    <span className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">BACKEND EVIDENCE</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEvidence(true)}
                    className="font-mono text-[10px] text-[#00f0ff] hover:text-[#7df4ff] focus:outline-none focus:text-[#7df4ff]"
                  >
                    VIEW FULL EVIDENCE
                  </button>
                </div>
                <div className="p-3 bg-[#0a0c10] space-y-2">
                  {evidenceSummary.map((row, index) => (
                    <p key={`${row}-${index}`} className="border border-[#30363d] bg-[#111318] p-2 font-mono text-[11px] leading-5 text-[#d6e7e8] break-words">
                      {row}
                    </p>
                  ))}
                </div>
              </section>

              <Link
                href="/"
                className="bg-[#161b22] border border-[#30363d] hover:border-[#00f0ff] text-[#e2e2e8] hover:text-[#00f0ff] font-mono text-xs font-bold py-2 rounded text-center transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-[#00f0ff]" />
                RETURN TO COMMAND HUD
              </Link>
            </aside>
          </div>

          {showEvidence ? (
            <div className="fixed inset-0 z-50 bg-black/70 p-4 flex justify-end" role="dialog" aria-modal="true" aria-label="Full backend evidence">
              <div className="pane w-full max-w-3xl h-full bg-[#0a0c10] flex flex-col overflow-hidden">
                <div className="pane-header px-4 py-3 flex items-center justify-between border-b border-[#30363d]">
                  <span className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">FULL BACKEND EVIDENCE</span>
                  <button
                    type="button"
                    onClick={() => setShowEvidence(false)}
                    className="p-1 text-[#849495] hover:text-[#00f0ff] focus:outline-none focus:text-[#00f0ff]"
                    aria-label="Close evidence drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <pre className="flex-1 overflow-auto p-4 whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-[#d6e7e8]">
                  {stringifyValue(evidenceValue)}
                </pre>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#30363d] bg-[#111318] p-3 min-w-0">
      <p className="font-mono text-[10px] font-bold text-[#849495] tracking-wider">{label}</p>
      <p className="mt-2 text-xs leading-5 text-[#d6e7e8] break-words">{value}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "cyan" | "green" | "red";
}) {
  const borderColor = tone === "green" ? "border-l-[#5bffa1]" : tone === "red" ? "border-l-[#ffb4ab]" : "border-l-[#00f0ff]";
  const textColor = tone === "green" ? "text-[#5bffa1]" : tone === "red" ? "text-[#ffb4ab]" : "text-[#00f0ff]";

  return (
    <div className={`pane p-3 flex flex-col gap-1 border-l-4 min-w-0 ${borderColor}`}>
      <span className="font-mono text-[10px] text-[#849495] font-bold">{label}</span>
      <span className={`font-mono text-base font-bold truncate ${textColor}`} title={value}>
        {value}
      </span>
      <span className="font-mono text-[10px] text-[#b9cacb] line-clamp-2" title={detail}>
        {detail}
      </span>
    </div>
  );
}
