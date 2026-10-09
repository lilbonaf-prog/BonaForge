import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Loader2,
  ReceiptText,
  Search,
  Send,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import useInvoices from "../features/invoices/useInvoices";

const statusClasses = {
  draft:
    "border-white/10 bg-white/[0.04] text-white/55",

  sent:
    "border-sky-400/20 bg-sky-400/10 text-sky-200",

  partially_paid:
    "border-amber-400/20 bg-amber-400/10 text-amber-200",

  paid:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",

  overdue:
    "border-rose-400/20 bg-rose-400/10 text-rose-200",

  cancelled:
    "border-white/10 bg-white/[0.03] text-white/35",
};

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  partially_paid:
    "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
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
    value:
      "partially_paid",
    label:
      "Partially paid",
  },
  {
    value: "paid",
    label: "Paid",
  },
  {
    value: "overdue",
    label: "Overdue",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const formatCurrency = (
  amount,
  currency = "GHS"
) => {
  try {
    return new Intl.NumberFormat(
      "en-GH",
      {
        style: "currency",
        currency:
          currency ||
          "GHS",
        maximumFractionDigits: 2,
      }
    ).format(
      Number(amount) ||
        0
    );
  } catch {
    return `${currency || "GHS"} ${(
      Number(amount) ||
      0
    ).toLocaleString()}`;
  }
};

const formatDate = (
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
      dateStyle:
        "medium",
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

        <p className="mt-2 text-2xl font-semibold text-white md:text-3xl">
          {value}
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45">
        <Icon
          size={18}
        />
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

const InvoiceCard = ({
  invoice,
  onOpen,
}) => {
  const status =
    invoice?.status ||
    "draft";

  const project =
    invoice?.project;

  const lead =
    invoice?.lead;

  const business =
    invoice?.business;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() =>
        onOpen(
          invoice?._id
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
            invoice?._id
          );
        }
      }}
      className="group cursor-pointer rounded-[26px] border border-white/10 bg-white/[0.03] p-5 outline-none transition hover:border-indigo-400/20 hover:bg-white/[0.045] focus:border-indigo-400/30 focus:ring-2 focus:ring-indigo-400/10 md:p-6"
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                statusClasses[
                  status
                ] ||
                statusClasses.draft
              }`}
            >
              {statusLabels[
                status
              ] || status}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/45">
              {invoice?.invoiceNumber ||
                "Invoice"}
            </span>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-white">
            {invoice?.title ||
              "Untitled invoice"}
          </h2>

          <p className="mt-1 text-sm text-white/40">
            {business?.name ||
              lead?.companyName ||
              lead?.name ||
              project?.name ||
              "Unknown client"}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <InfoItem
              label="Total"
              value={formatCurrency(
                invoice?.total,
                invoice?.currency
              )}
            />

            <InfoItem
              label="Paid"
              value={formatCurrency(
                invoice?.amountPaid,
                invoice?.currency
              )}
            />

            <InfoItem
              label="Balance"
              value={formatCurrency(
                invoice?.balanceDue,
                invoice?.currency
              )}
            />

            <InfoItem
              label="Issue date"
              value={formatDate(
                invoice?.issueDate
              )}
            />

            <InfoItem
              label="Due date"
              value={formatDate(
                invoice?.dueDate
              )}
            />
          </div>

          {project ? (
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.12em] text-white/20">
                Project
              </p>

              <p className="mt-1 text-xs font-medium text-white/45">
                {project.projectNumber
                  ? `${project.projectNumber} · `
                  : ""}
                {project.name}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-white/35 transition group-hover:text-indigo-200">
          Open invoice

          <ChevronRight
            size={16}
          />
        </div>
      </div>
    </article>
  );
};

const InvoicesPage = () => {
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
  } = useInvoices(
    queryParams
  );

  const invoices =
    data?.invoices || [];

  const stats =
    data?.stats || {};

  const openInvoice = (
    invoiceId
  ) => {
    if (!invoiceId) {
      return;
    }

    navigate(
      `/invoices/${invoiceId}`
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7">
      <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-200/80">
              <ReceiptText
                size={18}
              />

              <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                Billing workspace
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Invoices
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              Track client
              invoices,
              outstanding
              balances,
              payment status
              and due dates from
              one workspace.
            </p>
          </div>

          {isFetching &&
          !isLoading ? (
            <div className="flex items-center gap-2 text-xs text-white/35">
              <Loader2
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
          label="Total invoices"
          value={
            stats.total ??
            0
          }
          icon={FileText}
        />

        <MetricCard
          label="Total value"
          value={formatCurrency(
            stats.totalValue,
            "GHS"
          )}
          icon={
            CircleDollarSign
          }
        />

        <MetricCard
          label="Amount paid"
          value={formatCurrency(
            stats.amountPaid,
            "GHS"
          )}
          icon={
            CheckCircle2
          }
        />

        <MetricCard
          label="Balance due"
          value={formatCurrency(
            stats.balanceDue,
            "GHS"
          )}
          icon={Clock3}
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
              placeholder="Search invoices..."
              className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-indigo-400/30 focus:ring-2 focus:ring-indigo-400/10"
            />
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-8 text-center">
          <Loader2
            size={22}
            className="mx-auto animate-spin text-white/30"
          />

          <p className="mt-3 text-sm text-white/40">
            Loading invoices...
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
                Unable to load
                invoices
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
            className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            Try again
          </button>
        </section>
      ) : null}

      {!isLoading &&
      !isError &&
      invoices.length ===
        0 ? (
        <section className="rounded-[26px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
          <ReceiptText
            size={30}
            className="mx-auto text-white/20"
          />

          <h2 className="mt-4 text-base font-semibold text-white/70">
            No invoices found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/30">
            Invoices created
            from client
            projects will
            appear here.
          </p>
        </section>
      ) : null}

      {!isLoading &&
      !isError &&
      invoices.length >
        0 ? (
        <section className="space-y-4">
          {invoices.map(
            (invoice) => (
              <InvoiceCard
                key={
                  invoice._id
                }
                invoice={
                  invoice
                }
                onOpen={
                  openInvoice
                }
              />
            )
          )}
        </section>
      ) : null}

      {!isLoading &&
      !isError &&
      (stats.sent > 0 ||
        stats.partially_paid >
          0) ? (
        <div className="flex items-center gap-2 text-xs text-sky-200/50">
          <Send
            size={14}
          />

          Outstanding invoices
          are awaiting payment.
        </div>
      ) : null}
    </div>
  );
};

export default InvoicesPage;