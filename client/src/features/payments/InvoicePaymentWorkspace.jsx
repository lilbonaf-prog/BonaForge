import {
  useState,
} from "react";

import {
  Banknote,
  ChevronRight,
  Loader2,
  Plus,
  ReceiptText,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import useInvoicePayments from "./useInvoicePayments";
import useCreatePayment from "./useCreatePayment";

const paymentMethods = [
  {
    value: "bank_transfer",
    label: "Bank transfer",
  },
  {
    value: "cash",
    label: "Cash",
  },
  {
    value: "mobile_money",
    label: "Mobile money",
  },
  {
    value: "card",
    label: "Card",
  },
  {
    value: "cheque",
    label: "Cheque",
  },
  {
    value: "other",
    label: "Other",
  },
];

const methodLabels = {
  bank_transfer: "Bank transfer",
  cash: "Cash",
  mobile_money: "Mobile money",
  card: "Card",
  cheque: "Cheque",
  other: "Other",
};

const statusClasses = {
  completed:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",

  reversed:
    "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

const statusLabels = {
  completed: "Completed",
  reversed: "Reversed",
};

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
          currency || "GHS",
        maximumFractionDigits: 2,
      }
    ).format(
      Number(amount) || 0
    );
  } catch {
    return `${currency || "GHS"} ${(
      Number(amount) || 0
    ).toLocaleString()}`;
  }
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

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data
    ?.message ||
  error?.message ||
  fallback;

const InvoicePaymentWorkspace = ({
  invoice,
}) => {
  const navigate =
    useNavigate();

  const invoiceId =
    invoice?._id;

  const {
    data,
    isLoading,
    isError,
    error,
  } = useInvoicePayments(
    invoiceId
  );

  const createMutation =
    useCreatePayment();

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState({
    amount: "",
    method:
      "bank_transfer",
    transactionReference:
      "",
    paidAt: "",
    notes: "",
  });

  const [
    localError,
    setLocalError,
  ] = useState("");

  const payments =
    data?.payments || [];

  const balanceDue =
    Math.max(
      Number(
        invoice?.balanceDue
      ) || 0,
      0
    );

  const canRecordPayment =
    invoice &&
    ![
      "draft",
      "cancelled",
      "paid",
    ].includes(
      invoice.status
    ) &&
    balanceDue > 0;

  const resetForm = () => {
    setForm({
      amount: "",
      method:
        "bank_transfer",
      transactionReference:
        "",
      paidAt: "",
      notes: "",
    });

    setLocalError("");
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const updateField = (
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const useFullBalance = () => {
    updateField(
      "amount",
      String(balanceDue)
    );
  };

  const recordPayment =
    async () => {
      if (
        !invoiceId ||
        createMutation.isPending
      ) {
        return;
      }

      const amount =
        Number(
          form.amount
        );

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        setLocalError(
          "Enter a valid payment amount."
        );

        return;
      }

      if (
        amount >
        balanceDue + 0.005
      ) {
        setLocalError(
          "Payment cannot exceed the outstanding balance."
        );

        return;
      }

      setLocalError("");

      try {
        const result =
          await createMutation.mutateAsync(
            {
              invoiceId,

              payload: {
                amount,

                method:
                  form.method,

                transactionReference:
                  form.transactionReference,

                paidAt:
                  form.paidAt ||
                  undefined,

                notes:
                  form.notes,
              },
            }
          );

        closeForm();

        const paymentId =
          result?.payment?._id;

        if (paymentId) {
          navigate(
            `/payments/${paymentId}`
          );
        }
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to record payment."
          )
        );
      }
    };

  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Banknote
              size={18}
              className="text-emerald-300"
            />

            <h2 className="text-base font-semibold text-white">
              Payments
            </h2>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/30">
            Record and track
            payments received
            against this invoice.
          </p>
        </div>

        {canRecordPayment &&
        !showForm ? (
          <button
            type="button"
            onClick={() => {
              setLocalError("");
              setShowForm(true);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/15"
          >
            <Plus size={16} />

            Record payment
          </button>
        ) : null}
      </div>

      {!canRecordPayment &&
      invoice?.status ===
        "draft" ? (
        <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3 text-sm text-amber-100/70">
          Send the invoice
          before recording a
          payment.
        </div>
      ) : null}

      {!canRecordPayment &&
      invoice?.status ===
        "paid" ? (
        <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] px-4 py-3 text-sm text-emerald-100/70">
          This invoice is fully
          paid.
        </div>
      ) : null}

      {!canRecordPayment &&
      invoice?.status ===
        "cancelled" ? (
        <div className="mt-5 rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] px-4 py-3 text-sm text-rose-100/70">
          Payments cannot be
          recorded against a
          cancelled invoice.
        </div>
      ) : null}

      {showForm ? (
        <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                Record payment
              </p>

              <p className="mt-1 text-xs text-white/30">
                Outstanding:{" "}
                {formatCurrency(
                  balanceDue,
                  invoice.currency
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={
                closeForm
              }
              disabled={
                createMutation.isPending
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/40 transition hover:text-white"
              aria-label="Close payment form"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-white/35">
                Amount
              </label>

              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    form.amount
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "amount",
                      event.target
                        .value
                    )
                  }
                  placeholder="0.00"
                  className="payment-input flex-1"
                />

                <button
                  type="button"
                  onClick={
                    useFullBalance
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/50 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Full balance
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/35">
                Payment method
              </label>

              <select
                value={
                  form.method
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "method",
                    event.target
                      .value
                  )
                }
                className="payment-input mt-2 bg-[#0b0f16]"
              >
                {paymentMethods.map(
                  (method) => (
                    <option
                      key={
                        method.value
                      }
                      value={
                        method.value
                      }
                    >
                      {
                        method.label
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/35">
                Transaction reference
              </label>

              <input
                value={
                  form.transactionReference
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "transactionReference",
                    event.target
                      .value
                  )
                }
                placeholder="Bank, MoMo or cheque reference"
                className="payment-input mt-2"
              />
            </div>

            <div>
              <label className="text-xs text-white/35">
                Payment date
              </label>

              <input
                type="datetime-local"
                value={
                  form.paidAt
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "paidAt",
                    event.target
                      .value
                  )
                }
                className="payment-input mt-2"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-white/35">
              Notes
            </label>

            <textarea
              value={
                form.notes
              }
              onChange={(
                event
              ) =>
                updateField(
                  "notes",
                  event.target
                    .value
                )
              }
              rows={4}
              className="payment-textarea mt-2"
              placeholder="Optional payment notes..."
            />
          </div>

          {localError ? (
            <div className="mt-4 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-100/80">
              {localError}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                closeForm
              }
              disabled={
                createMutation.isPending
              }
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                recordPayment
              }
              disabled={
                createMutation.isPending
              }
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {createMutation.isPending ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Banknote
                  size={16}
                />
              )}

              Record payment
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-black/10 p-4 text-sm text-white/35">
          <Loader2
            size={16}
            className="animate-spin"
          />

          Loading payments...
        </div>
      ) : null}

      {isError ? (
        <div className="mt-5 rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-100/70">
          {getErrorMessage(
            error,
            "Unable to load invoice payments."
          )}
        </div>
      ) : null}

      {!isLoading &&
      !isError &&
      payments.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/10 px-5 py-8 text-center">
          <ReceiptText
            size={25}
            className="mx-auto text-white/15"
          />

          <p className="mt-3 text-sm font-medium text-white/45">
            No payments yet
          </p>

          <p className="mt-1 text-xs text-white/25">
            Recorded payments
            for this invoice
            will appear here.
          </p>
        </div>
      ) : null}

      {!isLoading &&
      !isError &&
      payments.length > 0 ? (
        <div className="mt-5 space-y-3">
          {payments.map(
            (payment) => {
              const status =
                payment.status ||
                "completed";

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
                  className="group flex w-full flex-col gap-4 rounded-2xl border border-white/[0.07] bg-black/10 p-4 text-left transition hover:border-emerald-400/15 hover:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                          statusClasses[
                            status
                          ] ||
                          statusClasses.completed
                        }`}
                      >
                        {statusLabels[
                          status
                        ] || status}
                      </span>

                      <span className="text-xs text-white/25">
                        {
                          payment.paymentNumber
                        }
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-semibold text-white/75">
                      {formatCurrency(
                        payment.amount,
                        payment.currency
                      )}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/30">
                      <span>
                        {methodLabels[
                          payment.method
                        ] ||
                          payment.method}
                      </span>

                      <span>
                        {formatDateTime(
                          payment.paidAt
                        )}
                      </span>

                      {payment.transactionReference ? (
                        <span>
                          Ref:{" "}
                          {
                            payment.transactionReference
                          }
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className="shrink-0 text-white/20 transition group-hover:text-emerald-200"
                  />
                </button>
              );
            }
          )}
        </div>
      ) : null}

      <style>{`
        .payment-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.20);
          padding: 0.75rem 0.875rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: 150ms ease;
        }

        .payment-input:focus {
          border-color: rgba(52,211,153,0.30);
          box-shadow: 0 0 0 2px rgba(52,211,153,0.07);
        }

        .payment-textarea {
          width: 100%;
          resize: vertical;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.20);
          padding: 0.875rem;
          font-size: 0.875rem;
          line-height: 1.6;
          color: white;
          outline: none;
        }

        .payment-textarea:focus {
          border-color: rgba(52,211,153,0.30);
          box-shadow: 0 0 0 2px rgba(52,211,153,0.07);
        }
      `}</style>
    </section>
  );
};

export default InvoicePaymentWorkspace;
