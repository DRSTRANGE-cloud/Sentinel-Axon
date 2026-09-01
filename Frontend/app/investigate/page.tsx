"use client";

import { useState } from "react";
import {
  Radar,
  Network,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Cpu,
  ArrowRight,
  RefreshCw,
  Zap,
  Lock,
} from "lucide-react";

interface Node {
  id: string;
  label: string;
  type: "SERVER" | "DATABASE" | "GATEWAY" | "MALICIOUS";
  status: "SECURE" | "COMPROMISED" | "ISOLATED" | "SCANNING";
  ip: string;
  riskScore: number;
}

interface WorkflowStep {
  id: number;
  name: string;
  desc: string;
  status: "PENDING" | "RUNNING" | "COMPLETED";
}

export default function InvestigationCockpit() {
  const [activeNode, setActiveNode] = useState<string>("db-alpha");
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "db-alpha",
      label: "DB-Alpha",
      type: "DATABASE",
      status: "COMPROMISED",
      ip: "10.0.4.50",
      riskScore: 92,
    },
    {
      id: "server-a",
      label: "Server-A (Prod)",
      type: "SERVER",
      status: "COMPROMISED",
      ip: "192.168.4.112",
      riskScore: 88,
    },
    {
      id: "auth-gw",
      label: "Auth-Gateway-01",
      type: "GATEWAY",
      status: "SCANNING",
      ip: "192.168.1.1",
      riskScore: 45,
    },
    {
      id: "ext-c2",
      label: "External C2 Node",
      type: "MALICIOUS",
      status: "COMPROMISED",
      ip: "185.220.101.4",
      riskScore: 99,
    },
    {
      id: "backup-store",
      label: "Secure-Vault-02",
      type: "SERVER",
      status: "SECURE",
      ip: "10.0.9.15",
      riskScore: 5,
    },
  ]);

  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 1,
      name: "ISOLATE COMPROMISED NODE",
      desc: "Sever network interfaces for Server-A & DB-Alpha from local vLAN",
      status: "PENDING",
    },
    {
      id: 2,
      name: "CAPTURE NETWORK EVENT EVIDENCE",
      desc: "Preserve source, destination, protocol, and payload telemetry for forensic review",
      status: "PENDING",
    },
    {
      id: 3,
      name: "DRAIN ACTIVE SOCKETS",
      desc: "Force termination of active TCP connections to 185.220.101.4",
      status: "PENDING",
    },
    {
      id: 4,
      name: "DEPLOY HONEYPOT & QUARANTINE",
      desc: "Reroute unauthorized ingress traffic to Isolated Sandbox",
      status: "PENDING",
    },
  ]);

  const runWorkflow = () => {
    if (workflowRunning) return;
    setWorkflowRunning(true);
    setCurrentStep(0);

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < 4) {
        setSteps((prev) =>
          prev.map((s, idx) => {
            if (idx < stepIdx) return { ...s, status: "COMPLETED" };
            if (idx === stepIdx) return { ...s, status: "RUNNING" };
            return { ...s, status: "PENDING" };
          })
        );
        setCurrentStep(stepIdx + 1);
        stepIdx++;
      } else {
        setSteps((prev) => prev.map((s) => ({ ...s, status: "COMPLETED" })));
        setNodes((prev) =>
          prev.map((n) =>
            n.status === "COMPROMISED" ? { ...n, status: "ISOLATED", riskScore: 12 } : n
          )
        );
        setWorkflowRunning(false);
        clearInterval(interval);
      }
    }, 1500);
  };

  const selectedNodeObj = nodes.find((n) => n.id === activeNode) || nodes[0];

  return (
    <div className="flex flex-col gap-3 font-sans min-h-[calc(100vh-5rem)]">
      {/* Cockpit Header */}
      <div className="pane p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#0a0c10] border border-[#00f0ff] flex items-center justify-center hud-glow">
            <Radar className="w-5 h-5 text-[#00f0ff]" />
          </div>
          <div>
            <h1 className="font-mono text-lg font-bold text-[#dbfcff] tracking-wide">
              INVESTIGATION COCKPIT // THREAT GRAPH
            </h1>
            <p className="font-mono text-xs text-[#849495]">
              CORRELATION MATRIX & AUTOMATED MITIGATION RUNNER
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={runWorkflow}
            disabled={workflowRunning}
            className={`px-4 py-2 rounded font-bold transition-all flex items-center gap-2 border ${
              workflowRunning
                ? "bg-[#161b22] text-[#849495] border-[#30363d] cursor-not-allowed"
                : "bg-[#00f0ff] text-[#00363a] border-[#00f0ff] hover:bg-[#7df4ff] hud-glow"
            }`}
          >
            {workflowRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#00f0ff]" />
                <span>EXECUTING PIPELINE ({currentStep}/4)...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>EXECUTE AUTOMATED WORKFLOW</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content: Graph Visualizer vs Mitigation Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
        {/* Network Node Topology Graph Visualizer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="pane flex-1 flex flex-col overflow-hidden">
            <div className="pane-header px-4 py-2.5 flex justify-between items-center border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#00f0ff]" />
                <span className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">
                  THREAT CORRELATION MATRIX
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#849495]">
                CLICK NODE TO INSPECT
              </span>
            </div>

            {/* Interactive Node Graph Canvas Representation */}
            <div className="p-4 flex-1 bg-[#0a0c10] relative flex flex-col justify-around items-center min-h-[350px]">
              {/* Connecting lines SVG backdrop */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#ffb4ab" strokeWidth="2" strokeDasharray="4" />
                <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="#ffb4ab" strokeWidth="2" strokeDasharray="4" />
                <line x1="30%" y1="75%" x2="50%" y2="50%" stroke="#00f0ff" strokeWidth="2" />
                <line x1="70%" y1="75%" x2="50%" y2="50%" stroke="#5bffa1" strokeWidth="2" />
              </svg>

              {/* Node Layout Grid */}
              <div className="w-full flex justify-between px-8 z-10">
                {/* Node 1: Malicious C2 */}
                <button
                  onClick={() => setActiveNode("ext-c2")}
                  className={`pane p-3 rounded flex flex-col items-center gap-1 transition-all ${
                    activeNode === "ext-c2"
                      ? "border-[#ffb4ab] bg-[#ffb4ab]/10 hud-glow-error"
                      : "border-[#ffb4ab]/50 bg-[#161b22]"
                  }`}
                >
                  <AlertTriangle className="w-6 h-6 text-[#ffb4ab] animate-bounce" />
                  <span className="font-mono text-xs font-bold text-[#ffb4ab]">Ext C2 (185.220.101.4)</span>
                  <span className="text-[10px] font-mono text-[#ffb4ab]">RISK: 99/100</span>
                </button>

                {/* Node 2: Server-A */}
                <button
                  onClick={() => setActiveNode("server-a")}
                  className={`pane p-3 rounded flex flex-col items-center gap-1 transition-all ${
                    activeNode === "server-a"
                      ? "border-[#00f0ff] bg-[#00f0ff]/10 hud-glow"
                      : "border-[#30363d] bg-[#161b22]"
                  }`}
                >
                  <Server className="w-6 h-6 text-[#ffb4ab]" />
                  <span className="font-mono text-xs font-bold text-[#e2e2e8]">Server-A (192.168.4.112)</span>
                  <span className="text-[10px] font-mono text-[#ffb4ab]">RISK: 88/100</span>
                </button>
              </div>

              {/* Central Hub: DB-Alpha */}
              <div className="z-10 my-4">
                <button
                  onClick={() => setActiveNode("db-alpha")}
                  className={`pane p-4 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    activeNode === "db-alpha"
                      ? "border-[#00f0ff] bg-[#00f0ff]/15 hud-glow"
                      : "border-[#ffb4ab] bg-[#161b22] hud-glow-error"
                  }`}
                >
                  <Database className="w-8 h-8 text-[#00f0ff] pulse-anim" />
                  <span className="font-mono text-sm font-bold text-[#00f0ff]">CENTRAL DB-ALPHA</span>
                  <span className="text-[11px] font-mono text-[#e2e2e8]">Target of Data Exfil</span>
                </button>
              </div>

              <div className="w-full flex justify-between px-8 z-10">
                {/* Node 4: Auth Gateway */}
                <button
                  onClick={() => setActiveNode("auth-gw")}
                  className={`pane p-3 rounded flex flex-col items-center gap-1 transition-all ${
                    activeNode === "auth-gw"
                      ? "border-[#00f0ff] bg-[#00f0ff]/10 hud-glow"
                      : "border-[#30363d] bg-[#161b22]"
                  }`}
                >
                  <Cpu className="w-6 h-6 text-[#5bffa1]" />
                  <span className="font-mono text-xs font-bold text-[#e2e2e8]">Auth-GW (192.168.1.1)</span>
                  <span className="text-[10px] font-mono text-[#5bffa1]">RISK: 45/100</span>
                </button>

                {/* Node 5: Vault */}
                <button
                  onClick={() => setActiveNode("backup-store")}
                  className={`pane p-3 rounded flex flex-col items-center gap-1 transition-all ${
                    activeNode === "backup-store"
                      ? "border-[#00f0ff] bg-[#00f0ff]/10 hud-glow"
                      : "border-[#30363d] bg-[#161b22]"
                  }`}
                >
                  <Lock className="w-6 h-6 text-[#5bffa1]" />
                  <span className="font-mono text-xs font-bold text-[#e2e2e8]">Secure-Vault-02</span>
                  <span className="text-[10px] font-mono text-[#5bffa1]">SAFE (5/100)</span>
                </button>
              </div>
            </div>

            {/* Selected Node Details Pane */}
            <div className="pane-header p-3 border-t border-[#30363d] flex justify-between items-center font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#849495]">SELECTED NODE:</span>
                <span className="font-bold text-[#00f0ff]">{selectedNodeObj.label}</span>
                <span className="text-[#849495]">({selectedNodeObj.ip})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#849495]">STATUS:</span>
                <span
                  className={`font-bold ${
                    selectedNodeObj.status === "COMPROMISED"
                      ? "text-[#ffb4ab]"
                      : selectedNodeObj.status === "ISOLATED"
                      ? "text-[#00f0ff]"
                      : "text-[#5bffa1]"
                  }`}
                >
                  {selectedNodeObj.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mitigation Pipeline & Workflow Runner (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="pane flex-1 flex flex-col overflow-hidden">
            <div className="pane-header px-4 py-2.5 flex justify-between items-center border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00f0ff]" />
                <span className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">
                  AUTOMATED RESPONSE WORKFLOW
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#00f0ff]">
                AXON QUARANTINE ENGINE
              </span>
            </div>

            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`pane p-3 rounded flex flex-col gap-2 relative transition-all border ${
                    step.status === "COMPLETED"
                      ? "border-[#5bffa1] bg-[#5bffa1]/5"
                      : step.status === "RUNNING"
                      ? "border-[#00f0ff] bg-[#00f0ff]/10 hud-glow"
                      : "border-[#30363d] bg-[#111318]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center font-mono text-xs font-bold text-[#00f0ff]">
                        {step.id}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#e2e2e8]">
                        {step.name}
                      </span>
                    </div>

                    {step.status === "COMPLETED" && (
                      <CheckCircle2 className="w-4 h-4 text-[#5bffa1]" />
                    )}
                    {step.status === "RUNNING" && (
                      <RefreshCw className="w-4 h-4 text-[#00f0ff] animate-spin" />
                    )}
                    {step.status === "PENDING" && (
                      <span className="font-mono text-[10px] text-[#849495]">QUEUED</span>
                    )}
                  </div>

                  <p className="font-mono text-[11px] text-[#b9cacb] pl-7">
                    {step.desc}
                  </p>

                  {step.status === "RUNNING" && (
                    <div className="w-full h-1.5 bg-[#0a0c10] border border-[#00f0ff]/40 rounded overflow-hidden mt-1">
                      <div className="h-full bg-[#00f0ff] animate-pulse w-3/4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Action summary */}
              <div className="pane p-3 bg-[#0a0c10] border border-[#30363d] flex flex-col gap-2 mt-2 font-mono text-xs">
                <span className="text-[#849495] font-bold">NEXT TACTICAL STEP:</span>
                <p className="text-[#b9cacb] text-[11px]">
                  After mitigation completes, inspect raw network event telemetry and correlated evidence in the Forensic Deep-Dive module.
                </p>
                <a
                  href="/forensics"
                  className="mt-1 bg-[#161b22] border border-[#30363d] hover:border-[#00f0ff] text-[#00f0ff] font-bold text-xs py-2 rounded text-center transition-all flex items-center justify-center gap-2"
                >
                  PROCEED TO FORENSIC DEEP-DIVE
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
