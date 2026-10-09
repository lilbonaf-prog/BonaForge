import {
  useMemo,
  useState,
} from "react";

import {
  ArrowDownToLine,
  Banknote,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  ReceiptText,
  RotateCcw,
  Search,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import usePayments from "../features/payments/usePayments";

const statusClasses = {
  completed:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",

  reversed:
    "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

const statusLabels = {
  completed:
    "Completed",

  reversed:
    "Reversed",
};

const methodLabels = {
  bank_transfer:
    "Bank transfer",

  cash:
    "Cash",

  mobile_money:
    "Mobile money",

  card:
    "Card",

  cheque:
    "Cheque",

  other:
    "Other",
};

const statusFilters = [
  {
    value: "all",
    label: "All",
  },
  {
    value:
      "completed",
    label:
      "Completed",
  },
  {
    value:
      "reversed",
    label:
      "Reversed",
  },
];

const methodFilters = [
  {
    value: "all",
    label:
      "All methods",
  },
  {
    value:
      "bank_transfer",
    label:
      "Bank transfer",
  },
  {
    value: "cash",
    label: "Cash",
  },
  {
    value:
      "mobile_money",
    label:
      "Mobile money",
  },
  {
    value: "card",
    label: "Card",
  },
  {
    value:
      "cheque",
    label: "Cheque",
  },
  {
    value: "other",
    label: "Other",
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
        style:
          "currency",

        currency:
          currency ||
          "GHS",

        maximumFractionDigits:
          2,
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

      timeStyle:
        "short",
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">
          {label}
        </p>

        <p className="mt-2 text-2xl font-semibold text-white md:text-3xl">
          {value}
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/40">
        <Icon
          size={18}
        />
      </div>
    </div>
  </div>
);

const PaymentsPage = () => {
  const navigate =
    useNavigate();

  const [
    status,
    setStatus,
  ] = useState("all");

  const [
    method,
    setMethod,
  ] = useState("all");

  const [
    search,
    setSearch,
  ] = useState("");

  const queryParams =
    useMemo(
      () => ({
        status,

        method,

        search:
          search.trim(),
      }),
      [
        status,
        method,
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
  } = usePayments(
    queryParams
  );

  const payments =
    data?.payments || [];

  const stats =
    data?.stats || {};

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7">
      <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-200/80">
              <WalletCards
                size={18}
              />

              <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                Revenue
                workspace
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Payments
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              Track money
              received from
              client invoices,
              payment methods,
              references and
              reversals from one
              workspace.
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
          label="Payments"
          value={
            stats.total ?? 0
          }
          icon={
            ReceiptText
          }
        />

        <MetricCard
          label="Total received"
          value={formatCurrency(
            stats.totalReceived,
            "GHS"
          )}
          icon={
            CircleDollarSign
          }
        />

        <MetricCard
          label="Completed"
          value={
            stats.completed ??
            0
          }
          icon={
            CheckCircle2
          }
        />

        <MetricCard
          label="Reversed"
          value={
            stats.reversed ??
            0
          }
          icon={RotateCcw}
        />
      </section>

      <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map(
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

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <select
              value={method}
              onChange={(
                event
              ) =>
                setMethod(
                  event.target
                    .value
                )
              }
              className="rounded-xl border border-white/10 bg-[#0b0f16] px-4 py-3 text-sm text-white/60 outline-none focus:border-indigo-400/30"
            >
              {methodFilters.map(
                (item) => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                )
              )}
            </select>

            <div className="relative w-full sm:min-w-[260px]">
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
                placeholder="Search payments..."
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-indigo-400/30 focus:ring-2 focus:ring-indigo-400/10"
              />
            </div>
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
            Loading payments...
          </p>
        </section>
      ) : null}

      {isError ? (
        <section className="rounded-[26px] border border-rose-400/15 bg-rose-400/[0.05] p-6">
          <p className="font-medium text-rose-100">
            Unable to load
            payments
          </p>

          <p className="mt-1 text-sm text-rose-100/55">
            {error?.response
              ?.data
              ?.message ||
              error?.message ||
              "Please try again."}
          </p>

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
      payments.length ===
        0 ? (
        <section className="rounded-[26px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
          <Banknote
            size={30}
            className="mx-auto text-white/20"
          />

          <h2 className="mt-4 text-base font-semibold text-white/70">
            No payments
            found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/30">
            Payments recorded
            against sent
            invoices will
            appear here.
          </p>
        </section>
      ) : null}

      {!isLoading &&
      !isError &&
      payments.length >
        0 ? (
        <section className="space-y-4">
          {payments.map(
            (payment) => {
              const paymentStatus =
                payment.status ||
                "completed";

              const invoice =
                payment.invoice;

              const business =
                payment.business;

              const lead =
                payment.lead;

              return (
                <button
                  key={
                    payment._id
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      `/payments/${payment._id}`
                    )
                  }
                  className="group w-full rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-indigo-400/20 hover:bg-white/[0.045] md:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            statusClasses[
                              paymentStatus
                            ] ||
                            statusClasses.completed
                          }`}
                        >
                          {statusLabels[
                            paymentStatus
                          ] ||
                            paymentStatus}
                        </span>

                        <span className="text-xs font-medium text-white/30">
                          {
                            payment.paymentNumber
                          }
                        </span>
                      </div>

                      <p className="mt-3 text-xl font-semibold text-white">
                        {formatCurrency(
                          payment.amount,
                          payment.currency
                        )}
                      </p>

                      <p className="mt-1 text-sm text-white/40">
                        {business?.name ||
                          lead?.companyName ||
                          lead?.name ||
                          "Client"}
                      </p>
                    </div>

                    <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:max-w-[720px] xl:grid-cols-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/20">
                          Method
                        </p>

                        <p className="mt-1 text-sm font-medium text-white/55">
                          {methodLabels[
                            payment.method
                          ] ||
                            payment.method}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/20">
                          Invoice
                        </p>

                        <p className="mt-1 text-sm font-medium text-white/55">
                          {invoice?.invoiceNumber ||
                            "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/20">
                          Reference
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-white/55">
                          {payment.transactionReference ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/20">
                          Paid
                        </p>

                        <p className="mt-1 text-sm font-medium text-white/55">
                          {formatDate(
                            payment.paidAt
                          )}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={17}
                      className="shrink-0 text-white/20 transition group-hover:text-indigo-200"
                    />
                  </div>
                </button>
              );
            }
          )}
        </section>
      ) : null}

      {!isLoading &&
      !isError &&
      Number(
        stats.totalReceived
      ) > 0 ? (
        <div className="flex items-center gap-2 text-xs text-emerald-200/50">
          <ArrowDownToLine
            size={14}
          />

          Completed payments
          contribute to
          received revenue.
        </div>
      ) : null}
    </div>
  );
};

export default PaymentsPage;