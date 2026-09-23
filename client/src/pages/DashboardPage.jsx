import {
  motion,
} from "motion/react";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  FileText,
  FolderKanban,
  ReceiptText,
  Search,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";

import {
  useAuth,
} from "../features/auth/authContext";

import {
  useDashboardOverview,
} from "../features/dashboard/useDashboardOverview";

// ==============================
// WORKFLOW STEPS
// ==============================

const workflowSteps = [
  {
    number: "01",
    title: "Find businesses",
    description:
      "Discover businesses that may need your services.",
    icon: Search,
  },
  {
    number: "02",
    title: "Create leads",
    description:
      "Turn promising businesses into structured prospects.",
    icon: UsersRound,
  },
  {
    number: "03",
    title: "Research & audit",
    description:
      "Understand their digital presence and opportunities.",
    icon: Target,
  },
  {
    number: "04",
    title: "Convert clients",
    description:
      "Move from outreach to proposals, projects and payment.",
    icon: BriefcaseBusiness,
  },
];

// ==============================
// CURRENCY FORMATTER
// ==============================

const formatCurrency = (
  amount
) =>
  new Intl.NumberFormat(
    "en-GH",
    {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(
    Number(amount) || 0
  );

function DashboardPage() {
  const {
    user,
  } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboardOverview();

  // ==============================
  // USER
  // ==============================

  const firstName =
    user?.name
      ?.trim()
      .split(" ")[0] ||
    "there";

  // ==============================
  // DASHBOARD DATA
  // ==============================

  const overview =
    data?.overview || {
      businesses: 0,
      leads: 0,
      activeProjects: 0,
      proposals: 0,
      invoices: 0,
      revenue: 0,
    };

  const overviewCards = [
    {
      label: "Businesses",
      value:
        overview.businesses,
      icon: Building2,
      description:
        "Businesses discovered and saved",
    },
    {
      label: "Leads",
      value:
        overview.leads,
      icon: UsersRound,
      description:
        "Prospects currently in your pipeline",
    },
    {
      label: "Active projects",
      value:
        overview.activeProjects,
      icon: FolderKanban,
      description:
        "Client projects currently in progress",
    },
    {
      label: "Proposals",
      value:
        overview.proposals,
      icon: FileText,
      description:
        "Proposals created for prospects",
    },
    {
      label: "Invoices",
      value:
        overview.invoices,
      icon: ReceiptText,
      description:
        "Invoices generated for clients",
    },
    {
      label: "Revenue",
      value:
        formatCurrency(
          overview.revenue
        ),
      icon: CircleDollarSign,
      description:
        "Revenue recorded inside BonaForge",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
      {/* ============================== */}
      {/* PAGE HEADER */}
      {/* ============================== */}

      <motion.header
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
        className="flex flex-col gap-6 border-b border-[var(--border-primary)] pb-7 xl:flex-row xl:items-end xl:justify-between"
      >
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
            <Sparkles
              size={12}
            />

            Client acquisition workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl xl:text-[2.65rem]">
            Welcome back,{" "}
            {firstName}.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Your BonaForge command
            center for finding,
            converting and managing
            profitable client
            opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] px-4 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Workspace status
            </p>

            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.65)]" />

              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Ready
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ============================== */}
      {/* API STATUS */}
      {/* ============================== */}

      {isLoading && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] px-4 py-3 text-xs text-[var(--text-secondary)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--brand-secondary)]" />

          Loading workspace data...
        </div>
      )}

      {isError && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-red-200">
            {error?.response?.data
              ?.message ||
              "Unable to load dashboard data."}
          </p>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            disabled={
              isFetching
            }
            className="w-fit rounded-lg border border-red-400/15 bg-red-400/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching
              ? "Retrying..."
              : "Try again"}
          </button>
        </div>
      )}

      {/* ============================== */}
      {/* METRIC CARDS */}
      {/* ============================== */}

      <section className="mt-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">
              Workspace overview
            </p>

            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Live business activity
              will appear here as you
              build your pipeline.
            </p>
          </div>

          {isFetching &&
            !isLoading && (
              <span className="text-[10px] text-[var(--text-muted)]">
                Refreshing...
              </span>
            )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {overviewCards.map(
            (
              card,
              index
            ) => {
              const Icon =
                card.icon;

              return (
                <motion.article
                  key={
                    card.label
                  }
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.3,
                    delay:
                      index *
                      0.04,
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 transition duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
                >
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[var(--brand-primary)]/[0.04] blur-2xl transition group-hover:bg-[var(--brand-primary)]/[0.08]" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-white/[0.035] text-[var(--text-secondary)] transition group-hover:border-[var(--brand-primary)]/20 group-hover:bg-[var(--brand-primary)]/10 group-hover:text-[var(--brand-secondary)]">
                        <Icon
                          size={17}
                        />
                      </div>

                      <ArrowUpRight
                        size={14}
                        className="text-[var(--text-muted)] opacity-40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white group-hover:opacity-100"
                      />
                    </div>

                    <p className="mt-6 text-[11px] font-medium text-[var(--text-muted)]">
                      {
                        card.label
                      }
                    </p>

                    <p className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-white">
                      {
                        card.value
                      }
                    </p>

                    <p className="mt-3 text-[10px] leading-4 text-[var(--text-muted)]">
                      {
                        card.description
                      }
                    </p>
                  </div>
                </motion.article>
              );
            }
          )}
        </div>
      </section>

      {/* ============================== */}
      {/* MAIN DASHBOARD GRID */}
      {/* ============================== */}

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* ============================== */}
        {/* PIPELINE */}
        {/* ============================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Target
                  size={16}
                  className="text-[var(--brand-secondary)]"
                />

                <h2 className="text-sm font-semibold text-white">
                  Client pipeline
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                Track prospects from
                discovery to paying
                client.
              </p>
            </div>

            <span className="w-fit rounded-lg border border-[var(--border-primary)] bg-white/[0.025] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {overview.leads > 0
                ? `${overview.leads} lead${
                    overview.leads === 1
                      ? ""
                      : "s"
                  }`
                : "No leads yet"}
            </span>
          </div>

          <div className="mt-6 flex min-h-[315px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-primary)] bg-black/[0.08] px-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--brand-primary)]/20 blur-2xl" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/10 text-[var(--brand-secondary)]">
                <UsersRound
                  size={22}
                />
              </div>
            </div>

            <h3 className="mt-5 text-sm font-semibold text-white">
              {overview.leads > 0
                ? "Your client pipeline"
                : "Your pipeline is ready"}
            </h3>

            <p className="mt-2 max-w-sm text-xs leading-5 text-[var(--text-muted)]">
              {overview.leads > 0
                ? "Detailed lead stages and pipeline movement will appear here as the Leads module is completed."
                : "When you begin adding businesses and converting them into leads, their progress will appear here automatically."}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--border-primary)] bg-white/[0.025] px-3 py-2 text-[10px] text-[var(--text-muted)]">
              <Sparkles
                size={12}
                className="text-[var(--brand-accent)]"
              />

              Business discovery is the
              next BonaForge module
            </div>
          </div>
        </motion.div>

        {/* ============================== */}
        {/* REVENUE CARD */}
        {/* ============================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="relative overflow-hidden rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 sm:p-6"
        >
          <div className="absolute right-[-5rem] top-[-5rem] h-52 w-52 rounded-full bg-[var(--brand-accent)]/[0.05] blur-[70px]" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300">
                <CircleDollarSign
                  size={18}
                />
              </div>

              <span className="rounded-lg border border-[var(--border-primary)] bg-white/[0.025] px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Revenue
              </span>
            </div>

            <p className="mt-7 text-xs text-[var(--text-muted)]">
              Total recorded revenue
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              {formatCurrency(
                overview.revenue
              )}
            </p>

            <div className="mt-6 border-t border-[var(--border-primary)] pt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">
                  Invoices created
                </span>

                <span className="font-medium text-white">
                  {
                    overview.invoices
                  }
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">
                  Active projects
                </span>

                <span className="font-medium text-white">
                  {
                    overview.activeProjects
                  }
                </span>
              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className={`h-full rounded-full bg-[var(--brand-accent)] transition-all duration-500 ${
                    overview.revenue > 0
                      ? "w-full"
                      : "w-0"
                  }`}
                />
              </div>

              <p className="mt-3 text-[10px] leading-4 text-[var(--text-muted)]">
                Revenue insights will
                become richer as
                invoices, payments and
                financial modules are
                added.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================== */}
      {/* LOWER GRID */}
      {/* ============================== */}

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* ============================== */}
        {/* WORKFLOW */}
        {/* ============================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 sm:p-6"
        >
          <div>
            <p className="text-sm font-semibold text-white">
              BonaForge workflow
            </p>

            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              Your client acquisition
              operating system from
              discovery to revenue.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {workflowSteps.map(
              (step) => {
                const Icon =
                  step.icon;

                return (
                  <div
                    key={
                      step.number
                    }
                    className="group rounded-2xl border border-[var(--border-primary)] bg-white/[0.018] p-4 transition hover:bg-white/[0.035]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-white/[0.03] text-[var(--text-muted)] transition group-hover:border-[var(--brand-primary)]/20 group-hover:text-[var(--brand-secondary)]">
                        <Icon
                          size={15}
                        />
                      </div>

                      <span className="text-[9px] font-semibold tracking-[0.14em] text-[var(--text-muted)]">
                        {
                          step.number
                        }
                      </span>
                    </div>

                    <p className="mt-4 text-xs font-semibold text-white">
                      {
                        step.title
                      }
                    </p>

                    <p className="mt-1.5 text-[10px] leading-4 text-[var(--text-muted)]">
                      {
                        step.description
                      }
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </motion.div>

        {/* ============================== */}
        {/* RECENT ACTIVITY */}
        {/* ============================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Recent activity
              </p>

              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Latest changes across
                your workspace.
              </p>
            </div>

            <span className="rounded-lg border border-[var(--border-primary)] bg-white/[0.025] px-2 py-1 text-[9px] text-[var(--text-muted)]">
              0 events
            </span>
          </div>

          <div className="mt-6 flex min-h-[205px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-primary)] bg-black/[0.06] px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-white/[0.025] text-[var(--text-muted)]">
              <Sparkles
                size={17}
              />
            </div>

            <p className="mt-4 text-xs font-semibold text-white">
              Nothing here yet
            </p>

            <p className="mt-2 max-w-xs text-[10px] leading-4 text-[var(--text-muted)]">
              Business research,
              lead updates, proposals,
              projects and payments
              will create activity
              automatically.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ============================== */}
      {/* BOTTOM STATUS */}
      {/* ============================== */}

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--border-primary)] bg-white/[0.018] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-primary)]/[0.07] text-[var(--brand-secondary)]">
            <Sparkles
              size={15}
            />
          </div>

          <div>
            <p className="text-xs font-medium text-white">
              BonaForge workspace
              initialized
            </p>

            <p className="mt-1 text-[10px] text-[var(--text-muted)]">
              Your client acquisition
              system is ready for its
              first business.
            </p>
          </div>
        </div>

        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Project · Knowledge · Results
        </span>
      </div>
    </div>
  );
}

export default DashboardPage;