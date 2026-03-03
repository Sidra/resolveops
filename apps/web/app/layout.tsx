import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./sidebar";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen">
          <Sidebar />

          {/* Main content */}
          <div className="flex flex-1 flex-col">
            <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
              <h1 className="text-sm font-medium text-[var(--color-text-secondary)]">
                ResolveOps
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
