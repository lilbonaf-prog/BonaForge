import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

import useOpportunityAnalysisList from "../features/opportunityAnalysis/useOpportunityAnalysisList";

const statusConfig = {
  draft: {
    label: "Draft",
    className:
      "border-slate-700 bg-slate-800/70 text-slate-300",
  },

  in_progress: {
    label: "In progress",
    className:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  },

  completed: {
    label: "Completed",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  },
};

const priorityConfig = {
  urgent: {
    label: "Urgent",
    className:
      "border-red-500/20 bg-red-500/10 text-red-300",
  },

  high: {
    label: "High",
    className:
      "border-orange-500/20 bg-orange-500/10 text-orange-300",
  },

  medium: {
    label: "Medium",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
  },

  low: {
    label: "Low",
    className:
      "border-slate-500/20 bg-slate-500/10 text-slate-300",
  },
};

const formatDate = (
  value
) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
};

const getHighestPriority = (
  opportunities = []
) => {
  const rank = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
  };

  let highest = null;

  opportunities.forEach(
    (opportunity) => {
      if (
        !opportunity
          ?.priority
      ) {
        return;
      }

      if (
        !highest ||
        rank[
          opportunity.priority
        ] >
          rank[highest]
      ) {
        highest =
          opportunity.priority;
      }
    }
  );

  return highest;
};

const OpportunityAnalysisPage =
  () => {
    const navigate =
      useNavigate();

    const [
      search,
      setSearch,
    ] = useState("");

    const [
      status,
      setStatus,
    ] = useState("all");

    const queryParams =
      useMemo(
        () => ({
          search:
            search.trim(),
          status,
          page: 1,
          limit: 50,
        }),
        [
          search,
          status,
        ]
      );

    const {
      data,
      isLoading,
      isFetching,
      isError,
      error,
      refetch,
    } =
      useOpportunityAnalysisList(
        queryParams
      );

    const analyses =
      data?.analyses || [];

    const stats =
      data?.stats || {
        total: 0,
        draft: 0,
        inProgress: 0,
        completed: 0,
      };

    const metrics = [
      {
        label:
          "Total analyses",
        value:
          stats.total || 0,
        icon: Lightbulb,
        description:
          "Businesses analyzed for opportunities",
      },

      {
        label:
          "In progress",
        value:
          stats.inProgress ||
          0,
        icon: RefreshCw,
        description:
          "Opportunities being qualified",
      },

      {
        label:
          "Completed",
        value:
          stats.completed ||
          0,
        icon: CheckCircle2,
        description:
          "Ready for sales action",
      },

      {
        label:
          "Draft",
        value:
          stats.draft || 0,
        icon: ListChecks,
        description:
          "Analysis records still in draft",
      },
    ];

    const handleOpenAnalysis =
      (analysis) => {
        const businessId =
          analysis
            ?.business
            ?._id;

        if (!businessId) {
          return;
        }

        navigate(
          `/opportunities/${businessId}`
        );
      };

    return (
      <div className="space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Sparkles
                  size={14}
                />

                Sales intelligence
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Opportunity
                Analysis
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                Turn business
                research and website
                audit findings into
                clear client needs,
                prioritized
                opportunities,
                service
                recommendations,
                and your next best
                sales action.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/businesses"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Find a business

              <ArrowRight
                size={16}
              />
            </button>
          </div>
        </section>

        {/* METRICS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(
            (metric) => {
              const Icon =
                metric.icon;

              return (
                <div
                  key={
                    metric.label
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-black/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-400">
                        {
                          metric.label
                        }
                      </p>

                      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                        {
                          metric.value
                        }
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
                      <Icon
                        size={20}
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    {
                      metric.description
                    }
                  </p>
                </div>
              );
            }
          )}
        </section>

        {/* FILTERS */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Search business, need, service, opportunity or sales angle..."
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10"
              />
            </div>

            <select
              value={status}
              onChange={(
                event
              ) =>
                setStatus(
                  event
                    .target
                    .value
                )
              }
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-cyan-500/40"
            >
              <option value="all">
                All statuses
              </option>

              <option value="in_progress">
                In progress
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="draft">
                Draft
              </option>
            </select>

            <button
              type="button"
              onClick={() =>
                refetch()
              }
              disabled={
                isFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  isFetching
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </section>

        {/* CONTENT */}
        <section>
          {isLoading ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-300" />

                <p className="mt-3 text-sm text-slate-400">
                  Loading
                  opportunity
                  analyses...
                </p>
              </div>
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />

                <div>
                  <h2 className="font-semibold text-red-200">
                    Could not load
                    opportunity
                    analyses
                  </h2>

                  <p className="mt-1 text-sm text-red-200/70">
                    {error
                      ?.response
                      ?.data
                      ?.message ||
                      error
                        ?.message ||
                      "Something went wrong."}
                  </p>
                </div>
              </div>
            </div>
          ) : analyses.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
                <Target
                  size={24}
                />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                No opportunity
                analyses found
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Open a Business
                record and start an
                Opportunity Analysis.
                BonaForge will combine
                available research and
                website audit findings
                to help you identify
                problems worth solving
                and services worth
                offering.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/businesses"
                  )
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Browse businesses

                <ArrowRight
                  size={16}
                />
              </button>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {analyses.map(
                (
                  analysis
                ) => {
                  const business =
                    analysis.business;

                  const config =
                    statusConfig[
                      analysis
                        .status
                    ] ||
                    statusConfig
                      .draft;

                  const opportunityCount =
                    analysis
                      .detectedOpportunities
                      ?.length ||
                    0;

                  const serviceCount =
                    analysis
                      .serviceRecommendations
                      ?.length ||
                    0;

                  const selectedServices =
                    analysis
                      .serviceRecommendations
                      ?.filter(
                        (
                          service
                        ) =>
                          service
                            .selectedForLead
                      )
                      ?.length ||
                    0;

                  const highestPriority =
                    getHighestPriority(
                      analysis
                        .detectedOpportunities
                    );

                  const priority =
                    highestPriority
                      ? priorityConfig[
                          highestPriority
                        ]
                      : null;

                  return (
                    <button
                      type="button"
                      key={
                        analysis._id
                      }
                      onClick={() =>
                        handleOpenAnalysis(
                          analysis
                        )
                      }
                      className="group rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-left shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-cyan-500/25 hover:bg-slate-950"
                    >
                      <div className="flex flex-col gap-5">
                        {/* CARD HEADER */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="truncate text-lg font-semibold text-white">
                                {business
                                  ?.name ||
                                  "Unknown business"}
                              </h2>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
                              >
                                {
                                  config.label
                                }
                              </span>

                              {priority && (
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${priority.className}`}
                                >
                                  {
                                    priority.label
                                  }{" "}
                                  priority
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {business
                                ?.industry ||
                                "Industry not set"}
                            </p>
                          </div>

                          <ArrowRight
                            size={18}
                            className="mt-1 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300"
                          />
                        </div>

                        {/* PRIMARY NEED */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex items-center gap-2">
                            <Target
                              size={15}
                              className="text-cyan-300"
                            />

                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Primary
                              need
                            </p>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                            {analysis
                              .primaryNeed ||
                              "Primary client need has not been defined yet."}
                          </p>
                        </div>

                        {/* COUNTS */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xl font-semibold text-white">
                              {
                                opportunityCount
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Opportunities
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xl font-semibold text-white">
                              {
                                serviceCount
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Services
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xl font-semibold text-cyan-300">
                              {
                                selectedServices
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Selected
                            </p>
                          </div>
                        </div>

                        {/* SALES ANGLE */}
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles
                              size={14}
                              className="text-violet-300"
                            />

                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                              Sales angle
                            </p>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                            {analysis
                              .salesAngle ||
                              "No sales angle has been defined yet."}
                          </p>
                        </div>

                        {/* NEXT ACTION */}
                        {analysis
                          .nextBestAction && (
                          <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.04] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300/70">
                              Next best
                              action
                            </p>

                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-cyan-100/80">
                              {
                                analysis
                                  .nextBestAction
                              }
                            </p>
                          </div>
                        )}

                        {/* FOOTER */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                          <div>
                            <p className="text-xs text-slate-600">
                              Lead-ready
                              services
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-300">
                              {selectedServices >
                              0
                                ? `${selectedServices} selected`
                                : "None selected"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-slate-600">
                              Updated
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              {formatDate(
                                analysis
                                  .updatedAt
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    );
  };

export default OpportunityAnalysisPage;