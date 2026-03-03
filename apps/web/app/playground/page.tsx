"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isStreaming) inputRef.current?.focus();
  }, [isStreaming]);

  const sendMessage = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || isStreaming) return;

    setError(null);
    setInput("");

    const userMsg: Message = { role: "user", content: prompt };
    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_URL}/llm/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const parsed = JSON.parse(raw);
            if (parsed.done) break;
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.chunk) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + parsed.chunk,
                  };
                }
                return updated;
              });
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        // User stopped the stream — keep partial content
      } else {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        // Remove the empty assistant message on error
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  }, [input, isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            LLM Playground
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Chat with the configured LLM provider
          </p>
        </div>
        <button
          onClick={clearConversation}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]"
        >
          Clear
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Send a message to start chatting
            </p>
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[var(--color-accent)] text-white"
                    : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                }`}
              >
                {msg.content}
                {msg.role === "assistant" && !msg.content && isStreaming && (
                  <span className="inline-block animate-pulse">▍</span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-auto max-w-3xl rounded-md border border-[var(--color-error)] bg-[var(--color-error)]/10 px-4 py-2 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <div className="mx-auto flex max-w-3xl gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none transition-colors focus:border-[var(--color-accent)] disabled:opacity-50"
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="rounded-lg bg-[var(--color-error)] px-5 py-3 text-sm font-medium text-white transition-colors hover:opacity-80"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
