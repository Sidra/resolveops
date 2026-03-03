import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResolveOps",
  description: "AI-native customer ops platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar placeholder */}
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
                <li>
                  <Link href="/" className="block rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)]">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/playground" className="block rounded-md px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]">
                    Playground
                  </Link>
                </li>
                <li className="rounded-md px-3 py-2 text-sm text-[var(--color-text-secondary)]">
                  Tickets
                </li>
                <li>
                  <Link href="/audit-log" className="block rounded-md px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]">
                    Audit Log
                  </Link>
                </li>
                <li className="rounded-md px-3 py-2 text-sm text-[var(--color-text-secondary)]">
                  Settings
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <div className="flex flex-1 flex-col">
            {/* Top nav placeholder */}
            <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
              <h1 className="text-sm font-medium text-[var(--color-text-secondary)]">
                Dashboard
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  v0.1.0
                </span>
              </div>
            </header>

            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
