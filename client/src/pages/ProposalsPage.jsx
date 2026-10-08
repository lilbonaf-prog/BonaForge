import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileClock,
  FileText,
  RefreshCcw,
  Search,
  Send,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import useProposals from "../features/proposals/useProposals";

const statusOptions = [
  {
    value: "all",
    label: "All proposals",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "sent",
    label: "Sent",
  },
  {
    value: "accepted",
    label: "Accepted",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "expired",
    label: "Expired",
  },
];

const statusClasses = {
  draft:
    "border-white/10 bg-white/[0.04] text-white/55",

  sent:
    "border-sky-400/15 bg-sky-400/[0.06] text-sky-200",

  accepted:
    "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-200",

  rejected:
    "border-rose-400/15 bg-rose-400/[0.06] text-rose-200",

  expired:
    "border-amber-400/15 bg-amber-400/[0.06] text-amber-200",
};

const formatDateTime = (
  value
) => {
  if (!value) {
    return "Not set";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not set";
  }

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const formatCurrency = (
  amount,
  currency = "GHS"
) => {
  const numericAmount =
    Number(amount);

  if (
    !Number.isFinite(
      numericAmount
    )
  ) {
    return `${currency} 0`;
  }

  try {
    return new Intl.NumberFormat(
      "en-GH",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(
      numericAmount
    );
  } catch {
    return `${currency} ${numericAmount.toLocaleString(
      "en-GH"
    )}`;
  }
};

const ProposalsPage = () => {
  const navigate =
    useNavigate();

  const [
    activeStatus,
    setActiveStatus,
  ] = useState("all");

  const [
    search,
    setSearch,
  ] = useState("");

  const queryParams =
    useMemo(
      () => ({
        status:
          activeStatus,

        search:
          search.trim(),

        page: 1,

        limit: 100,
      }),
      [
        activeStatus,
        search,
      ]
    );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProposals(
    queryParams
  );

  const proposals =
    useMemo(
      () =>
        data?.proposals ||
        [],
      [
        data?.proposals,
      ]
    );

  const stats = {
    total:
      data?.stats?.total ??
      0,

    draft:
      data?.stats?.draft ??
      0,

    sent:
      data?.stats?.sent ??
      0,

    accepted:
      data?.stats?.accepted ??
      0,
  };

  const handleOpenProposal = (
    proposalId
  ) => {
    if (!proposalId) {
      return;
    }

    navigate(
      `/proposals/${proposalId}`
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      {/* HERO */}

      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_32%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-indigo-200/60">
              <FileText
                size={14}
              />

              Sales proposals
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Proposal workspace
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              Manage client
              proposals from initial
              draft through sending,
              acceptance, rejection
              and expiration.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            <RefreshCcw
              size={15}
            />

            {isFetching
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </section>

      {/* METRICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total"
          value={
            stats.total
          }
          icon={FileText}
        />

        <MetricCard
          label="Draft"
          value={
            stats.draft
          }
          icon={FileClock}
        />

        <MetricCard
          label="Sent"
          value={
            stats.sent
          }
          icon={Send}
        />

        <MetricCard
          label="Accepted"
          value={
            stats.accepted
          }
          icon={CheckCircle2}
        />
      </div>

      {/* SEARCH + FILTERS */}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
            />

            <input
              type="search"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search proposal number, title, summary or notes..."
              className="h-11 w-full rounded-xl border border-white/10 bg-black/10 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400/30 focus:bg-white/[0.025]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map(
              (option) => {
                const isActive =
                  activeStatus ===
                  option.value;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    onClick={() =>
                      setActiveStatus(
                        option.value
                      )
                    }
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "border-indigo-400/20 bg-indigo-500/15 text-indigo-100"
                        : "border-white/10 bg-white/[0.025] text-white/45 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {
                      option.label
                    }
                  </button>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={
            error?.response?.data
              ?.message ||
            error?.message ||
            "Unable to load proposals."
          }
          onRetry={() =>
            refetch()
          }
        />
      ) : proposals.length ===
        0 ? (
        <EmptyState
          activeStatus={
            activeStatus
          }
          hasSearch={Boolean(
            search.trim()
          )}
        />
      ) : (
        <div className="space-y-4">
          {proposals.map(
            (proposal) => (
              <ProposalCard
                key={
                  proposal._id
                }
                proposal={
                  proposal
                }
                onOpen={
                  handleOpenProposal
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  icon: Icon,
}) => (
  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/30">
          {label}
        </p>

        <p className="mt-2 text-3xl font-semibold text-white">
          {value}
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const ProposalCard = ({
  proposal,
  onOpen,
}) => {
  const lead =
    proposal.lead;

  const business =
    proposal.business;

  const currency =
    proposal
      ?.pricingOverview
      ?.currency ||
    "GHS";

  const estimatedAmount =
    proposal
      ?.pricingOverview
      ?.estimatedAmount ??
    0;

  const status =
    proposal.status ||
    "draft";

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      onOpen(
        proposal._id
      );
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() =>
        onOpen(
          proposal._id
        )
      }
      onKeyDown={
        handleKeyDown
      }
      className="group cursor-pointer rounded-[26px] border border-white/10 bg-white/[0.03] p-5 outline-none transition hover:border-indigo-400/20 hover:bg-white/[0.05] focus-visible:border-indigo-400/30 focus-visible:ring-2 focus-visible:ring-indigo-500/20 md:p-6"
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                statusClasses[
                  status
                ] ||
                statusClasses.draft
              }`}
            >
              {status}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/45">
              {
                proposal.proposalNumber ||
                "Proposal"
              }
            </span>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-white transition group-hover:text-indigo-100">
            {proposal.title ||
              "Untitled proposal"}
          </h2>

          <p className="mt-1 text-sm text-white/40">
            {lead?.name ||
              business?.name ||
              "Unknown client"}
          </p>

          {proposal.summary ? (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/45">
              {
                proposal.summary
              }
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoItem
              label="Estimated value"
              value={formatCurrency(
                estimatedAmount,
                currency
              )}
            />

            <InfoItem
              label="Lead status"
              value={
                lead?.status ||
                "Not set"
              }
            />

            <InfoItem
              label="Created"
              value={formatDateTime(
                proposal.createdAt
              )}
            />

            <InfoItem
              label="Updated"
              value={formatDateTime(
                proposal.updatedAt
              )}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3">
          <div className="rounded-2xl border border-white/[0.07] bg-black/10 px-4 py-3">
            <div className="flex items-center gap-2 text-white/35">
              <FileCheck2
                size={15}
              />

              <span className="text-[10px] font-medium uppercase tracking-[0.13em]">
                Scope items
              </span>
            </div>

            <p className="mt-2 text-2xl font-semibold text-white">
              {Array.isArray(
                proposal.scopeOfWork
              )
                ? proposal
                    .scopeOfWork
                    .length
                : 0}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 px-1 text-xs font-medium text-white/30 transition group-hover:text-indigo-200/70">
            Open proposal

            <ChevronRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>
    </article>
  );
};

const InfoItem = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-white/[0.07] bg-black/10 px-4 py-3">
    <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
      {label}
    </p>

    <p className="mt-1.5 break-words text-sm font-medium capitalize text-white/60">
      {value}
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(
      (item) => (
        <div
          key={item}
          className="h-52 animate-pulse rounded-[26px] border border-white/[0.07] bg-white/[0.025]"
        />
      )
    )}
  </div>
);

const ErrorState = ({
  message,
  onRetry,
}) => (
  <div className="rounded-[26px] border border-rose-400/15 bg-rose-400/[0.04] p-8 text-center">
    <AlertCircle
      size={24}
      className="mx-auto text-rose-200/60"
    />

    <h2 className="mt-4 text-lg font-semibold text-white">
      Proposals could not
      be loaded
    </h2>

    <p className="mx-auto mt-2 max-w-xl text-sm text-white/45">
      {message}
    </p>

    <button
      type="button"
      onClick={onRetry}
      className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.09] hover:text-white"
    >
      Try again
    </button>
  </div>
);

const EmptyState = ({
  activeStatus,
  hasSearch,
}) => (
  <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
    <FileText
      size={25}
      className="mx-auto text-white/25"
    />

    <h2 className="mt-4 text-base font-semibold text-white">
      No proposals found
    </h2>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
      {hasSearch
        ? "No proposals match your current search."
        : activeStatus ===
            "all"
          ? "No proposals have been created yet. Proposals created from qualified leads will appear here."
          : `There are currently no ${activeStatus} proposals.`}
    </p>
  </div>
);

export default ProposalsPage;