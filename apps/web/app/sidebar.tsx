"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/tickets", label: "Tickets" },
  { href: "/channels", label: "Channels" },
  { href: "/chat", label: "Live Chat" },
  { href: "/audit-log", label: "Audit Log" },
  { href: "/playground", label: "Playground" },
  { href: "/demo", label: "Demo" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [resetting, setResetting] = useState(false);

  const handleResetDemo = async () => {
    if (!confirm("Reset all demo data? This will undo all changes and restore the original 5 tickets.")) return;
    setResetting(true);
    try {
      const res = await fetch(`${API_URL}/demo/reset`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      window.location.href = "/";
    } catch (e) {
      alert("Reset failed — check that the API is running.");
      setResetting(false);
    }
  };

  return (
    <aside className="hidden w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] md:block">
      <Link href="/" className="flex h-16 items-center px-6">
        <span className="text-lg font-bold text-[var(--color-accent)]">
          ResolveOps
        </span>
      </Link>
      <nav className="flex flex-col justify-between px-4 py-2" style={{ height: "calc(100% - 4rem)" }}>
        <div>
          <p className="px-2 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
            Navigation
          </p>
          <ul className="mt-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-[var(--color-accent)]/10 font-medium text-[var(--color-accent)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="pb-4">
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="w-full rounded-md border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-500/20 disabled:opacity-50"
          >
            {resetting ? "Resetting…" : "Reset Demo"}
          </button>
        </div>
      </nav>
    </aside>
  );
}
