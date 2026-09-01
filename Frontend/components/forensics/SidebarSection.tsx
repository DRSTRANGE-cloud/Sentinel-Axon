import type { LucideIcon } from "lucide-react";

interface SidebarSectionProps {
  icon: LucideIcon;
  title: string;
  count?: string;
  children: React.ReactNode;
  ai?: boolean;
}

export function SidebarSection({ icon: Icon, title, count, children, ai }: SidebarSectionProps) {
  return (
    <section className="pane overflow-hidden">
      <div className="pane-header px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 ${ai ? "text-[#c7a6ff]" : "text-[#00f0ff]"}`} />
          <h2 className="font-mono text-xs font-bold tracking-wider text-[#e2e2e8] truncate">
            {title}
          </h2>
        </div>
        {count ? (
          <span className="font-mono text-[10px] text-[#849495] shrink-0">{count}</span>
        ) : null}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}
