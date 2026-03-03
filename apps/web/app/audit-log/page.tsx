"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101";

interface AuditEntry {
  id: string;
  event_type: string;
  actor: string | null;
  ticket_id: string | null;
  description: string;
  result: string | null;
  created_at: string;
}

interface AuditResponse {
  items: AuditEntry[];
  total: number;
  page: number;
  page_size: number;
}

const EVENT_TYPES = [
  "ticket_created",
  "ticket_resolved",
  "ticket_escalated",
  "ai_response",
  "policy_check",
  "action_requested",
  "action_executed",
  "action_rejected",
  "human_override",
];

const EVENT_COLORS: Record<string, string> = {
  ticket_created:
    "bg-blue-500/15 text-blue-400 dark:bg-blue-500/15 dark:text-blue-400",
  ticket_resolved:
    "bg-green-500/15 text-green-600 dark:bg-green-500/15 dark:text-green-400",
  ticket_escalated:
    "bg-orange-500/15 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  ai_response:
    "bg-purple-500/15 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
  policy_check:
    "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400",
  action_requested:
    "bg-yellow-500/15 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400",
  action_executed:
    "bg-green-500/15 text-green-600 dark:bg-green-500/15 dark:text-green-400",
  action_rejected:
    "bg-red-500/15 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  human_override:
    "bg-amber-500/15 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
};

const RESULT_COLORS: Record<string, string> = {
  success:
    "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  approved:
    "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  failed:
    "bg-[var(--color-error)]/15 text-[var(--color-error)]",
  rejected:
    "bg-[var(--color-error)]/15 text-[var(--color-error)]",
  pending:
    "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
};

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AuditLogPage() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const pageSize = 25;

  const fetchAuditLog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (filter) params.set("event_type", filter);

      const res = await fetch(`${API_URL}/audit-log?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AuditResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Audit Log
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Every event tracked across the platform
          </p>
        </div>
        <button
          onClick={fetchAuditLog}
          disabled={loading}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-[var(--color-text-secondary)]">
          Filter by event:
        </label>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">All events</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {formatLabel(t)}
            </option>
          ))}
        </select>
        {data && (
          <span className="text-xs text-[var(--color-text-secondary)]">
            {data.total} {data.total === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-[var(--color-error)] bg-[var(--color-error)]/10 px-4 py-2 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Time
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Event
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Actor
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Description
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-[var(--color-text-secondary)]"
                >
                  Loading…
                </td>
              </tr>
            ) : data && data.items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-[var(--color-text-secondary)]"
                >
                  No audit entries found
                </td>
              </tr>
            ) : (
              data?.items.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-light)]"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--color-text-secondary)]">
                    {formatTime(entry.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        EVENT_COLORS[entry.event_type] ||
                        "bg-gray-500/15 text-gray-400"
                      }`}
                    >
                      {formatLabel(entry.event_type)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--color-text-primary)]">
                    {entry.actor || "—"}
                  </td>
                  <td className="max-w-md px-4 py-3 text-[var(--color-text-primary)]">
                    {entry.description}
                  </td>
                  <td className="px-4 py-3">
                    {entry.result ? (
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          RESULT_COLORS[entry.result] ||
                          "bg-gray-500/15 text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {formatLabel(entry.result)}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-secondary)]">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-light)] disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-light)] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
