"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Shield, Radio, Bell, Activity, Lock, Cpu } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [time, setTime] = useState<string>("");
  const [lockdown, setLockdown] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toISOString().substring(11, 19) + " UTC");
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: "HUD", path: "/" },
    { label: "COCKPIT", path: "/investigate" },
    { label: "LOGS", path: "/logs" },
    { label: "DEEP-DIVE", path: "/forensics" },
    { label: "RESPONSE", path: "/outcomes" },
  ];

  return (
    <header className="bg-[#111318] text-[#e2e2e8] flex justify-between items-center h-16 w-full px-6 border-b border-[#30363d] sticky top-0 z-50">
      {/* Brand & Live System Status */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded border border-[#00f0ff] flex items-center justify-center bg-[#0a0c10] hud-glow">
            <Shield className="w-4 h-4 text-[#00f0ff]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-wider text-[#dbfcff] font-mono group-hover:text-[#00f0ff] transition-colors">
              SENTINEL-AXON
            </span>
            <span className="text-[10px] text-[#849495] font-mono tracking-widest -mt-1">
              CYBER COMMAND v4.2
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#161b22] border border-[#30363d] rounded text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#5bffa1] animate-pulse"></span>
          <span className="text-[#5bffa1]">GRID ONLINE</span>
          <span className="text-[#849495] mx-1">|</span>
          <span className="text-[#b9cacb]">{time || "10:41:00 UTC"}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-1 md:gap-4 h-full font-mono text-xs font-bold tracking-wider">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`h-full flex items-center px-3 md:px-4 border-b-2 transition-all duration-150 ${
                isActive
                  ? "border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/5"
                  : "border-transparent text-[#b9cacb] hover:text-[#00f0ff] hover:border-[#00f0ff]/40"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLockdown(!lockdown)}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all border ${
            lockdown
              ? "bg-[#ffb4ab]/20 text-[#ffb4ab] border-[#ffb4ab] hud-glow-error"
              : "bg-[#161b22] text-[#b9cacb] border-[#30363d] hover:border-[#00f0ff] hover:text-[#00f0ff]"
          }`}
          title="Toggle Lockdown Mode"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{lockdown ? "DEFCON 1 LOCKDOWN" : "LOCKDOWN"}</span>
        </button>

        <div className="flex items-center gap-2 text-[#849495] bg-[#161b22] p-1.5 rounded border border-[#30363d]">
          <Radio className="w-4 h-4 text-[#00f0ff] animate-pulse" />
          <Bell className="w-4 h-4 text-[#b9cacb] hover:text-[#00f0ff] cursor-pointer" />
          <Activity className="w-4 h-4 text-[#5bffa1]" />
        </div>

        {/* Profile Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#30363d]">
          <div className="w-8 h-8 rounded border border-[#00f0ff]/50 bg-[#161b22] overflow-hidden flex items-center justify-center">
            <Cpu className="w-5 h-5 text-[#00f0ff]" />
          </div>
        </div>
      </div>
    </header>
  );
}
