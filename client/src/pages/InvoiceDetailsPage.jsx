import {
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Loader2,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
  Save,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import useInvoice from "../features/invoices/useInvoice";
import useUpdateInvoice from "../features/invoices/useUpdateInvoice";
import useSendInvoice from "../features/invoices/useSendInvoice";
import useMarkInvoiceOverdue from "../features/invoices/useMarkInvoiceOverdue";
import useCancelInvoice from "../features/invoices/useCancelInvoice";
import useReopenInvoice from "../features/invoices/useReopenInvoice";
import useDeleteInvoice from "../features/invoices/useDeleteInvoice";
import InvoicePaymentWorkspace from "../features/payments/InvoicePaymentWorkspace";

const statusClasses = {
  draft:
    "border-white/10 bg-white/[0.05] text-white/60",

  sent:
    "border-sky-400/20 bg-sky-400/10 text-sky-200",

  partially_paid:
    "border-amber-400/20 bg-amber-400/10 text-amber-200",

  paid:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",

  overdue:
    "border-rose-400/20 bg-rose-400/10 text-rose-200",

  cancelled:
    "border-white/10 bg-white/[0.03] text-white/40",
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
      dateStyle: "medium",
    }
  ).format(date);
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

const toDateInput = (
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

  return date
    .toISOString()
    .slice(0, 10);
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
  invoice
) => ({
  title:
    invoice?.title || "",

  currency:
    invoice?.currency ||
    "GHS",

  issueDate:
    toDateInput(
      invoice?.issueDate
    ),

  dueDate:
    toDateInput(
      invoice?.dueDate
    ),

  discount:
    invoice?.discount ?? 0,

  tax:
    invoice?.tax ?? 0,

  paymentTerms:
    invoice?.paymentTerms ||
    "",

  notes:
    invoice?.notes || "",

  items:
    Array.isArray(
      invoice?.items
    ) &&
    invoice.items.length > 0
      ? invoice.items.map(
          (item) => ({
            description:
              item.description ||
              "",

            quantity:
              item.quantity ??
              1,

            unitPrice:
              item.unitPrice ??
              0,
          })
        )
      : [
          {
            description: "",
            quantity: 1,
            unitPrice: 0,
          },
        ],
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

const InvoiceDetailsPage = () => {
  const navigate =
    useNavigate();

  const {
    invoiceId,
  } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useInvoice(
    invoiceId
  );

  const updateMutation =
    useUpdateInvoice();

  const sendMutation =
    useSendInvoice();

  const overdueMutation =
    useMarkInvoiceOverdue();

  const cancelMutation =
    useCancelInvoice();

  const reopenMutation =
    useReopenInvoice();

  const deleteMutation =
    useDeleteInvoice();

  const invoice =
    data?.invoice;

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
    invoice?.status ||
    "draft";

  const canEdit =
    status === "draft";

  const busy =
    updateMutation.isPending ||
    sendMutation.isPending ||
    overdueMutation.isPending ||
    cancelMutation.isPending ||
    reopenMutation.isPending ||
    deleteMutation.isPending;

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

  const updateItem = (
    index,
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,

        items:
          current.items.map(
            (
              item,
              itemIndex
            ) =>
              itemIndex ===
              index
                ? {
                    ...item,
                    [field]:
                      value,
                  }
                : item
          ),
      })
    );
  };

  const addItem = () => {
    setForm(
      (current) => ({
        ...current,

        items: [
          ...current.items,
          {
            description: "",
            quantity: 1,
            unitPrice: 0,
          },
        ],
      })
    );
  };

  const removeItem = (
    index
  ) => {
    setForm(
      (current) => ({
        ...current,

        items:
          current.items.length >
          1
            ? current.items.filter(
                (
                  _item,
                  itemIndex
                ) =>
                  itemIndex !==
                  index
              )
            : current.items,
      })
    );
  };

  const beginEdit = () => {
    setNotice("");
    setLocalError("");

    setForm(
      normalizeForm(
        invoice
      )
    );

    setIsEditing(true);
  };

  const cancelEdit = () => {
    setNotice("");
    setLocalError("");

    setForm(
      normalizeForm(
        invoice
      )
    );

    setIsEditing(false);
  };

  const saveInvoice =
    async () => {
      if (
        !invoice ||
        updateMutation.isPending
      ) {
        return;
      }

      const title =
        form.title.trim();

      if (!title) {
        setLocalError(
          "Invoice title is required."
        );

        return;
      }

      const items =
        form.items
          .map((item) => ({
            description:
              String(
                item.description ||
                  ""
              ).trim(),

            quantity:
              Math.max(
                Number(
                  item.quantity
                ) || 0,
                0
              ),

            unitPrice:
              Math.max(
                Number(
                  item.unitPrice
                ) || 0,
                0
              ),
          }))
          .filter(
            (item) =>
              item.description
          );

      if (
        items.length === 0
      ) {
        setLocalError(
          "Add at least one invoice item."
        );

        return;
      }

      setNotice("");
      setLocalError("");

      try {
        await updateMutation.mutateAsync(
          {
            invoiceId:
              invoice._id,

            payload: {
              title,

              items,

              discount:
                Math.max(
                  Number(
                    form.discount
                  ) || 0,
                  0
                ),

              tax:
                Math.max(
                  Number(
                    form.tax
                  ) || 0,
                  0
                ),

              currency:
                String(
                  form.currency ||
                    "GHS"
                )
                  .trim()
                  .toUpperCase(),

              issueDate:
                form.issueDate ||
                null,

              dueDate:
                form.dueDate ||
                null,

              paymentTerms:
                form.paymentTerms,

              notes:
                form.notes,
            },
          }
        );

        setIsEditing(false);

        setNotice(
          "Invoice updated successfully."
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to update invoice."
          )
        );
      }
    };

  const runSimpleAction =
    async (
      mutation,
      successMessage
    ) => {
      if (
        !invoice ||
        busy
      ) {
        return;
      }

      setNotice("");
      setLocalError("");

      try {
        await mutation.mutateAsync(
          invoice._id
        );

        setNotice(
          successMessage
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to complete this action."
          )
        );
      }
    };

  const handleCancelInvoice =
    async () => {
      if (
        !invoice ||
        busy
      ) {
        return;
      }

      const reason =
        window.prompt(
          "Why is this invoice being cancelled? You can leave this blank."
        );

      if (
        reason === null
      ) {
        return;
      }

      setNotice("");
      setLocalError("");

      try {
        await cancelMutation.mutateAsync(
          {
            invoiceId:
              invoice._id,

            cancellationReason:
              reason,
          }
        );

        setNotice(
          "Invoice cancelled successfully."
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to cancel invoice."
          )
        );
      }
    };

  const handleDeleteInvoice =
    async () => {
      if (
        !invoice ||
        busy
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this invoice? This action cannot be undone."
        );

      if (!confirmed) {
        return;
      }

      setLocalError("");

      try {
        await deleteMutation.mutateAsync(
          invoice._id
        );

        navigate(
          "/invoices"
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to delete invoice."
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
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (
    isError ||
    !invoice
  ) {
    return (
      <div className="mx-auto max-w-[900px] rounded-[26px] border border-rose-400/15 bg-rose-400/[0.05] p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 text-rose-300" />

          <div>
            <p className="font-semibold text-rose-100">
              Unable to load invoice
            </p>

            <p className="mt-1 text-sm text-rose-100/55">
              {getErrorMessage(
                error,
                "Invoice not found."
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

  const project =
    invoice.project;

  const lead =
    invoice.lead;

  const business =
    invoice.business;

  const quotation =
    invoice.quotation;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7">
      <button
        type="button"
        onClick={() =>
          navigate(
            "/invoices"
          )
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-white/35 transition hover:text-white/70"
      >
        <ArrowLeft
          size={16}
        />

        Back to invoices
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
                  statusClasses.draft
                }`}
              >
                {statusLabels[
                  status
                ] || status}
              </span>

              <span className="text-xs font-medium text-white/30">
                {
                  invoice.invoiceNumber
                }
              </span>
            </div>

            {isEditing ? (
              <input
                value={
                  form.title
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "title",
                    event.target
                      .value
                  )
                }
                className="mt-4 w-full max-w-3xl rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-2xl font-semibold text-white outline-none focus:border-indigo-400/30"
              />
            ) : (
              <h1 className="mt-4 break-words text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {invoice.title}
              </h1>
            )}

            <p className="mt-3 text-sm text-white/35">
              {business?.name ||
                lead?.companyName ||
                lead?.name ||
                "Client"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canEdit &&
            !isEditing ? (
              <ActionButton
                icon={Pencil}
                onClick={
                  beginEdit
                }
                disabled={busy}
              >
                Edit
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
                    saveInvoice
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
              "draft" ? (
              <ActionButton
                icon={Send}
                onClick={() =>
                  runSimpleAction(
                    sendMutation,
                    "Invoice marked as sent."
                  )
                }
                disabled={
                  busy ||
                  isEditing
                }
                primary
              >
                Mark sent
              </ActionButton>
            ) : null}

            {[
              "sent",
              "partially_paid",
            ].includes(
              status
            ) ? (
              <ActionButton
                icon={Clock3}
                onClick={() =>
                  runSimpleAction(
                    overdueMutation,
                    "Invoice marked as overdue."
                  )
                }
                disabled={
                  busy ||
                  isEditing
                }
              >
                Mark overdue
              </ActionButton>
            ) : null}

            {![
              "paid",
              "cancelled",
            ].includes(
              status
            ) &&
            Number(
              invoice.amountPaid
            ) === 0 ? (
              <ActionButton
                icon={XCircle}
                onClick={
                  handleCancelInvoice
                }
                disabled={
                  busy ||
                  isEditing
                }
                danger
              >
                Cancel invoice
              </ActionButton>
            ) : null}

            {status ===
              "cancelled" ? (
              <ActionButton
                icon={RotateCcw}
                onClick={() =>
                  runSimpleAction(
                    reopenMutation,
                    "Invoice reopened successfully."
                  )
                }
                disabled={busy}
              >
                Reopen
              </ActionButton>
            ) : null}

            {[
              "draft",
              "cancelled",
            ].includes(
              status
            ) &&
            Number(
              invoice.amountPaid
            ) === 0 ? (
              <ActionButton
                icon={Trash2}
                onClick={
                  handleDeleteInvoice
                }
                disabled={busy}
                danger
              >
                Delete
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
          label="Invoice total"
          value={formatCurrency(
            invoice.total,
            invoice.currency
          )}
          icon={
            CircleDollarSign
          }
        />

        <InfoCard
          label="Amount paid"
          value={formatCurrency(
            invoice.amountPaid,
            invoice.currency
          )}
          icon={
            CheckCircle2
          }
        />

        <InfoCard
          label="Balance due"
          value={formatCurrency(
            invoice.balanceDue,
            invoice.currency
          )}
          icon={Clock3}
        />

        <InfoCard
          label="Due date"
          value={formatDate(
            invoice.dueDate
          )}
          icon={
            CalendarDays
          }
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.85fr]">
        <div className="space-y-6">
          <Section
            title="Invoice items"
            description="Products or services being billed to the client."
          >
            {isEditing ? (
              <div className="space-y-4">
                {form.items.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/[0.07] bg-black/10 p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_160px_auto] md:items-end">
                        <div>
                          <label className="text-xs text-white/35">
                            Description
                          </label>

                          <input
                            value={
                              item.description
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "description",
                                event.target
                                  .value
                              )
                            }
                            className="input-base mt-2"
                            placeholder="Service or item"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-white/35">
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "quantity",
                                event.target
                                  .value
                              )
                            }
                            className="input-base mt-2"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-white/35">
                            Unit price
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.unitPrice
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "unitPrice",
                                event.target
                                  .value
                              )
                            }
                            className="input-base mt-2"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                          disabled={
                            form.items
                              .length <= 1
                          }
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-400/15 bg-rose-400/[0.05] text-rose-200/70 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>
                      </div>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/10 px-4 py-2.5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-400/15"
                >
                  <Plus
                    size={16}
                  />

                  Add item
                </button>
              </div>
            ) : invoice.items
                ?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-left">
                      <th className="pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                        Description
                      </th>

                      <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                        Qty
                      </th>

                      <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                        Unit price
                      </th>

                      <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoice.items.map(
                      (
                        item
                      ) => (
                        <tr
                          key={
                            item._id
                          }
                          className="border-b border-white/[0.05] last:border-b-0"
                        >
                          <td className="py-4 pr-4 text-sm text-white/60">
                            {
                              item.description
                            }
                          </td>

                          <td className="py-4 text-right text-sm text-white/45">
                            {
                              item.quantity
                            }
                          </td>

                          <td className="py-4 text-right text-sm text-white/45">
                            {formatCurrency(
                              item.unitPrice,
                              invoice.currency
                            )}
                          </td>

                          <td className="py-4 text-right text-sm font-semibold text-white/70">
                            {formatCurrency(
                              item.amount,
                              invoice.currency
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-white/35">
                No invoice items.
              </p>
            )}
          </Section>

          <InvoicePaymentWorkspace
            invoice={invoice}
          />

          <Section
            title="Payment terms"
            description="Billing terms communicated to the client."
          >
            {isEditing ? (
              <textarea
                value={
                  form.paymentTerms
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "paymentTerms",
                    event.target
                      .value
                  )
                }
                rows={5}
                className="textarea-base"
                placeholder="Example: Payment due within 14 days."
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-7 text-white/55">
                {invoice.paymentTerms ||
                  "No payment terms added."}
              </p>
            )}
          </Section>

          <Section
            title="Notes"
            description="Additional invoice information or internal notes."
          >
            {isEditing ? (
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
                className="textarea-base"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-7 text-white/55">
                {invoice.notes ||
                  "No notes added."}
              </p>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Totals">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/35">
                    Discount
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.discount
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "discount",
                        event.target
                          .value
                      )
                    }
                    className="input-base mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/35">
                    Tax
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.tax
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "tax",
                        event.target
                          .value
                      )
                    }
                    className="input-base mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/35">
                    Currency
                  </label>

                  <input
                    value={
                      form.currency
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "currency",
                        event.target
                          .value
                      )
                    }
                    className="input-base mt-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <DetailRow
                  label="Subtotal"
                  value={formatCurrency(
                    invoice.subtotal,
                    invoice.currency
                  )}
                />

                <DetailRow
                  label="Discount"
                  value={formatCurrency(
                    invoice.discount,
                    invoice.currency
                  )}
                />

                <DetailRow
                  label="Tax"
                  value={formatCurrency(
                    invoice.tax,
                    invoice.currency
                  )}
                />

                <DetailRow
                  label="Total"
                  value={formatCurrency(
                    invoice.total,
                    invoice.currency
                  )}
                />

                <DetailRow
                  label="Paid"
                  value={formatCurrency(
                    invoice.amountPaid,
                    invoice.currency
                  )}
                />

                <DetailRow
                  label="Balance"
                  value={formatCurrency(
                    invoice.balanceDue,
                    invoice.currency
                  )}
                />
              </div>
            )}
          </Section>

          <Section title="Schedule">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/35">
                    Issue date
                  </label>

                  <input
                    type="date"
                    value={
                      form.issueDate
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "issueDate",
                        event.target
                          .value
                      )
                    }
                    className="input-base mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/35">
                    Due date
                  </label>

                  <input
                    type="date"
                    value={
                      form.dueDate
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "dueDate",
                        event.target
                          .value
                      )
                    }
                    className="input-base mt-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <DetailRow
                  label="Issue date"
                  value={formatDate(
                    invoice.issueDate
                  )}
                />

                <DetailRow
                  label="Due date"
                  value={formatDate(
                    invoice.dueDate
                  )}
                />

                <DetailRow
                  label="Sent"
                  value={formatDateTime(
                    invoice.sentAt
                  )}
                />

                <DetailRow
                  label="Paid"
                  value={formatDateTime(
                    invoice.paidAt
                  )}
                />
              </div>
            )}
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

          <Section title="Linked project">
            {project?._id ? (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/projects/${project._id}`
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]"
              >
                <div className="flex items-start gap-3">
                  <FileText
                    size={17}
                    className="mt-0.5 text-indigo-300"
                  />

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                      {
                        project.projectNumber
                      }
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white/65">
                      {
                        project.name
                      }
                    </p>
                  </div>
                </div>
              </button>
            ) : (
              <p className="text-sm text-white/30">
                No project linked.
              </p>
            )}
          </Section>

          <Section title="Quotation">
            {quotation?._id ? (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/quotations/${quotation._id}`
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]"
              >
                <div className="flex items-start gap-3">
                  <ReceiptText
                    size={17}
                    className="mt-0.5 text-indigo-300"
                  />

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                      {
                        quotation.quotationNumber
                      }
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white/65">
                      {
                        quotation.title
                      }
                    </p>
                  </div>
                </div>
              </button>
            ) : (
              <p className="text-sm text-white/30">
                No quotation linked.
              </p>
            )}
          </Section>

          {status ===
          "cancelled" ? (
            <Section title="Cancellation">
              <p className="text-sm leading-7 text-rose-100/60">
                {invoice.cancellationReason ||
                  "No cancellation reason provided."}
              </p>

              <p className="mt-3 text-xs text-white/25">
                Cancelled:{" "}
                {formatDateTime(
                  invoice.cancelledAt
                )}
              </p>
            </Section>
          ) : null}

          <Section title="Record details">
            <div className="space-y-4">
              <DetailRow
                label="Created"
                value={formatDateTime(
                  invoice.createdAt
                )}
              />

              <DetailRow
                label="Updated"
                value={formatDateTime(
                  invoice.updatedAt
                )}
              />

              <DetailRow
                label="Invoice ID"
                value={
                  invoice._id
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

export default InvoiceDetailsPage;