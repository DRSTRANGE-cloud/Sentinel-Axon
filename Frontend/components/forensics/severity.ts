import type { Severity } from "@/lib/forensics/types";

export const severityStyles: Record<Severity, string> = {
  LOW: "border-[#5bffa1] bg-[#5bffa1]/10 text-[#5bffa1]",
  MEDIUM: "border-[#f7d774] bg-[#f7d774]/10 text-[#f7d774]",
  HIGH: "border-[#ffb86b] bg-[#ffb86b]/10 text-[#ffb86b]",
  CRITICAL: "border-[#ffb4ab] bg-[#ffb4ab]/10 text-[#ffb4ab]",
};
