"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Download,
  Terminal,
  Clock,
  Server,
  FileText,
  RotateCcw,
  Zap,
  Lock,
} from "lucide-react";

export default function ResponseOutcome() {
  const [downloaded, setDownloaded] = useState(false);

  const mitigationLogs = [
    { time: "10:39:01 UTC", event: "ANOMALY_TRIGGER", desc: "ERR_AUTH_SPIKE_099 fired on DB-Alpha (1,420 failed auths)", status: "ALERT" },
    { time: "10:39:14 UTC", event: "AUTONOMOUS_INTERVENTION", desc: "Agent AXON-7 isolated subnet 192.168.4.x", status: "SUCCESS" },
    { time: "10:39:35 UTC", event: "FIREWALL_BLOCK", desc: "Ingress rule injected: DENY ALL from 185.220.101.4", status: "SUCCESS" },
    { time: "10:40:02 UTC", event: "STATE_RESTORATION", desc: "Clean snapshot #4902 restored to DB-Alpha replica", status: "SUCCESS" },
  ];

  const policyJson = `{
  "policy_name": "SENTINEL_AXON_AUTO_MITIGATION_v4",
  "generated_at": "2026-09-01T10:40:15Z",
  "rules": [
    {
      "action": "DENY",
      "source_ip": "185.220.101.4/32",
      "protocol": "TCP",
      "ports": ["ANY"],
      "comment": "Auto-quarantined by AXON-7"
    },
    {
      "action": "RESTRICT_IAM",
      "user_arn": "arn:aws:iam::1234567890:user/db_sync_svc",
      "mfa_required": true
    }
  ]
}`;

  const exportReport = () => {
    const blob = new Blob([policyJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sentinel_incident_response_report.json";
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="flex flex-col gap-3 font-sans min-h-[calc(100vh-5rem)]">
      {/* Outcome Header Banner */}
      <div className="pane p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#111318]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#0a0c10] border border-[#5bffa1] flex items-center justify-center hud-glow-emerald">
            <ShieldCheck className="w-5 h-5 text-[#5bffa1]" />
          </div>
          <div>
            <h1 className="font-mono text-lg font-bold text-[#dbfcff] tracking-wide">
              RESPONSE OUTCOME // POST-INCIDENT SUMMARY
            </h1>
            <p className="font-mono text-xs text-[#5bffa1]">
              STATUS: THREAT CONTAINED // SYSTEM RESTORED TO NOMINAL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-[#00f0ff] text-[#00363a] font-bold rounded hover:bg-[#7df4ff] transition-all hud-glow flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{downloaded ? "REPORT EXPORTED!" : "EXPORT INCIDENT REPORT"}</span>
          </button>
        </div>
      </div>

      {/* Containment Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="pane p-4 flex flex-col gap-1 border-l-4 border-l-[#5bffa1]">
          <span className="font-mono text-[10px] text-[#849495] font-bold">CONTAINMENT TIME</span>
          <span className="font-mono text-2xl font-bold text-[#5bffa1]">142 SECONDS</span>
          <span className="font-mono text-[10px] text-[#b9cacb]">98% faster than SLA target</span>
        </div>

        <div className="pane p-4 flex flex-col gap-1 border-l-4 border-l-[#00f0ff]">
          <span className="font-mono text-[10px] text-[#849495] font-bold">DATA LOSS PREVENTED</span>
          <span className="font-mono text-2xl font-bold text-[#00f0ff]">4.2 GB</span>
          <span className="font-mono text-[10px] text-[#b9cacb]">Exfil stream intercepted</span>
        </div>

        <div className="pane p-4 flex flex-col gap-1 border-l-4 border-l-[#5bffa1]">
          <span className="font-mono text-[10px] text-[#849495] font-bold">DOWNTIME SAVED</span>
          <span className="font-mono text-2xl font-bold text-[#5bffa1]">4.5 HOURS</span>
          <span className="font-mono text-[10px] text-[#b9cacb]">Zero production downtime</span>
        </div>

        <div className="pane p-4 flex flex-col gap-1 border-l-4 border-l-[#ffb4ab]">
          <span className="font-mono text-[10px] text-[#849495] font-bold">AFFECTED NODES</span>
          <span className="font-mono text-2xl font-bold text-[#ffb4ab]">2 / 24</span>
          <span className="font-mono text-[10px] text-[#b9cacb]">Quarantined & disinfected</span>
        </div>
      </div>

      {/* Main Grid: Mitigation Timeline vs Generated Security Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
        {/* Mitigation Execution Timeline (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="pane flex-1 flex flex-col overflow-hidden">
            <div className="pane-header px-4 py-2.5 flex justify-between items-center border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00f0ff]" />
                <span className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">
                  INCIDENT RESPONSE CHRONOLOGY
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#5bffa1]">4 AUDITED EVENTS</span>
            </div>

            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              {mitigationLogs.map((log, idx) => (
                <div key={idx} className="flex gap-3 relative">
                  {/* Timeline vertical bar line */}
                  {idx < mitigationLogs.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-[#30363d]" />
                  )}

                  <div className="w-5 h-5 rounded-full bg-[#161b22] border border-[#00f0ff] flex items-center justify-center z-10 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5bffa1]" />
                  </div>

                  <div className="pane p-3 bg-[#111318] border border-[#30363d] flex-1 flex flex-col gap-1 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-[#00f0ff]">
                        {log.event}
                      </span>
                      <span className="font-mono text-[11px] text-[#849495]">{log.time}</span>
                    </div>
                    <p className="font-mono text-xs text-[#e2e2e8]">{log.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generated Policy JSON & Re-arm Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="pane flex-1 flex flex-col overflow-hidden">
            <div className="pane-header px-4 py-2.5 flex justify-between items-center border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5bffa1]" />
                <span className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">
                  GENERATED SECURITY POLICY RULE
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#849495]">AUTO-SYNCHRONIZED</span>
            </div>

            <div className="p-3 bg-[#0a0c10] flex-1 font-mono text-xs text-[#5bffa1] overflow-y-auto">
              <pre className="whitespace-pre-wrap leading-relaxed">{policyJson}</pre>
            </div>

            <div className="pane-header p-3 border-t border-[#30363d] flex flex-col gap-2">
              <Link
                href="/"
                className="bg-[#161b22] border border-[#30363d] hover:border-[#00f0ff] text-[#e2e2e8] hover:text-[#00f0ff] font-mono text-xs font-bold py-2 rounded text-center transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-[#00f0ff]" />
                RETURN TO COMMAND HUD
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
