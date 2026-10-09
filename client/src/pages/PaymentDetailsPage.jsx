import {
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import usePayment from "../features/payments/usePayment";
import useUpdatePayment from "../features/payments/useUpdatePayment";
import useReversePayment from "../features/payments/useReversePayment";

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

const paymentMethods = [
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

const toDateTimeLocal = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset * 60 * 1000
    );

  return localDate
    .toISOString()
    .slice(0, 16);
};

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data
    ?.message ||
  error?.message ||
  fallback;

const normalizeForm = (
  payment
) => ({
  method:
    payment?.method ||
    "bank_transfer",

  transactionReference:
    payment
      ?.transactionReference ||
    "",

  paidAt:
    toDateTimeLocal(
      payment?.paidAt
    ),

  notes:
    payment?.notes || "",
});

const ActionButton = ({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  danger = false,
  primary = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
      danger
        ? "border-rose-400/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15"
        : primary
          ? "border-indigo-400/25 bg-indigo-400/15 text-indigo-100 hover:bg-indigo-400/20"
          : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:text-white"
    }`}
  >
    {Icon ? (
      <Icon size={16} />
    ) : null}

    {children}
  </button>
);

const InfoCard = ({
  label,
  value,
  icon: Icon,
}) => (
  <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">
          {label}
        </p>

        <p className="mt-2 break-words text-lg font-semibold text-white">
          {value}
        </p>
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/35">
        <Icon size={17} />
      </div>
    </div>
  </div>
);

const Section = ({
  title,
  description,
  children,
}) => (
  <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
    <div>
      <h2 className="text-base font-semibold text-white">
        {title}
      </h2>

      {description ? (
        <p className="mt-1 text-sm leading-6 text-white/30">
          {description}
        </p>
      ) : null}
    </div>

    <div className="mt-5">
      {children}
    </div>
  </section>
);

const DetailRow = ({
  label,
  value,
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-b-0 last:pb-0">
    <span className="text-xs text-white/30">
      {label}
    </span>

    <span className="max-w-[65%] break-words text-right text-sm font-medium text-white/60">
      {value}
    </span>
  </div>
);

const PaymentDetailsPage = () => {
  const navigate =
    useNavigate();

  const {
    paymentId,
  } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = usePayment(
    paymentId
  );

  const updateMutation =
    useUpdatePayment();

  const reverseMutation =
    useReversePayment();

  const payment =
    data?.payment;

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState(
    normalizeForm(null)
  );

  const [
    notice,
    setNotice,
  ] = useState("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  const status =
    payment?.status ||
    "completed";

  const busy =
    updateMutation.isPending ||
    reverseMutation.isPending;

  const beginEdit = () => {
    setNotice("");
    setLocalError("");

    setForm(
      normalizeForm(
        payment
      )
    );

    setIsEditing(true);
  };

  const cancelEdit = () => {
    setNotice("");
    setLocalError("");

    setForm(
      normalizeForm(
        payment
      )
    );

    setIsEditing(false);
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

  const savePayment =
    async () => {
      if (
        !payment ||
        updateMutation.isPending
      ) {
        return;
      }

      setNotice("");
      setLocalError("");

      try {
        await updateMutation.mutateAsync(
          {
            paymentId:
              payment._id,

            payload: {
              method:
                form.method,

              transactionReference:
                form.transactionReference,

              paidAt:
                form.paidAt ||
                null,

              notes:
                form.notes,
            },
          }
        );

        setIsEditing(false);

        setNotice(
          "Payment updated successfully."
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to update payment."
          )
        );
      }
    };

  const reversePayment =
    async () => {
      if (
        !payment ||
        busy
      ) {
        return;
      }

      const reason =
        window.prompt(
          "Why is this payment being reversed?"
        );

      if (
        reason === null
      ) {
        return;
      }

      const cleanReason =
        reason.trim();

      if (!cleanReason) {
        setLocalError(
          "A reversal reason is required."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Reverse this payment? The linked invoice balance will be recalculated."
        );

      if (!confirmed) {
        return;
      }

      setNotice("");
      setLocalError("");

      try {
        await reverseMutation.mutateAsync(
          {
            paymentId:
              payment._id,

            reversalReason:
              cleanReason,
          }
        );

        setNotice(
          "Payment reversed successfully."
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to reverse payment."
          )
        );
      }
    };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-white/35" />

          <p className="mt-3 text-sm text-white/35">
            Loading payment...
          </p>
        </div>
      </div>
    );
  }

  if (
    isError ||
    !payment
  ) {
    return (
      <div className="mx-auto max-w-[900px] rounded-[26px] border border-rose-400/15 bg-rose-400/[0.05] p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 text-rose-300" />

          <div>
            <p className="font-semibold text-rose-100">
              Unable to load payment
            </p>

            <p className="mt-1 text-sm text-rose-100/55">
              {getErrorMessage(
                error,
                "Payment not found."
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            refetch()
          }
          className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60"
        >
          Try again
        </button>
      </div>
    );
  }

  const invoice =
    payment.invoice;

  const project =
    payment.project;

  const lead =
    payment.lead;

  const business =
    payment.business;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7">
      <button
        type="button"
        onClick={() =>
          navigate(
            "/payments"
          )
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-white/35 transition hover:text-white/70"
      >
        <ArrowLeft
          size={16}
        />

        Back to payments
      </button>

      <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
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

              <span className="text-xs font-medium text-white/30">
                {
                  payment.paymentNumber
                }
              </span>
            </div>

            <h1 className="mt-4 break-words text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {formatCurrency(
                payment.amount,
                payment.currency
              )}
            </h1>

            <p className="mt-3 text-sm text-white/35">
              {business?.name ||
                lead?.companyName ||
                lead?.name ||
                "Client payment"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {status ===
              "completed" &&
            !isEditing ? (
              <ActionButton
                icon={Pencil}
                onClick={
                  beginEdit
                }
                disabled={busy}
              >
                Edit details
              </ActionButton>
            ) : null}

            {isEditing ? (
              <>
                <ActionButton
                  icon={X}
                  onClick={
                    cancelEdit
                  }
                  disabled={
                    updateMutation.isPending
                  }
                >
                  Cancel
                </ActionButton>

                <ActionButton
                  icon={Save}
                  onClick={
                    savePayment
                  }
                  disabled={
                    updateMutation.isPending
                  }
                  primary
                >
                  Save
                </ActionButton>
              </>
            ) : null}

            {status ===
              "completed" ? (
              <ActionButton
                icon={
                  RotateCcw
                }
                onClick={
                  reversePayment
                }
                disabled={
                  busy ||
                  isEditing
                }
                danger
              >
                Reverse payment
              </ActionButton>
            ) : null}
          </div>
        </div>
      </section>

      {notice ? (
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-100">
          {notice}
        </div>
      ) : null}

      {localError ? (
        <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-100">
          {localError}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          label="Amount"
          value={formatCurrency(
            payment.amount,
            payment.currency
          )}
          icon={
            CircleDollarSign
          }
        />

        <InfoCard
          label="Method"
          value={
            methodLabels[
              payment.method
            ] ||
            payment.method
          }
          icon={
            CreditCard
          }
        />

        <InfoCard
          label="Paid at"
          value={formatDateTime(
            payment.paidAt
          )}
          icon={
            CalendarDays
          }
        />

        <InfoCard
          label="Status"
          value={
            statusLabels[
              status
            ] || status
          }
          icon={
            status ===
            "completed"
              ? CheckCircle2
              : RotateCcw
          }
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.85fr]">
        <div className="space-y-6">
          <Section
            title="Payment details"
            description="Reference and payment information recorded for this transaction."
          >
            {isEditing ? (
              <div className="space-y-4">
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
                    className="input-base mt-2 bg-[#0b0f16]"
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
                    className="input-base mt-2"
                    placeholder="Bank reference, MoMo reference, cheque number..."
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
                    className="input-base mt-2"
                  />
                </div>

                <div>
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
                    rows={5}
                    className="textarea-base mt-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <DetailRow
                  label="Method"
                  value={
                    methodLabels[
                      payment.method
                    ] ||
                    payment.method
                  }
                />

                <DetailRow
                  label="Reference"
                  value={
                    payment.transactionReference ||
                    "Not provided"
                  }
                />

                <DetailRow
                  label="Paid at"
                  value={formatDateTime(
                    payment.paidAt
                  )}
                />

                <div>
                  <p className="text-xs text-white/30">
                    Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/55">
                    {payment.notes ||
                      "No payment notes added."}
                  </p>
                </div>
              </div>
            )}
          </Section>

          {status ===
          "reversed" ? (
            <Section
              title="Reversal"
              description="This payment no longer contributes to received revenue."
            >
              <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] p-4">
                <p className="text-sm leading-7 text-rose-100/70">
                  {payment.reversalReason ||
                    "No reversal reason recorded."}
                </p>

                <p className="mt-3 text-xs text-white/25">
                  Reversed:{" "}
                  {formatDateTime(
                    payment.reversedAt
                  )}
                </p>
              </div>
            </Section>
          ) : null}
        </div>

        <div className="space-y-6">
          <Section title="Invoice">
            <div className="space-y-4">
              <DetailRow
                label="Invoice"
                value={
                  invoice?.invoiceNumber ||
                  "Not available"
                }
              />

              <DetailRow
                label="Invoice total"
                value={formatCurrency(
                  invoice?.total,
                  invoice?.currency
                )}
              />

              <DetailRow
                label="Amount paid"
                value={formatCurrency(
                  invoice?.amountPaid,
                  invoice?.currency
                )}
              />

              <DetailRow
                label="Balance due"
                value={formatCurrency(
                  invoice?.balanceDue,
                  invoice?.currency
                )}
              />

              {invoice?._id ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/invoices/${invoice._id}`
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Open invoice
                </button>
              ) : null}
            </div>
          </Section>

          <Section title="Project">
            <div className="space-y-4">
              <DetailRow
                label="Project"
                value={
                  project?.name ||
                  "Not available"
                }
              />

              <DetailRow
                label="Project number"
                value={
                  project?.projectNumber ||
                  "Not available"
                }
              />

              {project?._id ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/projects/${project._id}`
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Open project
                </button>
              ) : null}
            </div>
          </Section>

          <Section title="Client">
            <div className="space-y-4">
              <DetailRow
                label="Lead"
                value={
                  lead?.name ||
                  "Not available"
                }
              />

              <DetailRow
                label="Business"
                value={
                  business?.name ||
                  "Not linked"
                }
              />

              {lead?._id ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/leads/${lead._id}`
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Open lead
                </button>
              ) : null}
            </div>
          </Section>

          <Section title="Record details">
            <div className="space-y-4">
              <DetailRow
                label="Payment number"
                value={
                  payment.paymentNumber
                }
              />

              <DetailRow
                label="Created"
                value={formatDateTime(
                  payment.createdAt
                )}
              />

              <DetailRow
                label="Updated"
                value={formatDateTime(
                  payment.updatedAt
                )}
              />

              <DetailRow
                label="Payment ID"
                value={
                  payment._id
                }
              />
            </div>
          </Section>
        </div>
      </div>

      <style>{`
        .input-base {
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

        .input-base:focus {
          border-color: rgba(129,140,248,0.35);
          box-shadow: 0 0 0 2px rgba(129,140,248,0.08);
        }

        .textarea-base {
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

        .textarea-base:focus {
          border-color: rgba(129,140,248,0.35);
          box-shadow: 0 0 0 2px rgba(129,140,248,0.08);
        }
      `}</style>
    </div>
  );
};

export default PaymentDetailsPage;