"use client";

import { useMemo, useState } from "react";
import {
  LogDetailsDrawer,
  LogsFilters,
  LogsHeader,
  LogsPagination,
  LogsTable,
} from "@/components/logs";
import {
  defaultLogFilters,
  filterLogs,
  getFilterOptions,
  logRecords,
  type LogFilters,
  type LogRecord,
} from "@/lib/logs";

const pageSize = 5;

export default function LogsPage() {
  const [filters, setFilters] = useState<LogFilters>(defaultLogFilters);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(() => getFilterOptions(logRecords), []);
  const filteredLogs = useMemo(() => filterLogs(logRecords, filters), [filters]);
  const pageCount = Math.ceil(filteredLogs.length / pageSize);
  const visibleLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const updateFilters = (nextFilters: LogFilters) => {
    setFilters(nextFilters);
    setPage(1);
    setError(null);
  };

  const refreshLogs = () => {
    setIsLoading(true);
    setError(null);
    window.setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  const copyRawLog = async (log: LogRecord) => {
    await navigator.clipboard.writeText(JSON.stringify(log.raw, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 font-sans min-h-[calc(100vh-5rem)]">
      <LogsHeader isLoading={isLoading} onRefresh={refreshLogs} />

      <LogsFilters
        filters={filters}
        applications={options.applications}
        events={options.events}
        onChange={updateFilters}
      />

      {error ? (
        <section className="pane p-4 border-[#ffb4ab]/60 bg-[#ffb4ab]/10">
          <p className="font-mono text-sm font-bold text-[#ffb4ab]">LOG API ERROR</p>
          <p className="mt-1 text-xs text-[#e2e2e8]">{error}</p>
        </section>
      ) : null}

      <LogsTable logs={visibleLogs} isLoading={isLoading} onSelect={setSelectedLog} />

      <LogsPagination
        page={page}
        pageCount={pageCount}
        total={filteredLogs.length}
        pageSize={pageSize}
        onPageChange={(nextPage) => setPage(Math.min(Math.max(nextPage, 1), Math.max(pageCount, 1)))}
      />

      <LogDetailsDrawer
        log={selectedLog}
        copied={copied}
        onCopy={copyRawLog}
        onClose={() => {
          setSelectedLog(null);
          setCopied(false);
        }}
      />
    </div>
  );
}
