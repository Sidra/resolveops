"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWidgetPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTimestamp = useRef<string | null>(null);

  const pollMessages = useCallback(async () => {
    if (!ticketId) return;
    try {
      const afterParam = lastTimestamp.current ? `?after=${encodeURIComponent(lastTimestamp.current)}` : "";
      const res = await fetch(`${API_URL}/channels/chat/${ticketId}/messages${afterParam}`);
      if (!res.ok) return;
      const data: ChatMessage[] = await res.json();
      if (data.length > 0) {
        if (!lastTimestamp.current) {
          setMessages(data);
        } else {
          setMessages((prev) => [...prev, ...data]);
        }
        lastTimestamp.current = data[data.length - 1].created_at;
      }
    } catch {
      // silent
    }
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;
    pollMessages();
    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [ticketId, pollMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleStart = async () => {
    if (!email || !firstMessage) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/channels/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_email: email,
          customer_name: name || undefined,
          message: firstMessage,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setTicketId(data.ticket_id);
      lastTimestamp.current = null;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start chat");
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !ticketId) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/channels/chat/${ticketId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim(), sender: "customer" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setInput("");
      await pollMessages();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  // Pre-chat form
  if (!ticketId) {
    return (
      <div className="mx-auto max-w-md space-y-6 pt-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="mt-3 text-xl font-bold text-[var(--color-text-primary)]">Start a Conversation</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            We typically respond within seconds
          </p>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email *"
              type="email"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 outline-none focus:border-[var(--color-accent)]"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 outline-none focus:border-[var(--color-accent)]"
            />
            <textarea
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder="How can we help? *"
              rows={3}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 outline-none focus:border-[var(--color-accent)]"
            />
            <button
              onClick={handleStart}
              disabled={starting || !email || !firstMessage}
              className="w-full rounded-md bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {starting ? "Starting..." : "Start Chat"}
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-md border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-2 text-xs text-[var(--color-error)]">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[var(--color-text-secondary)]">
          <Link href="/channels" className="text-[var(--color-accent)] hover:underline">
            Back to Channels
          </Link>
        </p>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-lg flex-col">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">ResolveOps Support</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">Ticket #{ticketId.slice(0, 8)}</p>
        </div>
        <Link
          href={`/tickets/${ticketId}`}
          className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]"
        >
          Agent View
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto border-x border-[var(--color-border)] bg-[var(--color-base)] p-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isCustomer = msg.role === "customer";
            return (
              <div key={msg.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isCustomer
                      ? "bg-[var(--color-accent)] text-white"
                      : msg.role === "system"
                      ? "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] italic"
                      : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                  }`}
                >
                  {!isCustomer && msg.role !== "system" && (
                    <p className="mb-0.5 text-[10px] font-medium opacity-60">
                      {msg.role === "ai" ? "AI Agent" : "Support Agent"}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className={`mt-1 text-[10px] ${isCustomer ? "text-white/60" : "opacity-40"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 rounded-b-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 outline-none focus:border-[var(--color-accent)] disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {error && (
        <div className="mt-2 rounded-md border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-2 text-xs text-[var(--color-error)]">
          {error}
        </div>
      )}
    </div>
  );
}
