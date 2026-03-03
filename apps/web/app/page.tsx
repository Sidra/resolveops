"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101";

interface ChannelBreakdown {
  email: number;
  chat: number;
  other: number;
}

interface DashboardStats {
  open_tickets: number;
  resolved_today: number;
  total_tickets: number;
  auto_resolve_rate: number;
  pending_actions: number;
  total_actions_today: number;
  drafts_pending: number;
  channels: ChannelBreakdown;
}

interface AuditItem {
  id: string;
  event_type: string;
  actor: string | null;
  description: string;
  result: string | null;
  created_at: string;
}

interface DashboardData {
  stats: DashboardStats;
  recent_activity: AuditItem[];
}

const EVENT_COLORS: Record<string, string> = {
  ticket_created: "text-blue-400",
  ticket_resolved: "text-green-400",
  ticket_escalated: "text-orange-400",
  ai_response: "text-purple-400",
  policy_check: "text-cyan-400",
  action_executed: "text-green-400",
  action_rejected: "text-red-400",
  shadow_draft: "text-amber-400",
  shadow_approved: "text-green-400",
  shadow_rejected: "text-red-400",
  shadow_edited: "text-amber-400",
  channel_inbound: "text-blue-400",
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard`);
      if (res.ok) setData(await res.json());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Command Center
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            AI-native customer ops at a glance
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]"
        >
          Refresh
        </button>
      </div>

      {/* Stats cards — top row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Open Tickets"
          value={loading ? "—" : String(stats?.open_tickets ?? 0)}
          color="text-[var(--color-warning)]"
        />
        <StatCard
          label="Resolved Today"
          value={loading ? "—" : String(stats?.resolved_today ?? 0)}
          color="text-[var(--color-success)]"
        />
        <StatCard
          label="Auto-Resolve Rate"
          value={loading ? "—" : `${stats?.auto_resolve_rate ?? 0}%`}
          color="text-[var(--color-accent)]"
        />
        <StatCard
          label="Pending Actions"
          value={loading ? "—" : String(stats?.pending_actions ?? 0)}
          color={
            (stats?.pending_actions ?? 0) > 0
              ? "text-[var(--color-error)]"
              : "text-[var(--color-success)]"
          }
        />
      </div>

      {/* Second row: drafts + channels */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Drafts Pending Review"
          value={loading ? "—" : String(stats?.drafts_pending ?? 0)}
          color={
            (stats?.drafts_pending ?? 0) > 0
              ? "text-amber-400"
              : "text-[var(--color-success)]"
          }
        />
        <StatCard
          label="Email Tickets"
          value={loading ? "—" : String(stats?.channels?.email ?? 0)}
          color="text-blue-400"
        />
        <StatCard
          label="Chat Tickets"
          value={loading ? "—" : String(stats?.channels?.chat ?? 0)}
          color="text-purple-400"
        />
        <StatCard
          label="Actions Today"
          value={loading ? "—" : String(stats?.total_actions_today ?? 0)}
          color="text-[var(--color-text-primary)]"
        />
      </div>

      {/* Ticket summary + activity feed */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quick ticket summary */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Ticket Overview
            </h3>
            <Link
              href="/tickets"
              className="text-xs text-[var(--color-accent)] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Total tickets</span>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {loading ? "—" : stats?.total_tickets ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Open</span>
              <span className="text-sm font-medium text-[var(--color-warning)]">
                {loading ? "—" : stats?.open_tickets ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Resolved today</span>
              <span className="text-sm font-medium text-[var(--color-success)]">
                {loading ? "—" : stats?.resolved_today ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Drafts pending</span>
              <span className="text-sm font-medium text-amber-400">
                {loading ? "—" : stats?.drafts_pending ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Recent Activity
            </h3>
            <Link
              href="/audit-log"
              className="text-xs text-[var(--color-accent)] hover:underline"
            >
              Full log
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>
            ) : data?.recent_activity.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">No activity yet</p>
            ) : (
              data?.recent_activity.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 text-xs font-medium ${EVENT_COLORS[item.event_type] || "text-[var(--color-text-secondary)]"}`}
                  >
                    {formatLabel(item.event_type)}
                  </span>
                  <p className="flex-1 text-xs text-[var(--color-text-secondary)] line-clamp-1">
                    {item.description}
                  </p>
                  <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                    {timeAgo(item.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${color || "text-[var(--color-text-primary)]"}`}>
        {value}
      </p>
    </div>
  );
}
