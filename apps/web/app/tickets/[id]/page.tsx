"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101";

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface Action {
  id: string;
  type: string;
  status: string;
  amount: number | null;
  currency: string | null;
  approved_by: string | null;
  created_at: string;
}

interface TicketDetail {
  id: string;
  channel: string;
  status: string;
  priority: string;
  subject: string;
  customer_email: string;
  customer_name: string | null;
  created_at: string;
  updated_at: string;
  messages: Message[];
  actions: Action[];
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

const ROLE_STYLES: Record<string, { bg: string; label: string; align: string }> = {
  customer: { bg: "bg-[var(--color-accent)] text-white", label: "Customer", align: "justify-end" },
  ai: { bg: "border border-purple-500/30 bg-purple-500/10 text-[var(--color-text-primary)]", label: "AI", align: "justify-start" },
  agent: { bg: "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]", label: "Agent", align: "justify-start" },
  system: { bg: "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] italic", label: "System", align: "justify-center" },
};

const ACTION_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-green-500/15 text-green-400",
  executed: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
  failed: "bg-red-500/15 text-red-400",
};

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null);
  const [showActionForm, setShowActionForm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchTicket = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/tickets/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTicket(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages.length]);

  const handleAIRespond = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/tickets/${id}/respond`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      await fetchTicket();
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI response failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAction = async (type: string, amount: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/tickets/${id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount, currency: "USD" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      setShowActionForm(false);
      await fetchTicket();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproval = async (actionId: string, decision: "approve" | "reject") => {
    setApprovalLoading(actionId);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/tickets/${id}/actions/${actionId}/${decision}`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      await fetchTicket();
    } catch (e) {
      setError(e instanceof Error ? e.message : `${decision} failed`);
    } finally {
      setApprovalLoading(null);
    }
  };

  const handleResolve = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/tickets/${id}/resolve`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchTicket();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resolve failed");
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-[var(--color-text-secondary)]">Loading ticket…</div>;
  }

  if (!ticket) {
    return <div className="py-12 text-center text-[var(--color-text-secondary)]">Ticket not found</div>;
  }

  const isResolved = ticket.status === "resolved" || ticket.status === "closed";
  const hasPendingAction = ticket.actions.some((a) => a.status === "pending");

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href="/tickets" className="text-sm text-[var(--color-accent)] hover:underline">
              Tickets
            </Link>
            <span className="text-[var(--color-text-secondary)]">/</span>
          </div>
          <h2 className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">
            {ticket.subject}
          </h2>
          <div className="mt-1 flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
            <span>{ticket.customer_name || ticket.customer_email}</span>
            <span>·</span>
            <span>{ticket.channel}</span>
            <span>·</span>
            <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_COLORS[ticket.status] || ""}`}>
              {formatLabel(ticket.status)}
            </span>
            <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_COLORS[ticket.priority] || ""}`}>
              {formatLabel(ticket.priority)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={fetchTicket}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]">
            Refresh
          </button>
          {!isResolved && (
            <button onClick={handleResolve}
              className="rounded-md bg-[var(--color-success)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-80">
              Resolve
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {ticket.messages.map((msg) => {
            const style = ROLE_STYLES[msg.role] || ROLE_STYLES.system;
            return (
              <div key={msg.id} className={`flex ${style.align}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-3 ${style.bg}`}>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-medium opacity-70">{style.label}</span>
                    <span className="text-xs opacity-50">{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {/* Actions display */}
          {ticket.actions.length > 0 && (
            <div className="space-y-2">
              {ticket.actions.map((action) => (
                <div key={action.id}
                  className="mx-auto max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {formatLabel(action.type)}: ${action.amount?.toFixed(2)} {action.currency}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_STATUS_COLORS[action.status] || ""}`}>
                      {formatLabel(action.status)}
                    </span>
                  </div>
                  {action.approved_by && (
                    <p className="mt-1 text-center text-xs text-[var(--color-text-secondary)]">
                      {action.status === "executed" ? "Approved" : "Reviewed"} by: {action.approved_by}
                    </p>
                  )}

                  {/* Approve/Reject buttons for pending actions */}
                  {action.status === "pending" && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleApproval(action.id, "approve")}
                        disabled={approvalLoading === action.id}
                        className="rounded-md bg-[var(--color-success)] px-4 py-1.5 text-xs font-medium text-white hover:opacity-80 disabled:opacity-50"
                      >
                        {approvalLoading === action.id ? "Processing…" : "Approve"}
                      </button>
                      <button
                        onClick={() => handleApproval(action.id, "reject")}
                        disabled={approvalLoading === action.id}
                        className="rounded-md bg-[var(--color-error)] px-4 py-1.5 text-xs font-medium text-white hover:opacity-80 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-auto max-w-3xl rounded-md border border-[var(--color-error)] bg-[var(--color-error)]/10 px-4 py-2 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Action form */}
      {showActionForm && !isResolved && (
        <ActionForm onSubmit={handleAction} onCancel={() => setShowActionForm(false)} loading={actionLoading} />
      )}

      {/* Action bar */}
      {!isResolved && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <div className="mx-auto flex max-w-3xl gap-3">
            <button onClick={handleAIRespond} disabled={aiLoading}
              className="rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50">
              {aiLoading ? "AI Thinking…" : "AI Respond"}
            </button>
            <button onClick={() => setShowActionForm(!showActionForm)}
              className="rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-light)]">
              Process Action
            </button>
          </div>
        </div>
      )}

      {/* Resolved banner */}
      {isResolved && (
        <div className="border-t border-[var(--color-success)]/30 bg-[var(--color-success)]/5 px-6 py-3 text-center text-sm text-[var(--color-success)]">
          This ticket has been resolved
        </div>
      )}
    </div>
  );
}

function ActionForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (type: string, amount: number) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [type, setType] = useState("refund");
  const [amount, setAmount] = useState("");

  return (
    <div className="mx-auto mb-4 max-w-3xl rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Process Action</h4>
      <div className="flex items-center gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none">
          <option value="refund">Refund</option>
          <option value="reship">Reship</option>
        </select>
        <div className="flex items-center gap-1">
          <span className="text-sm text-[var(--color-text-secondary)]">$</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)}
            type="number" step="0.01" min="0" placeholder="Amount" required
            className="w-28 rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]" />
        </div>
        <button onClick={onCancel}
          className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]">
          Cancel
        </button>
        <button onClick={() => amount && onSubmit(type, parseFloat(amount))} disabled={loading || !amount}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
          {loading ? "Processing…" : "Submit"}
        </button>
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
        Under $50: auto-approved. $50–$200: requires manager approval. Over $200: manual review.
      </p>
    </div>
  );
}
