"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface LogsPaginationProps {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function LogsPagination({ page, pageCount, total, pageSize, onPageChange }: LogsPaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="pane p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p className="font-mono text-[11px] text-[#849495]">
        SHOWING <span className="text-[#e2e2e8]">{start}-{end}</span> OF{" "}
        <span className="text-[#e2e2e8]">{total}</span> LOGS
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 border border-[#30363d] bg-[#161b22] disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:border-[#00f0ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00f0ff] rounded flex items-center justify-center"
          aria-label="Previous logs page"
        >
          <ChevronLeft className="w-4 h-4 text-[#e2e2e8]" />
        </button>
        <span className="font-mono text-[11px] text-[#b9cacb]">
          PAGE {page} / {Math.max(pageCount, 1)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="w-8 h-8 border border-[#30363d] bg-[#161b22] disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:border-[#00f0ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00f0ff] rounded flex items-center justify-center"
          aria-label="Next logs page"
        >
          <ChevronRight className="w-4 h-4 text-[#e2e2e8]" />
        </button>
      </div>
    </div>
  );
}
