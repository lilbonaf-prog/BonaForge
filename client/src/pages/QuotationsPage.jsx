import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
  RefreshCcw,
  Search,
  Send,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import useQuotations from "../features/quotations/useQuotations";

const statusClasses = {
  draft:
    "border-white/10 bg-white/[0.04] text-white/55",

  sent:
    "border-sky-400/20 bg-sky-400/10 text-sky-200",

  accepted:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",

  rejected:
    "border-rose-400/20 bg-rose-400/10 text-rose-200",

  expired:
    "border-amber-400/20 bg-amber-400/10 text-amber-200",
};

const filters = [
  {
    value: "all",
    label: "All",
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

const formatCurrency = (
  amount,
  currency = "GHS"
) =>
  new Intl.NumberFormat(
    "en-GH",
    {
      style: "currency",
      currency:
        currency || "GHS",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(amount) || 0
  );

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

const MetricCard = ({
  label,
  value,
  icon: Icon,
}) => (
  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/30">
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

const InfoItem = ({
  label,
  value,
}) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
      {label}
    </p>

    <p className="mt-1 break-words text-sm font-medium text-white/65">
      {value}
    </p>
  </div>
);

const QuotationCard = ({
  quotation,
  onOpen,
}) => {
  const lead =
    quotation?.lead;

  const business =
    quotation?.business;

  const status =
    quotation?.status ||
    "draft";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() =>
        onOpen(
          quotation?._id
        )
      }
      onKeyDown={(
        event
      ) => {
        if (
          event.key ===
            "Enter" ||
          event.key ===
            " "
        ) {
          event.preventDefault();

          onOpen(
            quotation?._id
          );
        }
      }}
      className="group cursor-pointer rounded-[26px] border border-white/10 bg-white/[0.03] p-5 outline-none transition hover:border-indigo-400/20 hover:bg-white/[0.045] focus:border-indigo-400/30 focus:ring-2 focus:ring-indigo-400/10 md:p-6"
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
              {quotation
                ?.quotationNumber ||
                "Quotation"}
            </span>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-white">
            {quotation?.title ||
              "Untitled quotation"}
          </h2>

          <p className="mt-1 text-sm text-white/40">
            {lead?.name ||
              business?.name ||
              "Unknown client"}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoItem
              label="Total"
              value={formatCurrency(
                quotation?.total,
                quotation?.currency
              )}
            />

            <InfoItem
              label="Subtotal"
              value={formatCurrency(
                quotation?.subtotal,
                quotation?.currency
              )}
            />

            <InfoItem
              label="Created"
              value={formatDateTime(
                quotation?.createdAt
              )}
            />

            <InfoItem
              label="Updated"
              value={formatDateTime(
                quotation?.updatedAt
              )}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-white/35 transition group-hover:text-indigo-200">
          Open quotation

          <ChevronRight
            size={16}
          />
        </div>
      </div>
    </article>
  );
};

const QuotationsPage = () => {
  const navigate =
    useNavigate();

  const [
    status,
    setStatus,
  ] = useState("all");

  const [
    search,
    setSearch,
  ] = useState("");

  const queryParams =
    useMemo(
      () => ({
        status,
        search:
          search.trim(),
      }),
      [
        status,
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
  } = useQuotations(
    queryParams
  );

  const quotations =
    data?.quotations ||
    [];

  const stats =
    data?.stats || {};

  const handleOpenQuotation = (
    quotationId
  ) => {
    if (!quotationId) {
      return;
    }

    navigate(
      `/quotations/${quotationId}`
    );
  };

  return (
    <div className="space-y-7">
      <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-200/80">
              <WalletCards
                size={18}
              />

              <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                Commercial workflow
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Quotations
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              Prepare,
              review and
              track pricing
              documents from
              draft through
              client decision.
            </p>
          </div>

          {isFetching &&
          !isLoading ? (
            <div className="flex items-center gap-2 text-xs text-white/35">
              <RefreshCcw
                size={14}
                className="animate-spin"
              />

              Refreshing
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total"
          value={
            stats.total ?? 0
          }
          icon={FileText}
        />

        <MetricCard
          label="Draft"
          value={
            stats.draft ?? 0
          }
          icon={WalletCards}
        />

        <MetricCard
          label="Sent"
          value={
            stats.sent ?? 0
          }
          icon={Send}
        />

        <MetricCard
          label="Accepted"
          value={
            stats.accepted ?? 0
          }
          icon={
            CheckCircle2
          }
        />
      </section>

      <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map(
              (filter) => (
                <button
                  key={
                    filter.value
                  }
                  type="button"
                  onClick={() =>
                    setStatus(
                      filter.value
                    )
                  }
                  className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                    status ===
                    filter.value
                      ? "border-indigo-400/30 bg-indigo-400/15 text-indigo-100"
                      : "border-white/10 bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/70"
                  }`}
                >
                  {
                    filter.label
                  }
                </button>
              )
            )}
          </div>

          <div className="relative w-full xl:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
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
              placeholder="Search quotations..."
              className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-indigo-400/30 focus:ring-2 focus:ring-indigo-400/10"
            />
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-8 text-center">
          <RefreshCcw
            size={22}
            className="mx-auto animate-spin text-white/30"
          />

          <p className="mt-3 text-sm text-white/40">
            Loading
            quotations...
          </p>
        </section>
      ) : null}

      {isError ? (
        <section className="rounded-[26px] border border-rose-400/15 bg-rose-400/[0.05] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 text-rose-300"
            />

            <div>
              <p className="font-medium text-rose-100">
                Unable to
                load
                quotations
              </p>

              <p className="mt-1 text-sm text-rose-100/55">
                {error?.response
                  ?.data
                  ?.message ||
                  error?.message ||
                  "Please try again."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            Try again
          </button>
        </section>
      ) : null}

      {!isLoading &&
      !isError &&
      quotations.length ===
        0 ? (
        <section className="rounded-[26px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
          <WalletCards
            size={30}
            className="mx-auto text-white/20"
          />

          <h2 className="mt-4 text-base font-semibold text-white/70">
            No quotations
            found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/30">
            Quotations
            created from
            your Leads will
            appear here.
          </p>
        </section>
      ) : null}

      {!isLoading &&
      !isError &&
      quotations.length >
        0 ? (
        <section className="space-y-4">
          {quotations.map(
            (quotation) => (
              <QuotationCard
                key={
                  quotation._id
                }
                quotation={
                  quotation
                }
                onOpen={
                  handleOpenQuotation
                }
              />
            )
          )}
        </section>
      ) : null}
    </div>
  );
};

export default QuotationsPage;