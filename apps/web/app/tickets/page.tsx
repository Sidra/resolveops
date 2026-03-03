"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101";

interface Ticket {
  id: string;
  channel: string;
  status: string;
  priority: string;
  subject: string;
  customer_email: string;
  customer_name: string | null;
  created_at: string;
  updated_at: string;
}

interface TicketListResponse {
  items: Ticket[];
  total: number;
  page: number;
  page_size: number;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-400",
  pending: "bg-yellow-500/15 text-yellow-400",
  resolved: "bg-green-500/15 text-green-400",
  closed: "bg-gray-500/15 text-gray-400",
  escalated: "bg-red-500/15 text-red-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-500/15 text-gray-400",
  medium: "bg-blue-500/15 text-blue-400",
  high: "bg-orange-500/15 text-orange-400",
  urgent: "bg-red-500/15 text-red-400",
};

const CHANNEL_ICONS: Record<string, string> = {
  email: "✉",
  chat: "💬",
  sms: "📱",
  whatsapp: "📲",
  voice: "📞",
};

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TicketsPage() {
  const [data, setData] = useState<TicketListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: "25" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`${API_URL}/tickets?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const totalPages = data ? Math.ceil(data.total / 25) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Tickets</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {data ? `${data.total} total` : "Loading…"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            New Ticket
          </button>
          <button
            onClick={fetchTickets}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-light)]"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Create ticket form */}
      {showCreate && (
        <CreateTicketForm
          onCreated={() => {
            setShowCreate(false);
            fetchTickets();
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-[var(--color-text-secondary)]">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">All</option>
          {["open", "pending", "resolved", "closed", "escalated"].map((s) => (
            <option key={s} value={s}>{formatLabel(s)}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-[var(--color-error)] bg-[var(--color-error)]/10 px-4 py-2 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Ticket list */}
      <div className="space-y-2">
        {loading && !data ? (
          <div className="py-12 text-center text-[var(--color-text-secondary)]">Loading…</div>
        ) : data?.items.length === 0 ? (
          <div className="py-12 text-center text-[var(--color-text-secondary)]">No tickets found</div>
        ) : (
          data?.items.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-surface-light)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span title={ticket.channel}>{CHANNEL_ICONS[ticket.channel] || "📧"}</span>
                    <h3 className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {ticket.subject}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {ticket.customer_name || ticket.customer_email} · {timeAgo(ticket.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || ""}`}>
                    {formatLabel(ticket.priority)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status] || ""}`}>
                    {formatLabel(ticket.status)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] disabled:opacity-50">
              Previous
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function CreateTicketForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    subject: "",
    customer_email: "",
    customer_name: "",
    message: "",
    priority: "medium",
    channel: "email",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Create New Ticket</h3>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          placeholder="Customer name" className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]" />
        <input value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
          placeholder="Customer email *" required type="email" className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]" />
      </div>
      <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
        placeholder="Subject *" required className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]" />
      <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
        placeholder="Customer message *" required rows={3} className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]" />
      <div className="flex items-center gap-3">
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none">
          <option value="email">Email</option>
          <option value="chat">Chat</option>
          <option value="sms">SMS</option>
        </select>
        <div className="flex-1" />
        <button type="button" onClick={onCancel}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]">
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
          {submitting ? "Creating…" : "Create Ticket"}
        </button>
      </div>
    </form>
  );
}
