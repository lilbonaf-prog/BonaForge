import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  FolderKanban,
  ReceiptText,
  ShieldCheck,
  Target,
  UsersRound,
  WalletCards,
} from "lucide-react";

const stats = [
  {
    label: "Businesses",
    value: "24",
    icon: Building2,
  },
  {
    label: "Qualified leads",
    value: "11",
    icon: UsersRound,
  },
  {
    label: "Active projects",
    value: "4",
    icon: FolderKanban,
  },
  {
    label: "Revenue",
    value: "GH₵86,500",
    icon: WalletCards,
  },
];

const pipeline = [
  {
    stage: "Research",
    count: 6,
  },
  {
    stage: "Contacted",
    count: 4,
  },
  {
    stage: "Proposal",
    count: 3,
  },
  {
    stage: "Negotiation",
    count: 2,
  },
  {
    stage: "Won",
    count: 5,
  },
];

const recentActivity = [
  {
    title: "Proposal accepted",
    detail:
      "Northstar Logistics accepted Website Revamp Proposal.",
    time: "Today",
  },
  {
    title: "Invoice paid",
    detail:
      "GH₵12,500 received from Asteria Consulting.",
    time: "Yesterday",
  },
  {
    title: "New opportunity",
    detail:
      "Website audit identified a high-value conversion opportunity.",
    time: "2 days ago",
  },
];

const modules = [
  {
    icon: BriefcaseBusiness,
    title: "Businesses",
    description:
      "Organize prospects and business intelligence.",
  },
  {
    icon: Target,
    title: "Opportunities",
    description:
      "Turn research findings into actionable sales opportunities.",
  },
  {
    icon: FileText,
    title: "Proposals",
    description:
      "Prepare structured commercial proposals.",
  },
  {
    icon: ReceiptText,
    title: "Invoices",
    description:
      "Track billing, balances and payment status.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "See conversion, revenue and pipeline performance.",
  },
];

function PublicDemoPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      {/* Demo notice */}

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
            <Eye size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Read-only demo workspace
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
              This showcase uses fictional sample data.
              Nothing on this page can edit or access the
              private BonaForge administrator workspace.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-black/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
          <ShieldCheck size={13} />
          Safe visitor mode
        </div>
      </div>

      {/* Header */}

      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-secondary)]">
          Demo workspace
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          See how BonaForge works.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
          Explore a sample client acquisition dashboard
          showing how businesses, leads, opportunities,
          proposals, projects, invoices and revenue stay
          connected.
        </p>
      </div>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(
          ({
            label,
            value,
            icon: Icon,
          }) => (
            <div
              key={label}
              className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-muted)]">
                  {label}
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <Icon
                    size={16}
                    className="text-[var(--brand-secondary)]"
                  />
                </div>
              </div>

              <p className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
                {value}
              </p>
            </div>
          )
        )}
      </div>

      {/* Main demo content */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Pipeline */}

        <section className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Sales pipeline
              </p>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Sample opportunity flow
              </p>
            </div>

            <Target
              size={18}
              className="text-[var(--brand-secondary)]"
            />
          </div>

          <div className="space-y-4">
            {pipeline.map(
              ({
                stage,
                count,
              }) => (
                <div
                  key={stage}
                  className="flex items-center gap-4"
                >
                  <div className="w-24 shrink-0 text-sm text-[var(--text-secondary)]">
                    {stage}
                  </div>

                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#826cff] to-[#5ca9ff]"
                      style={{
                        width: `${Math.min(
                          count * 14,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="w-8 text-right text-sm font-semibold text-white">
                    {count}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Activity */}

        <section className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold text-white">
              Recent activity
            </p>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Example workflow events
            </p>
          </div>

          <div className="space-y-4">
            {recentActivity.map(
              ({
                title,
                detail,
                time,
              }) => (
                <div
                  key={`${title}-${time}`}
                  className="flex gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.06] text-emerald-300">
                    <CheckCircle2
                      size={15}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">
                        {title}
                      </p>

                      <span className="text-[11px] text-[var(--text-muted)]">
                        {time}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                      {detail}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>

      {/* Modules */}

      <section className="mt-6 rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold text-white">
            Connected workspace
          </p>

          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Example modules available inside the private
            administrator system
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {modules.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <div
                key={title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <Icon
                    size={16}
                    className="text-[var(--brand-secondary)]"
                  />
                </div>

                <p className="text-sm font-semibold text-white">
                  {title}
                </p>

                <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                  {description}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Bottom notice */}

      <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl border border-[var(--border-primary)] bg-white/[0.02] p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-white">
            Want to see the private workflow?
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            Editing, client records and administrative
            controls remain protected behind administrator
            authentication.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
          Read-only preview
          <ArrowRight size={15} />
        </div>
      </div>
    </div>
  );
}

export default PublicDemoPage;