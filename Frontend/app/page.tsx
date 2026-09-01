"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  Radar,
  Network,
  AlertTriangle,
  Terminal,
  Lock,
  ArrowRight,
  Database,
  Activity,
  type LucideIcon,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: "ACTIVE" | "SCANNING" | "STANDBY" | "ALERT";
  icon: LucideIcon;
  color: string;
  colorBorder: string;
  lastAction: string;
  tMinus: string;
  load: number[];
}

interface Anomaly {
  id: string;
  code: string;
  title: string;
  target: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  details: string;
  blocked: boolean;
}

export default function CommandHUD() {
  const [threatLevel, setThreatLevel] = useState<"NOMINAL" | "ELEVATED" | "CRITICAL">("ELEVATED");
  const [commandInput, setCommandInput] = useState("");
  const [commandLogs, setCommandLogs] = useState<string[]>([
    "[SYSTEM] AXON Kernel v4.2 initialized.",
    "[SEC-GRID] 24 perimeter nodes online.",
    "[ALERT] Suspicious outbound payload detected on port 8080.",
  ]);

  const [anomalies, setAnomalies] = useState<Anomaly[]>([
    {
      id: "anom-1",
      code: "ERR_AUTH_SPIKE_099",
      title: "Authentication Burst Detected",
      target: "Server-A // DB-Alpha",
      severity: "CRITICAL",
      details: "1,420 failed SSH attempts/min from 192.168.4.112",
      blocked: false,
    },
    {
      id: "anom-[#2]",
      code: "DATA_EXFIL_SUSPECT",
      title: "Unusual Data Outflow",
      target: "DB-Alpha (4.2 GB Exfil)",
      severity: "HIGH",
      details: "Encrypted payload transmitted to unregistered external IP",
      blocked: false,
    },
    {
      id: "anom-3",
      code: "MEM_CORRECTION_WARN",
      title: "Kernel Hook Anomaly",
      target: "Auth-Gateway-01",
      severity: "MEDIUM",
      details: "Process memory modification detected in kernel space",
      blocked: false,
    },
  ]);

  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "axon-7",
      name: "AGENT AXON-7",
      role: "Log & Correlation Engine",
      status: "ACTIVE",
      icon: Cpu,
      color: "#00f0ff",
      colorBorder: "border-[#00f0ff]",
      lastAction: "LOG_CORRELATION_IN_PROGRESS: Server-A // DB-Alpha",
      tMinus: "00:02:14",
      load: [40, 65, 80, 95, 70, 85, 90],
    },
    {
      id: "scout-2",
      name: "AGENT SCOUT-2",
      role: "Perimeter Threat Hunter",
      status: "SCANNING",
      icon: Radar,
      color: "#5bffa1",
      colorBorder: "border-[#5bffa1]",
      lastAction: "Scanning subnet 192.168.4.x for unpatched CVEs. Target profile match: 94%",
      tMinus: "00:15:30",
      load: [30, 40, 35, 50, 45, 60, 55],
    },
    {
      id: "sentinel-1",
      name: "AGENT SENTINEL-1",
      role: "Automated Quarantine Specialist",
      status: "STANDBY",
      icon: Network,
      color: "#b9cacb",
      colorBorder: "border-[#b9cacb]",
      lastAction: "Idle. Awaiting command parameters. Perimeter sensors locked.",
      tMinus: "01:45:00",
      load: [10, 10, 15, 12, 10, 14, 10],
    },
  ]);

  // Live simulation ticker for HUD activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          const newLoad = [...agent.load.slice(1), Math.floor(Math.random() * 60) + 30];
          return { ...agent, load: newLoad };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (id: string, actionName: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, blocked: true } : a))
    );
    setCommandLogs((prev) => [
      `[ACTION] Executed '${actionName}' on ${id}. Traffic diverted to Honeypot.`,
      ...prev,
    ]);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    let response = `[COMMAND] Executed: "${cmd}"`;

    if (cmd.toLowerCase().includes("block")) {
      response = `[FIREWALL] Rule injected: BLOCKED origin host. Syn-flood mitigated.`;
    } else if (cmd.toLowerCase().includes("scan")) {
      response = `[SCOUT-2] Initiating deep packet scan across DB-Alpha nodes.`;
    } else if (cmd.toLowerCase().includes("clear")) {
      setCommandLogs([]);
      setCommandInput("");
      return;
    }

    setCommandLogs((prev) => [response, ...prev]);
    setCommandInput("");
  };

  return (
    <div className="flex flex-col gap-3 font-sans min-h-[calc(100vh-5rem)]">
      {/* Top Banner: Global Threat Level & Key Telemetry */}
      <div className="pane p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Threat Level Indicator */}
        <div className="flex items-center gap-4 flex-1 border-b md:border-b-0 md:border-r border-[#30363d] pb-3 md:pb-0 md:pr-4">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#849495]">
              GLOBAL THREAT LEVEL
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`font-mono text-2xl font-bold tracking-tight ${
                  threatLevel === "CRITICAL"
                    ? "text-[#ffb4ab]"
                    : threatLevel === "ELEVATED"
                    ? "text-[#ffb4ab]"
                    : "text-[#5bffa1]"
                }`}
              >
                {threatLevel}
              </span>
              <span className="font-mono text-xs text-[#ffb4ab]">
                CODE: {threatLevel === "CRITICAL" ? "RED" : threatLevel === "ELEVATED" ? "AMBER" : "GREEN"}
              </span>
            </div>
          </div>

          {/* Bar gauge */}
          <div className="flex-1 max-w-xs h-3 bg-[#0a0c10] border border-[#30363d] p-0.5 relative flex items-center">
            <div
              className={`h-full transition-all duration-500 ${
                threatLevel === "CRITICAL"
                  ? "w-full bg-[#ffb4ab] hud-glow-error"
                  : threatLevel === "ELEVATED"
                  ? "w-3/4 bg-[#ffb4ab] hud-glow-error"
                  : "w-1/4 bg-[#5bffa1] hud-glow-emerald"
              }`}
            />
          </div>

          {/* Threat Level Switcher */}
          <div className="flex gap-1 font-mono text-[10px]">
            <button
              onClick={() => setThreatLevel("NOMINAL")}
              className={`px-2 py-1 border transition-colors ${
                threatLevel === "NOMINAL"
                  ? "bg-[#5bffa1]/20 border-[#5bffa1] text-[#5bffa1]"
                  : "border-[#30363d] text-[#849495] hover:text-[#e2e2e8]"
              }`}
            >
              GREEN
            </button>
            <button
              onClick={() => setThreatLevel("ELEVATED")}
              className={`px-2 py-1 border transition-colors ${
                threatLevel === "ELEVATED"
                  ? "bg-[#ffb4ab]/20 border-[#ffb4ab] text-[#ffb4ab]"
                  : "border-[#30363d] text-[#849495] hover:text-[#e2e2e8]"
              }`}
            >
              AMBER
            </button>
            <button
              onClick={() => setThreatLevel("CRITICAL")}
              className={`px-2 py-1 border transition-colors ${
                threatLevel === "CRITICAL"
                  ? "bg-[#ffb4ab]/40 border-[#ffb4ab] text-[#ffb4ab] hud-glow-error"
                  : "border-[#30363d] text-[#849495] hover:text-[#e2e2e8]"
              }`}
            >
              RED
            </button>
          </div>
        </div>

        {/* Active Investigations Count & Telemetry */}
        <div className="flex items-center gap-6 flex-1 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] font-bold text-[#849495]">
                ACTIVE INVESTIGATIONS
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-2xl font-bold text-[#00f0ff]">
                  03
                </span>
                <span className="font-mono text-xs text-[#00f0ff] animate-pulse">
                  RUNNING
                </span>
              </div>
            </div>
            <div className="flex gap-1.5 ml-2">
              <div className="w-3.5 h-3.5 bg-[#00f0ff] rotate-45 pulse-anim hud-glow"></div>
              <div className="w-3.5 h-3.5 border border-[#00f0ff] rotate-45"></div>
              <div className="w-3.5 h-3.5 border border-[#00f0ff] rotate-45"></div>
            </div>
          </div>

          <div className="hidden sm:flex gap-6 border-l border-[#30363d] pl-6 font-mono text-xs">
            <div className="flex flex-col">
              <span className="text-[#849495] text-[10px]">NET_THROUGHPUT</span>
              <span className="text-[#00f0ff] font-bold">4.2 Gbps</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#849495] text-[10px]">CPU_LOAD</span>
              <span className="text-[#5bffa1] font-bold">34%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#849495] text-[10px]">MEMORY</span>
              <span className="text-[#00f0ff] font-bold">12.8 / 32 GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content Area: Autonomous Activity vs Anomaly Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
        {/* Main Left Section: Autonomous Activity Feed (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Autonomous Activity Feed Container */}
          <div className="pane flex-1 flex flex-col overflow-hidden">
            <div className="pane-header px-4 py-2.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00f0ff]" />
                <span className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">
                  AUTONOMOUS ACTIVITY STREAM
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#5bffa1] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5bffa1] animate-ping" />
                LIVE SYNC
              </span>
            </div>

            <div className="p-3 flex flex-col gap-3 overflow-y-auto max-h-[500px]">
              {agents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.id}
                    className="pane p-3 bg-[#111318] border border-[#30363d] relative flex flex-col gap-2 transition-all hover:border-[#00f0ff]/50"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: agent.color }}
                    />
                    <div className="flex justify-between items-start pl-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: agent.color }} />
                        <span
                          className="font-mono text-xs font-bold tracking-wider"
                          style={{ color: agent.color }}
                        >
                          {agent.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-[#849495]">
                          {agent.role}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#849495]">
                        T-MINUS {agent.tMinus}
                      </span>
                    </div>

                    <p className="font-mono text-xs text-[#e2e2e8] pl-2">
                      {agent.lastAction}
                    </p>

                    {/* Sparkline Load Monitor */}
                    <div className="flex items-center gap-3 pl-2 pt-1">
                      <span className="font-mono text-[10px] text-[#849495]">LOAD:</span>
                      <div className="flex-1 h-3 bg-[#0a0c10] border border-[#30363d] flex items-end p-0.5 gap-1">
                        {agent.load.map((val, idx) => (
                          <div
                            key={idx}
                            className="flex-1 transition-all duration-300"
                            style={{
                              height: `${val}%`,
                              backgroundColor: agent.color,
                              opacity: 0.8,
                            }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[10px]" style={{ color: agent.color }}>
                        {agent.load[agent.load.length - 1]}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Command Bar Console */}
          <div className="pane p-3 bg-[#0a0c10] border border-[#30363d] flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00f0ff]">
                <Terminal className="w-4 h-4" />
                <span>SENTINEL-AXON INTERACTIVE CLI</span>
              </div>
              <span className="text-[10px] font-mono text-[#849495]">Type &apos;help&apos; or &apos;block &lt;ip&gt;&apos;</span>
            </div>

            <div className="h-24 overflow-y-auto font-mono text-xs text-[#b9cacb] space-y-1 p-2 bg-[#111318] border border-[#30363d] rounded">
              {commandLogs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#00f0ff]">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleCommandSubmit} className="flex gap-2 mt-1">
              <span className="font-mono text-xs text-[#00f0ff] self-center">axon-cli&gt;</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Enter command (e.g. block 192.168.4.112, scan db-alpha)..."
                className="flex-1 bg-[#161b22] border border-[#30363d] px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#00f0ff]"
              />
              <button
                type="submit"
                className="bg-[#00f0ff] text-[#00363a] font-mono font-bold text-xs px-4 py-1.5 rounded hover:bg-[#7df4ff] transition-all hud-glow"
              >
                EXECUTE
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar: High-Priority Anomalies (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="pane flex-1 flex flex-col">
            <div className="pane-header px-4 py-2.5 flex justify-between items-center border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
                <span className="font-mono text-xs font-bold text-[#ffb4ab] tracking-wider">
                  HIGH-PRIORITY ANOMALIES
                </span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#ffb4ab]/20 text-[#ffb4ab] rounded font-bold">
                TRIGGERS: {anomalies.filter((a) => !a.blocked).length}
              </span>
            </div>

            <div className="p-3 flex flex-col gap-3 overflow-y-auto">
              {anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className={`pane p-3 flex flex-col gap-2.5 transition-all ${
                    anom.blocked
                      ? "border-[#30363d] opacity-50 bg-[#111318]"
                      : "border-[#ffb4ab]/60 bg-[#161b22] hud-glow-error"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-[#ffb4ab]">
                      {anom.code}
                    </span>
                    {anom.blocked ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#5bffa1]/20 text-[#5bffa1] border border-[#5bffa1]">
                        MITIGATED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab] animate-pulse">
                        {anom.severity}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#e2e2e8]">{anom.title}</span>
                    <span className="font-mono text-[11px] text-[#00f0ff]">{anom.target}</span>
                  </div>

                  <p className="font-mono text-[11px] text-[#b9cacb] bg-[#0a0c10] p-2 border border-[#30363d] rounded">
                    {anom.details}
                  </p>

                  {!anom.blocked && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAction(anom.id, `BLOCK & CONTAIN (${anom.code})`)}
                        className="flex-1 bg-[#00f0ff] text-[#00363a] font-mono font-bold text-[11px] py-1.5 rounded hover:bg-[#7df4ff] transition-all hud-glow flex items-center justify-center gap-1"
                      >
                        <Lock className="w-3 h-3" />
                        BLOCK IP
                      </button>
                      <Link
                        href={`/investigate?target=${encodeURIComponent(anom.target)}`}
                        className="flex-1 border border-[#30363d] text-[#e2e2e8] font-mono text-[11px] py-1.5 rounded hover:bg-[#1c2128] hover:border-[#00f0ff] transition-all flex items-center justify-center gap-1"
                      >
                        INVESTIGATE
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {/* Quick Navigation Cards */}
              <div className="pane p-3 bg-[#111318] border border-[#30363d] flex flex-col gap-2 mt-2">
                <span className="font-mono text-[11px] font-bold text-[#849495]">
                  TACTICAL SUITE NAVIGATION
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/investigate"
                    className="p-2 border border-[#30363d] bg-[#161b22] hover:border-[#00f0ff] rounded flex flex-col gap-1 transition-all group"
                  >
                    <Radar className="w-4 h-4 text-[#00f0ff] group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-xs font-bold text-[#e2e2e8]">Cockpit</span>
                    <span className="text-[10px] text-[#849495]">Graph Trace</span>
                  </Link>
                  <Link
                    href="/forensics"
                    className="p-2 border border-[#30363d] bg-[#161b22] hover:border-[#00f0ff] rounded flex flex-col gap-1 transition-all group"
                  >
                    <Database className="w-4 h-4 text-[#5bffa1] group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-xs font-bold text-[#e2e2e8]">Deep-Dive</span>
                    <span className="text-[10px] text-[#849495]">Event Evidence</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
