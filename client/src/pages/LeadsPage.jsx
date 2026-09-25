import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CircleDollarSign,
  Filter,
  Plus,
  Search,
  Target,
  UserRound,
} from "lucide-react";

import AddLeadModal from "../features/leads/AddLeadModal";
import useCreateLead from "../features/leads/useCreateLead";
import useLeads from "../features/leads/useLeads";

const statusOptions = [
  {
    value: "all",
    label: "All stages",
  },
  {
    value: "new",
    label: "New",
  },
  {
    value: "contacted",
    label: "Contacted",
  },
  {
    value: "follow_up",
    label: "Follow-up",
  },
  {
    value: "qualified",
    label: "Qualified",
  },
  {
    value: "proposal",
    label: "Proposal",
  },
  {
    value: "negotiation",
    label: "Negotiation",
  },
  {
    value: "won",
    label: "Won",
  },
  {
    value: "lost",
    label: "Lost",
  },
];

const priorityOptions = [
  {
    value: "all",
    label: "All priorities",
  },
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
  {
    value: "urgent",
    label: "Urgent",
  },
];

const statusLabels = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const formatMoney = (
  value,
  currency = "GHS"
) => {
  const amount =
    Number(value) || 0;

  try {
    return new Intl.NumberFormat(
      "en-GH",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const LeadsPage = () => {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("all");

  const [
    priority,
    setPriority,
  ] = useState("all");

  const [
    isAddLeadOpen,
    setIsAddLeadOpen,
  ] = useState(false);

  const [
    createError,
    setCreateError,
  ] = useState("");

  const createLeadMutation =
    useCreateLead();

  const queryParams =
    useMemo(
      () => ({
        ...(search.trim()
          ? {
              search:
                search.trim(),
            }
          : {}),

        ...(status !== "all"
          ? {
              status,
            }
          : {}),

        ...(priority !== "all"
          ? {
              priority,
            }
          : {}),

        page: 1,
        limit: 50,
      }),
      [
        search,
        status,
        priority,
      ]
    );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLeads(
    queryParams
  );

  const leads =
    useMemo(
      () =>
        data?.leads || [],
      [data?.leads]
    );

  const metrics =
    useMemo(() => {
      const totalValue =
        leads.reduce(
          (
            total,
            lead
          ) =>
            total +
            (Number(
              lead.estimatedValue
            ) || 0),
          0
        );

      const qualified =
        leads.filter(
          (lead) =>
            lead.status ===
              "qualified" ||
            lead.status ===
              "proposal" ||
            lead.status ===
              "negotiation"
        ).length;

      const won =
        leads.filter(
          (lead) =>
            lead.status ===
            "won"
        ).length;

      return {
        total:
          data?.total ??
          leads.length,

        qualified,

        won,

        totalValue,
      };
    }, [
      data?.total,
      leads,
    ]);

  const hasFilters =
    Boolean(
      search.trim()
    ) ||
    status !== "all" ||
    priority !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
  };

  const openAddLead = () => {
    setCreateError("");
    setIsAddLeadOpen(true);
  };

  const closeAddLead = () => {
    if (
      createLeadMutation.isPending
    ) {
      return;
    }

    setCreateError("");
    setIsAddLeadOpen(false);
  };

  const handleCreateLead = (
    payload
  ) => {
    setCreateError("");

    createLeadMutation.mutate(
      payload,
      {
        onSuccess: () => {
          setCreateError("");
          setIsAddLeadOpen(
            false
          );
        },

        onError: (
          mutationError
        ) => {
          const message =
            mutationError
              ?.response
              ?.data
              ?.message ||
            mutationError
              ?.message ||
            "Unable to create lead.";

          setCreateError(
            message
          );
        },
      }
    );
  };

  return (
    <>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* HEADER */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/10 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_35%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/65">
                <Target
                  size={14}
                />

                Sales Pipeline
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Leads
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 md:text-base">
                Track prospects
                from first contact
                through qualification,
                proposals,
                negotiation and
                successful conversion.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {isFetching &&
              !isLoading ? (
                <span className="text-xs text-white/40">
                  Updating...
                </span>
              ) : null}

              <button
                type="button"
                onClick={
                  openAddLead
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                <Plus
                  size={17}
                />

                Add lead
              </button>
            </div>
          </div>
        </section>

        {/* METRICS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={
              UserRound
            }
            label="Total leads"
            value={
              metrics.total
            }
            helper="Prospects in your pipeline"
          />

          <MetricCard
            icon={
              Target
            }
            label="Qualified pipeline"
            value={
              metrics.qualified
            }
            helper="Qualified through negotiation"
          />

          <MetricCard
            icon={
              BriefcaseBusiness
            }
            label="Won leads"
            value={
              metrics.won
            }
            helper="Successfully converted clients"
          />

          <MetricCard
            icon={
              CircleDollarSign
            }
            label="Pipeline value"
            value={formatMoney(
              metrics.totalValue,
              "GHS"
            )}
            helper="Visible leads in current view"
          />
        </section>

        {/* FILTERS */}
        <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
              />

              <input
                type="search"
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search lead, company, email or phone..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-black/30"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
              />

              <select
                value={
                  status
                }
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target
                      .value
                  )
                }
                className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition focus:border-white/25"
              >
                {statusOptions.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                      className="bg-slate-950"
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <select
              value={
                priority
              }
              onChange={(
                event
              ) =>
                setPriority(
                  event.target
                    .value
                )
              }
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-white/25"
            >
              {priorityOptions.map(
                (
                  option
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                    className="bg-slate-950"
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>

            {hasFilters ? (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="h-12 rounded-2xl border border-white/10 px-5 text-sm font-medium text-white/65 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </section>

        {/* CONTENT */}
        <section>
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState
              message={
                error?.response
                  ?.data
                  ?.message ||
                error?.message ||
                "Unable to load leads."
              }
              onRetry={() =>
                refetch()
              }
            />
          ) : leads.length ===
            0 ? (
            <EmptyState
              filtered={
                hasFilters
              }
              onClear={
                clearFilters
              }
              onAddLead={
                openAddLead
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {leads.map(
                (lead) => (
                  <LeadCard
                    key={
                      lead._id
                    }
                    lead={
                      lead
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>

      <AddLeadModal
        isOpen={
          isAddLeadOpen
        }
        onClose={
          closeAddLead
        }
        onCreate={
          handleCreateLead
        }
        isPending={
          createLeadMutation.isPending
        }
        serverError={
          createError
        }
      />
    </>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
}) => {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">
            {label}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-white/40">
            {helper}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/60">
          <Icon
            size={18}
          />
        </div>
      </div>
    </div>
  );
};

const LeadCard = ({
  lead,
}) => {
  const company =
    lead.companyName ||
    lead.business?.name ||
    "Independent prospect";

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.045]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl transition group-hover:bg-indigo-500/10" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">
              {
                lead.name
              }
            </p>

            <p className="mt-1 truncate text-sm text-white/45">
              {company}
            </p>
          </div>

          <StatusBadge
            status={
              lead.status
            }
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <PriorityBadge
            priority={
              lead.priority
            }
          />

          {lead.source ===
          "business_conversion" ? (
            <span className="rounded-full border border-sky-400/15 bg-sky-400/[0.07] px-2.5 py-1 text-[11px] font-medium text-sky-200/80">
              From business
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/45">
              {
                lead.source ||
                "manual"
              }
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/30">
              Value
            </p>

            <p className="mt-1.5 text-sm font-semibold text-white/85">
              {formatMoney(
                lead.estimatedValue,
                lead.currency ||
                  "GHS"
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/30">
              Follow-ups
            </p>

            <p className="mt-1.5 text-sm font-semibold text-white/85">
              {
                lead.followUpCount ||
                0
              }
            </p>
          </div>
        </div>

        {lead.opportunitySummary ? (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/45">
            {
              lead.opportunitySummary
            }
          </p>
        ) : (
          <p className="mt-4 text-sm text-white/25">
            No opportunity
            summary added yet.
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
          <div className="min-w-0 text-xs text-white/35">
            {lead.email ? (
              <span className="block truncate">
                {
                  lead.email
                }
              </span>
            ) : lead.phone ? (
              <span>
                {
                  lead.phone
                }
              </span>
            ) : (
              <span>
                No contact
                details
              </span>
            )}
          </div>

          <Link
            to={`/leads/${lead._id}`}
            className="ml-4 inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/65 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            View lead

            <ArrowUpRight
              size={14}
            />
          </Link>
        </div>
      </div>
    </article>
  );
};

const StatusBadge = ({
  status,
}) => {
  const classes = {
    new:
      "border-sky-400/20 bg-sky-400/[0.08] text-sky-200",

    contacted:
      "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-200",

    follow_up:
      "border-amber-400/20 bg-amber-400/[0.08] text-amber-200",

    qualified:
      "border-violet-400/20 bg-violet-400/[0.08] text-violet-200",

    proposal:
      "border-indigo-400/20 bg-indigo-400/[0.08] text-indigo-200",

    negotiation:
      "border-orange-400/20 bg-orange-400/[0.08] text-orange-200",

    won:
      "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-200",

    lost:
      "border-rose-400/20 bg-rose-400/[0.08] text-rose-200",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        classes[
          status
        ] ||
        "border-white/10 bg-white/[0.04] text-white/50"
      }`}
    >
      {statusLabels[
        status
      ] || status}
    </span>
  );
};

const PriorityBadge = ({
  priority,
}) => {
  const classes = {
    low:
      "border-white/10 bg-white/[0.04] text-white/45",

    medium:
      "border-sky-400/15 bg-sky-400/[0.06] text-sky-200/75",

    high:
      "border-amber-400/15 bg-amber-400/[0.07] text-amber-200/80",

    urgent:
      "border-rose-400/20 bg-rose-400/[0.08] text-rose-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        classes[
          priority
        ] ||
        classes.medium
      }`}
    >
      {priorityLabels[
        priority
      ] || priority}{" "}
      priority
    </span>
  );
};

const LoadingState = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="h-[290px] animate-pulse rounded-[24px] border border-white/[0.07] bg-white/[0.025]"
        />
      ))}
    </div>
  );
};

const ErrorState = ({
  message,
  onRetry,
}) => {
  return (
    <div className="rounded-[24px] border border-rose-400/15 bg-rose-400/[0.04] p-8 text-center">
      <p className="text-base font-semibold text-white">
        Leads could not be
        loaded
      </p>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/45">
        {message}
      </p>

      <button
        type="button"
        onClick={
          onRetry
        }
        className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.09] hover:text-white"
      >
        Try again
      </button>
    </div>
  );
};

const EmptyState = ({
  filtered,
  onClear,
  onAddLead,
}) => {
  return (
    <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/50">
        <Target
          size={24}
        />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-white">
        {filtered
          ? "No leads match these filters"
          : "Your sales pipeline is ready"}
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/45">
        {filtered
          ? "Try changing your search, pipeline stage or priority."
          : "Leads you create manually or convert from saved businesses will appear here."}
      </p>

      {filtered ? (
        <button
          type="button"
          onClick={
            onClear
          }
          className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.09] hover:text-white"
        >
          Clear filters
        </button>
      ) : (
        <button
          type="button"
          onClick={
            onAddLead
          }
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          <Plus
            size={16}
          />

          Add your first lead
        </button>
      )}
    </div>
  );
};

export default LeadsPage;