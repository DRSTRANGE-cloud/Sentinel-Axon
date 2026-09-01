import type { MetadataItem } from "@/lib/forensics/types";

export function DetailRow({ label, value }: MetadataItem) {
  return (
    <div className="grid grid-cols-[minmax(6.5rem,0.8fr)_minmax(0,1.2fr)] gap-3 items-baseline border-b border-[#30363d]/70 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#849495]">
        {label}
      </dt>
      <dd className="min-w-0 break-words font-mono text-[11px] text-[#e2e2e8]">
        {value}
      </dd>
    </div>
  );
}
