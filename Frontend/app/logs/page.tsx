"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LogDetailsDrawer,
  LogsFilters,
  LogsHeader,
  LogsPagination,
  LogsTable,
} from "@/components/logs";
import {
  defaultLogFilters,
  fetchEventLogs,
  filterLogs,
  getFilterOptions,
  type LogFilters,
  type LogRecord,
} from "@/lib/logs";

const pageSize = 5;
const refreshIntervalMs = 4000;

export default function LogsPage() {
  const [filters, setFilters] = useState<LogFilters>(defaultLogFilters);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const options = useMemo(() => getFilterOptions(logs), [logs]);
  const filteredLogs = useMemo(() => filterLogs(logs, filters), [logs, filters]);
  const pageCount = Math.ceil(filteredLogs.length / pageSize);
  const visibleLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const loadLogs = useCallback(async (showLoading = true) => {
    if (showLoading) {
      if (logs.length === 0) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
    }
    try {
      const records = await fetchEventLogs();
      setLogs(records);
      if (showLoading) {
        setPage(1);
      }
      setLastUpdated(new Date().toISOString().substring(11, 19) + " UTC");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load event logs");
      if (logs.length === 0) {
        setLogs([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [logs.length]);

  useEffect(() => {
    let cancelled = false;

    fetchEventLogs()
      .then((records) => {
        if (cancelled) return;
        setLogs(records);
        setPage(1);
        setLastUpdated(new Date().toISOString().substring(11, 19) + " UTC");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load event logs");
        setLogs([]);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadLogs(false);
    }, refreshIntervalMs);

    return () => window.clearInterval(interval);
  }, [loadLogs]);

  const updateFilters = (nextFilters: LogFilters) => {
    setFilters(nextFilters);
    setPage(1);
    setError(null);
  };

  const copyRawLog = async (log: LogRecord) => {
    await navigator.clipboard.writeText(JSON.stringify(log.raw, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 font-sans min-h-[calc(100vh-5rem)]">
      <LogsHeader
        isLoading={isLoading || isRefreshing}
        lastUpdated={lastUpdated}
        onRefresh={loadLogs}
      />

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
