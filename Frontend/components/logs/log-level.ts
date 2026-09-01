import type { LogLevel } from "@/lib/logs";

export const logLevelStyles: Record<LogLevel, string> = {
  DEBUG: "border-[#849495] bg-[#849495]/10 text-[#b9cacb]",
  INFO: "border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]",
  WARN: "border-[#f7d774] bg-[#f7d774]/10 text-[#f7d774]",
  ERROR: "border-[#ffb86b] bg-[#ffb86b]/10 text-[#ffb86b]",
  CRITICAL: "border-[#ffb4ab] bg-[#ffb4ab]/10 text-[#ffb4ab]",
};
