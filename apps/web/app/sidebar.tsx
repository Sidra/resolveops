"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/tickets", label: "Tickets" },
  { href: "/audit-log", label: "Audit Log" },
  { href: "/playground", label: "Playground" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] md:block">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-bold text-[var(--color-accent)]">
          ResolveOps
        </span>
      </div>
      <nav className="px-4 py-2">
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

        <p className="mt-6 px-2 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
          System
        </p>
        <ul className="mt-2 space-y-1">
          <li className="rounded-md px-3 py-2 text-sm text-[var(--color-text-secondary)]">
            Settings
          </li>
        </ul>
      </nav>
    </aside>
  );
}
