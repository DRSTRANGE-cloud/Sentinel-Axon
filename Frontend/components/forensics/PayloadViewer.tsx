import { Braces } from "lucide-react";

interface PayloadViewerProps {
  payload: string;
}

export function PayloadViewer({ payload }: PayloadViewerProps) {
  return (
    <section className="border border-[#30363d] bg-[#111318] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#30363d] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Braces className="w-4 h-4 text-[#00f0ff]" />
          <h3 className="font-mono text-xs font-bold tracking-wider text-[#e2e2e8]">
            PAYLOAD
          </h3>
        </div>
        <span className="font-mono text-[10px] text-[#849495]">UNTRUSTED TEXT VIEW</span>
      </div>
      <div
        className="max-h-[420px] overflow-auto bg-[#0a0c10] p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#00f0ff]"
        tabIndex={0}
        aria-label="Raw event payload"
      >
        <pre className="min-w-max whitespace-pre text-[12px] leading-6 font-mono text-[#d6e7e8]">
          {payload}
        </pre>
      </div>
    </section>
  );
}
