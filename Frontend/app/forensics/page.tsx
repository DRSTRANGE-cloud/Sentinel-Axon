"use client";

import { useState } from "react";
import {
  FileCode,
  Terminal,
  Cpu,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface HexRow {
  offset: string;
  bytes: string[];
  ascii: string;
}

export default function ForensicDeepDive() {
  const [addressSearch, setAddressSearch] = useState("0x00000040");
  const [copied, setCopied] = useState(false);

  const hexData: HexRow[] = [
    {
      offset: "0x00000000",
      bytes: ["4D", "5A", "90", "00", "03", "00", "00", "00", "04", "00", "00", "00", "FF", "FF", "00", "00"],
      ascii: "MZ..............",
    },
    {
      offset: "0x00000010",
      bytes: ["B8", "00", "00", "00", "00", "00", "00", "00", "40", "00", "00", "00", "00", "00", "00", "00"],
      ascii: "........@.......",
    },
    {
      offset: "0x00000020",
      bytes: ["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
      ascii: "................",
    },
    {
      offset: "0x00000030",
      bytes: ["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "F0", "00", "00", "00"],
      ascii: "................",
    },
    {
      offset: "0x00000040",
      bytes: ["0E", "1F", "BA", "0E", "00", "B4", "09", "CD", "21", "B8", "01", "4C", "CD", "21", "54", "68"],
      ascii: "........!..L.!Th",
    },
    {
      offset: "0x00000050",
      bytes: ["69", "73", "20", "70", "72", "6F", "67", "72", "61", "6D", "20", "63", "61", "6E", "6E", "6F"],
      ascii: "is program canno",
    },
    {
      offset: "0x00000060",
      bytes: ["74", "20", "62", "65", "20", "72", "75", "6E", "20", "69", "6E", "20", "44", "4F", "53", "20"],
      ascii: "t be run in DOS ",
    },
    {
      offset: "0x00000070",
      bytes: ["6D", "6F", "64", "65", "2E", "0D", "0D", "0A", "24", "00", "00", "00", "00", "00", "00", "00"],
      ascii: "mode....$.......",
    },
    {
      offset: "0x00000080",
      bytes: ["56", "69", "72", "74", "75", "61", "6C", "41", "6C", "6C", "6F", "63", "45", "78", "00", "00"],
      ascii: "VirtualAllocEx..",
    },
  ];

  const yaraHits = [
    { rule: "SUSP_SHELLCODE_INJECT_V4", score: "98.4%", match: "$str1 = 'VirtualAllocEx' @ 0x00000080" },
    { rule: "MALW_REVERSE_TCP_GENERIC", score: "94.1%", match: "$ip = '185.220.101.4' @ 0x00000120" },
    { rule: "HOOK_PROCESS_REMOTE_THREAD", score: "89.7%", match: "$fn = 'CreateRemoteThread' @ 0x00000184" },
  ];

  const copyHexDump = () => {
    const text = hexData.map((h) => `${h.offset}  ${h.bytes.join(" ")}  |${h.ascii}|`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 font-sans min-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="pane p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#0a0c10] border border-[#5bffa1] flex items-center justify-center hud-glow-emerald">
            <FileCode className="w-5 h-5 text-[#5bffa1]" />
          </div>
          <div>
            <h1 className="font-mono text-lg font-bold text-[#dbfcff] tracking-wide">
              FORENSIC DEEP-DIVE v2 // BINARY ANALYZER
            </h1>
            <p className="font-mono text-xs text-[#849495]">
              RAW MEMORY DUMP, PROCESS TREE & YARA SIGNATURE MATCH
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={copyHexDump}
            className="px-3 py-1.5 bg-[#161b22] border border-[#30363d] hover:border-[#00f0ff] text-[#e2e2e8] rounded transition-all flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY HEX BUFFER"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Hex Dump Inspector vs Process & YARA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
        {/* Hex Dump Inspector (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="pane flex-1 flex flex-col overflow-hidden">
            <div className="pane-header px-4 py-2.5 flex justify-between items-center border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#5bffa1]" />
                <span className="font-mono text-xs font-bold text-[#e2e2e8] tracking-wider">
                  MEMORY ADDRESS SPACE DUMP [PID: 4920]
                </span>
              </div>

              {/* Offset Jump Input */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#849495]">JUMP TO:</span>
                <input
                  type="text"
                  value={addressSearch}
                  onChange={(e) => setAddressSearch(e.target.value)}
                  className="bg-[#0a0c10] border border-[#30363d] px-2 py-0.5 font-mono text-xs text-[#00f0ff] w-28 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>
            </div>

            {/* Hex Dump Table Viewer */}
            <div className="p-3 bg-[#0a0c10] font-mono text-xs overflow-x-auto flex-1 flex flex-col gap-1">
              <div className="grid grid-cols-12 text-[#849495] font-bold border-b border-[#30363d] pb-1.5 mb-1 px-2">
                <span className="col-span-3">OFFSET</span>
                <span className="col-span-6 text-center">HEXADECIMAL BYTES</span>
                <span className="col-span-3 text-right">ASCII</span>
              </div>

              {hexData.map((row) => {
                const isTarget = row.offset === addressSearch;
                return (
                  <div
                    key={row.offset}
                    className={`grid grid-cols-12 px-2 py-1 rounded transition-colors ${
                      isTarget
                        ? "bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff]"
                        : "hover:bg-[#161b22] text-[#e2e2e8]"
                    }`}
                  >
                    <span className="col-span-3 text-[#00f0ff] font-bold">{row.offset}</span>
                    <span className="col-span-6 font-mono text-center tracking-widest text-[#b9cacb]">
                      {row.bytes.map((b, i) => (
                        <span
                          key={i}
                          className={b === "56" || b === "69" || b === "72" ? "text-[#ffb4ab] font-bold" : ""}
                        >
                          {b}{" "}
                        </span>
                      ))}
                    </span>
                    <span className="col-span-3 text-right text-[#5bffa1] font-mono">
                      {row.ascii}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Section: Process Tree & YARA Hits (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Process Tree Visualization */}
          <div className="pane p-3 flex flex-col gap-2">
            <div className="pane-header p-2 border-b border-[#30363d] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#00f0ff]" />
                <span className="font-mono text-xs font-bold text-[#e2e2e8]">
                  SUSPECT PROCESS TREE
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#ffb4ab]">HOOKED PID: 4920</span>
            </div>

            <div className="font-mono text-xs text-[#b9cacb] space-y-1.5 p-2 bg-[#0a0c10] border border-[#30363d] rounded">
              <div className="text-[#849495]">├─ systemd (PID 1)</div>
              <div className="text-[#849495] pl-4">├─ sshd: root@pts/0 (PID 1084)</div>
              <div className="text-[#e2e2e8] pl-8">├─ /bin/sh (PID 2210)</div>
              <div className="text-[#ffb4ab] font-bold pl-12 bg-[#ffb4ab]/10 p-1 border border-[#ffb4ab]/40 rounded">
                └─ ./axon_exploit (PID 4920) [INJECTED]
              </div>
            </div>
          </div>

          {/* YARA Match Analyzer */}
          <div className="pane flex-1 flex flex-col overflow-hidden">
            <div className="pane-header px-4 py-2.5 flex justify-between items-center border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#ffb4ab]" />
                <span className="font-mono text-xs font-bold text-[#ffb4ab] tracking-wider">
                  YARA RULE SIGNATURE HITS
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#ffb4ab]">3 MATCHES</span>
            </div>

            <div className="p-3 flex flex-col gap-3 overflow-y-auto">
              {yaraHits.map((hit, i) => (
                <div
                  key={i}
                  className="pane p-3 bg-[#111318] border border-[#ffb4ab]/40 rounded flex flex-col gap-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-[#ffb4ab]">
                      {hit.rule}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#ffb4ab]/20 text-[#ffb4ab] font-bold">
                      CONFIDENCE: {hit.score}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[#b9cacb] bg-[#0a0c10] p-1.5 border border-[#30363d] rounded">
                    {hit.match}
                  </p>
                </div>
              ))}

              <a
                href="/outcomes"
                className="mt-2 bg-[#00f0ff] text-[#00363a] font-mono font-bold text-xs py-2 rounded text-center transition-all hover:bg-[#7df4ff] hud-glow flex items-center justify-center gap-2"
              >
                PROCEED TO RESPONSE OUTCOMES
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
