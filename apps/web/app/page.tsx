export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Command Center
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          AI-native customer ops at a glance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Tickets" value="—" />
        <StatCard label="Auto-Resolved (24h)" value="—" />
        <StatCard label="Avg Response Time" value="—" />
        <StatCard label="CSAT Score" value="—" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PlaceholderCard title="Recent Tickets">
          No tickets yet. Connect a channel to get started.
        </PlaceholderCard>
        <PlaceholderCard title="Audit Log">
          No audit entries yet.
        </PlaceholderCard>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}

function PlaceholderCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
        {children}
      </p>
    </div>
  );
}
