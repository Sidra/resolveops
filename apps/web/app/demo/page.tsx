"use client";

import { useState } from "react";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bullets: string[];
  caption?: string;
}

const HERO = {
  headline: "Replace your entire support department with one AI-native operation.",
  sub: "Not chatbots. Not bolt-on AI. One partner that owns ticketing, AI, and labor — governed by policy guardrails so it can safely execute refunds, reships, and account changes.",
};

const PROBLEM_STATS = [
  { label: "Helpdesk software", value: "$50–150", unit: "/agent/mo" },
  { label: "AI bolt-ons", value: "$0.99", unit: "/resolution" },
  { label: "Human labor (BPO)", value: "$8–25", unit: "/hour" },
];

const SLIDES: Slide[] = [
  {
    id: "dashboard",
    title: "Command Center",
    subtitle: "Everything at a glance — zero tab-switching",
    image: "/demo/01-dashboard.png",
    bullets: [
      "Open tickets, auto-resolve rate, and pending actions in real-time",
      "Channel breakdown — email and chat volume at a glance",
      "Drafts pending review — shadow mode AI responses awaiting approval",
      "Live activity feed — every AI decision, policy check, and action logged",
    ],
  },
  {
    id: "tickets",
    title: "Ticket Queue",
    subtitle: "Prioritized, categorized, actionable",
    image: "/demo/02-tickets-list.png",
    bullets: [
      "Color-coded status badges: Open, Pending, Escalated, Resolved",
      "Priority levels from Low to Urgent",
      "Channel icons distinguish email vs. chat at a glance",
      "Status filter for instant focus — show only what matters right now",
    ],
  },
  {
    id: "resolved",
    title: "Full Resolution Loop",
    subtitle: "AI + Policy + Execution — under 2 minutes, zero humans",
    image: "/demo/03-ticket-resolved.png",
    bullets: [
      "Customer reports damaged item — AI responds in seconds",
      "Policy engine auto-approves $34.99 refund (under $50 threshold)",
      "Mock Stripe executor fires — external refund ID logged",
      "AI confirms to customer with timeline — full audit trail preserved",
    ],
    caption: "Total time: under 2 minutes. Zero human involvement. Full audit trail.",
  },
  {
    id: "shadow",
    title: "Shadow Mode",
    subtitle: "AI drafts, humans approve — the trust-building killer feature",
    image: "/demo/04-ticket-shadow-draft.png",
    bullets: [
      "AI writes the response, but it stays invisible to the customer",
      "Amber dashed border + DRAFT badge — unmissable visual signal",
      "Three options: Approve & Send, Edit & Send, or Reject",
      "Shadow mode on by default — flip the switch as trust builds",
    ],
    caption: "Go from \"I don't trust AI\" to \"AI handles 60% of volume\" in weeks.",
  },
  {
    id: "escalation",
    title: "Policy-Gated Actions",
    subtitle: "High-risk actions need human approval — always",
    image: "/demo/05-ticket-escalated-action.png",
    bullets: [
      "$189 refund exceeds auto-approve limit — policy engine catches it",
      "AI acknowledges and tells customer it's been escalated",
      "Manager sees Approve / Reject with one-click execution",
      "Configurable thresholds: <$50 auto, $50-$200 approval, >$200 manual",
    ],
  },
  {
    id: "channels",
    title: "Multi-Channel Inbound",
    subtitle: "Email + Chat in one queue — SMS, WhatsApp, voice coming soon",
    image: "/demo/07-channels.png",
    bullets: [
      "Email simulator with one-click templates for quick testing",
      "Automatic thread detection — matches by email + subject",
      "New emails create tickets or thread into existing conversations",
      "Every channel lands in the same queue — no separate inboxes",
    ],
  },
  {
    id: "email-sent",
    title: "Email Inbound",
    subtitle: "Send an email, get a ticket — threaded automatically",
    image: "/demo/09-channels-email-sent.png",
    bullets: [
      "Click a template — form auto-fills with realistic customer data",
      "Hit send — system creates or threads into existing ticket",
      "Success confirmation with direct link to the ticket",
      "Strips Re:/Fwd: prefixes for accurate thread matching",
    ],
  },
  {
    id: "chat",
    title: "Live Chat Widget",
    subtitle: "Customer-facing chat — shadow mode aware",
    image: "/demo/12-chat-active.png",
    bullets: [
      "Clean pre-chat form: email, name, message",
      "Chat bubbles with timestamps — modern experience",
      "Agent View button links directly to the ops dashboard",
      "Shadow mode drafts invisible to customer until approved",
    ],
  },
  {
    id: "audit",
    title: "Complete Audit Trail",
    subtitle: "Every decision logged — who, what, when, why",
    image: "/demo/13-audit-log.png",
    bullets: [
      "14 event types — color-coded for instant scanning",
      "Actor tracking: system, AI model, policy-engine, agent",
      "Filter by event type, search descriptions, paginate",
      "Answer \"why did AI refund this?\" in seconds, not hours",
    ],
    caption: "This isn't just compliance. It's operational visibility.",
  },
  {
    id: "playground",
    title: "LLM Playground",
    subtitle: "Test and tune the AI — no code required",
    image: "/demo/14-playground.png",
    bullets: [
      "Direct chat with the underlying LLM (Gemini 3.1 default)",
      "Swappable to OpenAI or Anthropic with one config change",
      "Test prompts, tune response quality, experiment with system prompts",
      "Streaming responses with stop button for iteration",
    ],
  },
];

const DIFFERENTIATORS = [
  { dimension: "Setup time", traditional: "Weeks to months", resolveops: "1 day" },
  { dimension: "Operator burden", traditional: "You manage everything", resolveops: "We own it end-to-end" },
  { dimension: "AI trust model", traditional: "Trust it or don't", resolveops: "Shadow mode: gradual trust" },
  { dimension: "Actions", traditional: "AI suggests, humans copy-paste", resolveops: "Policy-governed auto-execute" },
  { dimension: "Audit trail", traditional: "Minimal or none", resolveops: "Every decision logged" },
  { dimension: "Vendor count", traditional: "3 (helpdesk + AI + labor)", resolveops: "1 partner, 1 bill" },
];

const METRICS = [
  { label: "Auto-resolve rate", value: "60%+", detail: "within 2 weeks" },
  { label: "First response", value: "<5 min", detail: "vs. 4-12 hrs human" },
  { label: "Cost savings", value: "30%+", detail: "below traditional" },
  { label: "Setup time", value: "1 day", detail: "connect + go live" },
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DemoPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = SLIDES[activeSlide];

  return (
    <div className="space-y-16 pb-20">
      {/* ---- Hero ---- */}
      <section className="text-center">
        <SectionLabel>Product Demo</SectionLabel>
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-[var(--color-text-primary)] sm:text-4xl">
          {HERO.headline}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-secondary)]">
          {HERO.sub}
        </p>
      </section>

      {/* ---- Problem ---- */}
      <section>
        <SectionLabel>The Problem</SectionLabel>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Customer support today is three separate bills
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PROBLEM_STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                {s.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-error)]">
                {s.value}
                <span className="text-sm font-normal text-[var(--color-text-secondary)]">
                  {s.unit}
                </span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
          Result: 15-30% of revenue burned on support. Inconsistent quality. Founder time wasted.
          <span className="ml-1 font-semibold text-[var(--color-accent)]">
            ResolveOps collapses all three into one.
          </span>
        </p>
      </section>

      {/* ---- Interactive Walkthrough ---- */}
      <section>
        <SectionLabel>The Product</SectionLabel>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Interactive walkthrough
        </h2>

        {/* Tab bar */}
        <div className="mt-4 flex flex-wrap gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveSlide(i)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                i === activeSlide
                  ? "bg-[var(--color-accent)] text-white"
                  : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Slide content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          {/* Screenshot */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-base)]">
              <Image
                src={slide.image}
                alt={slide.title}
                width={1440}
                height={900}
                className="h-auto w-full"
                priority={activeSlide === 0}
              />
            </div>
            {/* Prev / Next */}
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                disabled={activeSlide === 0}
                className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {activeSlide + 1} / {SLIDES.length}
              </span>
              <button
                onClick={() => setActiveSlide(Math.min(SLIDES.length - 1, activeSlide + 1))}
                disabled={activeSlide === SLIDES.length - 1}
                className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                {String(activeSlide + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">
                {slide.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {slide.subtitle}
              </p>

              <ul className="mt-5 space-y-3">
                {slide.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-[var(--color-text-secondary)]">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                    {b}
                  </li>
                ))}
              </ul>

              {slide.caption && (
                <p className="mt-5 rounded-md border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 px-3 py-2 text-xs font-medium text-[var(--color-accent)]">
                  {slide.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Differentiators ---- */}
      <section>
        <SectionLabel>Why ResolveOps</SectionLabel>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Traditional support vs. ResolveOps
        </h2>

        <div className="mt-4 overflow-hidden rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface)]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Dimension
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Traditional
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                  ResolveOps
                </th>
              </tr>
            </thead>
            <tbody>
              {DIFFERENTIATORS.map((d, i) => (
                <tr
                  key={d.dimension}
                  className={i % 2 === 0 ? "bg-[var(--color-base)]" : "bg-[var(--color-surface)]"}
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {d.dimension}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {d.traditional}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-success)]">
                    {d.resolveops}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- Metrics ---- */}
      <section>
        <SectionLabel>Target Metrics</SectionLabel>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          The numbers we deliver
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                {m.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-[var(--color-accent)]">{m.value}</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="text-center">
        <div className="mx-auto max-w-xl rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-8">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            The future of customer support isn&apos;t better software.
          </h2>
          <p className="mt-2 text-lg font-semibold text-[var(--color-accent)]">
            It&apos;s no software at all. Just results.
          </p>
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            Connect your channels. Set your policies. Go live.
            <br />
            ResolveOps handles everything else.
          </p>
        </div>
      </section>
    </div>
  );
}
