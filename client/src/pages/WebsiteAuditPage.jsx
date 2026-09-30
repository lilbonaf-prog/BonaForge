import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Globe2,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";

import useWebsiteAuditList from "../features/websiteAudit/useWebsiteAuditList";

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

  not_applicable: {
    label: "No website",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
  },
};

const formatDate = (value) => {
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
  ).format(new Date(value));
};

const WebsiteAuditPage = () => {
  const navigate =
    useNavigate();

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

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
    useWebsiteAuditList(
      queryParams
    );

  const audits =
    data?.audits || [];

  const stats =
    data?.stats || {
      total: 0,
      draft: 0,
      inProgress: 0,
      completed: 0,
      notApplicable: 0,
    };

  const metrics = [
    {
      label:
        "Total audits",
      value:
        stats.total || 0,
      icon: ClipboardCheck,
      description:
        "Website audit records",
    },
    {
      label:
        "In progress",
      value:
        stats.inProgress ||
        0,
      icon: RefreshCw,
      description:
        "Currently being reviewed",
    },
    {
      label:
        "Completed",
      value:
        stats.completed || 0,
      icon: CheckCircle2,
      description:
        "Ready for sales action",
    },
    {
      label:
        "No website",
      value:
        stats.notApplicable ||
        0,
      icon: ShieldAlert,
      description:
        "Website opportunities",
    },
  ];

  const handleOpenAudit =
    (audit) => {
      const businessId =
        audit?.business?._id;

      if (!businessId) {
        return;
      }

      navigate(
        `/website-audits/${businessId}`
      );
    };

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Globe2
                size={14}
              />
              Digital intelligence
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Website Audit
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
              Review prospect
              websites, identify
              weaknesses, uncover
              sales opportunities,
              and turn technical
              findings into services
              you can offer.
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
                  event.target
                    .value
                )
              }
              placeholder="Search business, website, notes or services..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10"
            />
          </div>

          <select
            value={status}
            onChange={(
              event
            ) =>
              setStatus(
                event.target
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

            <option value="not_applicable">
              No website
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
                Loading website
                audits...
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
                  website audits
                </h2>

                <p className="mt-1 text-sm text-red-200/70">
                  {error
                    ?.response
                    ?.data
                    ?.message ||
                    error?.message ||
                    "Something went wrong."}
                </p>
              </div>
            </div>
          </div>
        ) : audits.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
              <Globe2
                size={24}
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              No website
              audits found
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Start from a
              Business record.
              BonaForge will audit
              businesses with
              websites and identify
              website-development
              opportunities for
              businesses without
              one.
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
            {audits.map(
              (audit) => {
                const business =
                  audit.business;

                const config =
                  statusConfig[
                    audit.status
                  ] ||
                  statusConfig.draft;

                const issueCount =
                  audit.issues
                    ?.length ||
                  0;

                const opportunityCount =
                  audit
                    .opportunities
                    ?.length ||
                  0;

                const serviceCount =
                  audit
                    .recommendedServices
                    ?.length ||
                  0;

                return (
                  <button
                    type="button"
                    key={
                      audit._id
                    }
                    onClick={() =>
                      handleOpenAudit(
                        audit
                      )
                    }
                    className="group rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-left shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-cyan-500/25 hover:bg-slate-950"
                  >
                    <div className="flex flex-col gap-5">
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

                      {audit.websiteAvailable &&
                      audit.websiteUrl ? (
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                            Website
                          </p>

                          <p className="mt-1 truncate text-sm text-cyan-300">
                            {
                              audit.websiteUrl
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.05] p-3">
                          <p className="text-sm font-medium text-amber-200">
                            No website
                            available
                          </p>

                          <p className="mt-1 text-xs leading-5 text-amber-200/60">
                            This can be
                            treated as a
                            website
                            development
                            opportunity.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="text-xl font-semibold text-white">
                            {
                              issueCount
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Issues
                          </p>
                        </div>

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
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                        <div>
                          <p className="text-xs text-slate-600">
                            Overall
                            score
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-300">
                            {audit.overallScore ===
                            null ||
                            audit.overallScore ===
                              undefined
                              ? "Not scored"
                              : `${audit.overallScore}/100`}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-600">
                            Updated
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {formatDate(
                              audit.updatedAt
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

export default WebsiteAuditPage;