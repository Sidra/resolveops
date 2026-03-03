"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101";

const EMAIL_TEMPLATES = [
  {
    label: "Refund Request",
    from_email: "customer@example.com",
    from_name: "Emily Davis",
    subject: "Need refund for damaged order #ORD-6100",
    body: "Hi, I received order #ORD-6100 today and the items are damaged. The total was $42.50. Can I please get a refund?",
  },
  {
    label: "Shipping Issue",
    from_email: "buyer@example.com",
    from_name: "Tom Harris",
    subject: "Order #ORD-6200 never arrived",
    body: "My order #ORD-6200 was supposed to arrive last week but I still haven't received it. Tracking shows it's been stuck for 5 days. Can you help?",
  },
  {
    label: "Billing Question",
    from_email: "user@example.com",
    from_name: "Lisa Wong",
    subject: "Double charged on my subscription",
    body: "I noticed I was charged twice for my monthly subscription this month ($19.99 each). Can you please look into this and refund the duplicate charge?",
  },
];

interface EmailResult {
  action: string;
  ticket_id: string;
  subject: string;
}

export default function ChannelsPage() {
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fillTemplate = (t: typeof EMAIL_TEMPLATES[0]) => {
    setFromEmail(t.from_email);
    setFromName(t.from_name);
    setSubject(t.subject);
    setBody(t.body);
    setResult(null);
    setError(null);
  };

  const handleSend = async () => {
    if (!fromEmail || !subject || !body) return;
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/channels/email/inbound`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_email: fromEmail,
          from_name: fromName || undefined,
          subject,
          body,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail || `HTTP ${res.status}`);
      }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Channels</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Simulate inbound messages from email and chat
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Simulator */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Email Simulator</h3>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Simulate inbound email. Threads into existing tickets or creates new ones.
          </p>

          {/* Quick templates */}
          <div className="mt-4 flex flex-wrap gap-2">
            {EMAIL_TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => fillTemplate(t)}
                className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="From email *"
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 outline-none focus:border-[var(--color-accent)]"
              />
              <input
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="From name"
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject *"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 outline-none focus:border-[var(--color-accent)]"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body *"
              rows={4}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 outline-none focus:border-[var(--color-accent)]"
            />
            <button
              onClick={handleSend}
              disabled={sending || !fromEmail || !subject || !body}
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Email"}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="mt-4 rounded-md border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-3">
              <p className="text-sm text-[var(--color-success)]">
                {result.action === "created" ? "New ticket created" : "Threaded into existing ticket"}
              </p>
              <Link
                href={`/tickets/${result.ticket_id}`}
                className="mt-1 inline-block text-sm text-[var(--color-accent)] hover:underline"
              >
                View ticket: {result.subject}
              </Link>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-md border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-3 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}
        </div>

        {/* Chat Widget Link */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Live Chat</h3>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Customer-facing chat widget. Opens in a separate view.
          </p>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-center text-sm text-[var(--color-text-secondary)]">
              Simulate a customer starting a live chat conversation.
              <br />
              Messages sent here create tickets and respect shadow mode.
            </p>
            <Link
              href="/chat"
              className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              Open Chat Widget
            </Link>
          </div>

          <div className="mt-6 rounded-md border border-[var(--color-border)] bg-[var(--color-base)] p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              How It Works
            </h4>
            <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
              <li>1. Customer enters email + name + message</li>
              <li>2. System creates a ticket (channel: chat)</li>
              <li>3. Agent/AI responds from the ticket detail page</li>
              <li>4. Customer sees responses via polling (3s interval)</li>
              <li>5. Shadow mode drafts are hidden until approved</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
