import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDot,
  Clock3,
  FlaskConical,
  Globe2,
  Mail,
  Phone,
  RefreshCw,
  Search,
} from "lucide-react";

import useResearchList from "../features/research/useResearchList";

// ==============================
// HELPERS
// ==============================

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
    }
  ).format(date);
};

const getStatusConfig = (status) => {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        className:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        icon: CheckCircle2,
      };

    case "in_progress":
      return {
        label: "In progress",
        className:
          "border-sky-400/20 bg-sky-400/10 text-sky-300",
        icon: Clock3,
      };

    case "draft":
      return {
        label: "Draft",
        className:
          "border-amber-400/20 bg-amber-400/10 text-amber-300",
        icon: CircleDot,
      };

    default:
      return {
        label: "Unknown",
        className:
          "border-white/10 bg-white/5 text-slate-300",
        icon: CircleDot,
      };
  }
};

// ==============================
// PAGE
// ==============================

const ResearchPage = () => {
  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const params = useMemo(
    () => ({
      search:
        search.trim() || undefined,

      status:
        status === "all"
          ? undefined
          : status,

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
  } = useResearchList(params);

  const research =
    data?.research || [];

  const stats =
    data?.stats || {
      total: 0,
      draft: 0,
      inProgress: 0,
      completed: 0,
    };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
  };

  return (
    <div className="space-y-7 pb-10">
      {/* =========================
          HERO
      ========================== */}

      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
              <FlaskConical
                size={14}
              />

              Intelligence workspace
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Business Research
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Understand each prospect before
              making contact. Capture positioning,
              digital presence, opportunities,
              competitors and the best sales
              approach in one workspace.
            </p>
          </div>

          <Link
            to="/businesses"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-400"
          >
            <Building2
              size={17}
            />

            Find a business
          </Link>
        </div>
      </section>

      {/* =========================
          METRICS
      ========================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total research"
          value={stats.total}
          helper="All research records"
          icon={FlaskConical}
        />

        <MetricCard
          label="In progress"
          value={stats.inProgress}
          helper="Actively being researched"
          icon={Clock3}
        />

        <MetricCard
          label="Completed"
          value={stats.completed}
          helper="Ready for sales action"
          icon={CheckCircle2}
        />

        <MetricCard
          label="Draft"
          value={stats.draft}
          helper="Not yet active"
          icon={CircleDot}
        />
      </section>

      {/* =========================
          FILTERS
      ========================== */}

      <section className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search business, industry, findings or research notes..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/40"
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
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* =========================
          CONTENT
      ========================== */}

      {isLoading ? (
        <ResearchLoadingState />
      ) : isError ? (
        <ResearchErrorState
          message={
            error?.response?.data
              ?.message ||
            "Unable to load research records."
          }
          onRetry={() =>
            refetch()
          }
        />
      ) : research.length === 0 ? (
        <ResearchEmptyState
          hasFilters={
            Boolean(
              search.trim()
            ) ||
            status !== "all"
          }
          onClearFilters={
            clearFilters
          }
        />
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {research.map(
            (item) => (
              <ResearchCard
                key={item._id}
                research={
                  item
                }
              />
            )
          )}
        </section>
      )}
    </div>
  );
};

// ==============================
// METRIC CARD
// ==============================

const MetricCard = ({
  label,
  value,
  helper,
  icon: Icon,
}) => {
  return (
    <article className="group rounded-[22px] border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl transition hover:border-violet-400/20 hover:bg-slate-950/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-violet-300 transition group-hover:border-violet-400/20 group-hover:bg-violet-400/10">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {helper}
      </p>
    </article>
  );
};

// ==============================
// RESEARCH CARD
// ==============================

const ResearchCard = ({
  research,
}) => {
  const business =
    research.business;

  const statusConfig =
    getStatusConfig(
      research.status
    );

  const StatusIcon =
    statusConfig.icon;

  const findingsCount =
    research.keyFindings
      ?.length || 0;

  const opportunityCount =
    research.opportunities
      ?.length || 0;

  const serviceCount =
    research.productsServices
      ?.length || 0;

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/65 p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-400/25 hover:shadow-violet-950/10 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/[0.06] blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Building2
                size={17}
                className="shrink-0 text-violet-300"
              />

              <h2 className="truncate text-lg font-semibold text-white">
                {business?.name ||
                  "Unknown business"}
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {business?.industry ||
                "Industry not specified"}
            </p>
          </div>

          <span
            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
          >
            <StatusIcon
              size={13}
            />

            {statusConfig.label}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniStat
            label="Services"
            value={serviceCount}
          />

          <MiniStat
            label="Findings"
            value={findingsCount}
          />

          <MiniStat
            label="Opportunities"
            value={
              opportunityCount
            }
          />
        </div>

        {research.companyOverview ? (
          <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400">
            {
              research.companyOverview
            }
          </p>
        ) : (
          <p className="mt-5 text-sm italic text-slate-600">
            No company overview
            has been added yet.
          </p>
        )}

        <div className="mt-5 space-y-2">
          {business?.website ? (
            <ContactRow
              icon={Globe2}
              text={
                business.website
              }
            />
          ) : null}

          {business?.email ? (
            <ContactRow
              icon={Mail}
              text={
                business.email
              }
            />
          ) : null}

          {business?.phone ? (
            <ContactRow
              icon={Phone}
              text={
                business.phone
              }
            />
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Updated{" "}
            <span className="text-slate-400">
              {formatDate(
                research.updatedAt
              )}
            </span>
          </div>

          <Link
            to={`/research/${business?._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-400/30 hover:bg-violet-400/15"
          >
            Open research

            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
};

// ==============================
// MINI STAT
// ==============================

const MiniStat = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3">
      <p className="text-lg font-semibold text-white">
        {value}
      </p>

      <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>
    </div>
  );
};

// ==============================
// CONTACT ROW
// ==============================

const ContactRow = ({
  icon: Icon,
  text,
}) => {
  return (
    <div className="flex min-w-0 items-center gap-2.5 text-xs text-slate-500">
      <Icon
        size={14}
        className="shrink-0 text-slate-600"
      />

      <span className="truncate">
        {text}
      </span>
    </div>
  );
};

// ==============================
// LOADING
// ==============================

const ResearchLoadingState = () => {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-[24px] border border-white/10 bg-slate-950/60"
          />
        )
      )}
    </section>
  );
};

// ==============================
// ERROR
// ==============================

const ResearchErrorState = ({
  message,
  onRetry,
}) => {
  return (
    <section className="rounded-[24px] border border-rose-400/20 bg-rose-400/[0.06] p-8 text-center">
      <p className="text-sm font-semibold text-rose-300">
        Research could not be
        loaded
      </p>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-400/15"
      >
        <RefreshCw
          size={15}
        />

        Try again
      </button>
    </section>
  );
};

// ==============================
// EMPTY
// ==============================

const ResearchEmptyState = ({
  hasFilters,
  onClearFilters,
}) => {
  return (
    <section className="rounded-[26px] border border-dashed border-white/10 bg-slate-950/40 px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
        <FlaskConical
          size={24}
        />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-white">
        {hasFilters
          ? "No matching research"
          : "No research yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing your search or status filter."
          : "Open a Business and start Research to build intelligence before contacting the prospect."}
      </p>

      {hasFilters ? (
        <button
          type="button"
          onClick={
            onClearFilters
          }
          className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07]"
        >
          Clear filters
        </button>
      ) : (
        <Link
          to="/businesses"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
        >
          Browse businesses

          <ArrowRight
            size={15}
          />
        </Link>
      )}
    </section>
  );
};

export default ResearchPage;