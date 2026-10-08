import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
  Pencil,
  Plus,
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

import useQuotation from "../features/quotations/useQuotation";
import useUpdateQuotation from "../features/quotations/useUpdateQuotation";
import useSendQuotation from "../features/quotations/useSendQuotation";
import useAcceptQuotation from "../features/quotations/useAcceptQuotation";
import useRejectQuotation from "../features/quotations/useRejectQuotation";
import useExpireQuotation from "../features/quotations/useExpireQuotation";
import useReopenQuotation from "../features/quotations/useReopenQuotation";
import useDeleteQuotation from "../features/quotations/useDeleteQuotation";

const statusClasses = {
  draft:
    "border-white/10 bg-white/[0.05] text-white/60",

  sent:
    "border-sky-400/20 bg-sky-400/10 text-sky-200",

  accepted:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",

  rejected:
    "border-rose-400/20 bg-rose-400/10 text-rose-200",

  expired:
    "border-amber-400/20 bg-amber-400/10 text-amber-200",
};

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

const toDateInputValue = (
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

const emptyLineItem = () => ({
  description: "",
  quantity: 1,
  unitPrice: 0,
});

const normalizeForm = (
  quotation
) => ({
  title:
    quotation?.title || "",

  currency:
    quotation?.currency ||
    "GHS",

  lineItems:
    Array.isArray(
      quotation?.lineItems
    ) &&
    quotation.lineItems
      .length > 0
      ? quotation.lineItems.map(
          (item) => ({
            description:
              item?.description ||
              "",

            quantity:
              item?.quantity ?? 1,

            unitPrice:
              item?.unitPrice ??
              0,
          })
        )
      : [emptyLineItem()],

  discount:
    quotation?.discount ?? 0,

  tax:
    quotation?.tax ?? 0,

  paymentTerms:
    quotation?.paymentTerms ||
    "",

  notes:
    quotation?.notes || "",

  validUntil:
    toDateInputValue(
      quotation?.validUntil
    ),
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

      {Icon ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/35">
          <Icon size={17} />
        </div>
      ) : null}
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

const QuotationDetailsPage =
  () => {
    const navigate =
      useNavigate();

    const {
      quotationId,
    } = useParams();

    const {
      data,
      isLoading,
      isError,
      error,
      refetch,
    } = useQuotation(
      quotationId
    );

    const updateMutation =
      useUpdateQuotation();

    const sendMutation =
      useSendQuotation();

    const acceptMutation =
      useAcceptQuotation();

    const rejectMutation =
      useRejectQuotation();

    const expireMutation =
      useExpireQuotation();

    const reopenMutation =
      useReopenQuotation();

    const deleteMutation =
      useDeleteQuotation();

    const quotation =
      data?.quotation;

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
      quotation?.status ||
      "draft";

    const canEdit =
      [
        "draft",
        "sent",
      ].includes(status);

    const busy =
      updateMutation.isPending ||
      sendMutation.isPending ||
      acceptMutation.isPending ||
      rejectMutation.isPending ||
      expireMutation.isPending ||
      reopenMutation.isPending ||
      deleteMutation.isPending;

    const calculatedSubtotal =
      useMemo(
        () =>
          form.lineItems.reduce(
            (
              total,
              item
            ) =>
              total +
              Math.max(
                Number(
                  item.quantity
                ) || 0,
                0
              ) *
                Math.max(
                  Number(
                    item.unitPrice
                  ) || 0,
                  0
                ),
            0
          ),
        [form.lineItems]
      );

    const calculatedTotal =
      Math.max(
        calculatedSubtotal -
          Math.max(
            Number(
              form.discount
            ) || 0,
            0
          ) +
          Math.max(
            Number(form.tax) ||
              0,
            0
          ),
        0
      );

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

    const updateLineItem = (
      index,
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          lineItems:
            current.lineItems.map(
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

    const addLineItem = () => {
      setForm(
        (current) => ({
          ...current,

          lineItems: [
            ...current.lineItems,
            emptyLineItem(),
          ],
        })
      );
    };

    const removeLineItem = (
      index
    ) => {
      setForm(
        (current) => ({
          ...current,

          lineItems:
            current.lineItems.filter(
              (
                _,
                itemIndex
              ) =>
                itemIndex !==
                index
            ),
        })
      );
    };

    const beginEdit = () => {
      setNotice("");
      setLocalError("");

      setForm(
        normalizeForm(
          quotation
        )
      );

      setIsEditing(true);
    };

    const cancelEdit = () => {
      setNotice("");
      setLocalError("");

      setForm(
        normalizeForm(
          quotation
        )
      );

      setIsEditing(false);
    };

    const saveQuotation =
      async () => {
        if (
          !quotation ||
          updateMutation.isPending
        ) {
          return;
        }

        const cleanTitle =
          form.title.trim();

        if (!cleanTitle) {
          setLocalError(
            "Quotation title is required."
          );

          return;
        }

        const cleanItems =
          form.lineItems
            .map(
              (item) => ({
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
              })
            )
            .filter(
              (item) =>
                item.description
            );

        if (
          cleanItems.length ===
          0
        ) {
          setLocalError(
            "Add at least one quotation line item."
          );

          return;
        }

        setLocalError("");
        setNotice("");

        try {
          await updateMutation.mutateAsync(
            {
              quotationId:
                quotation._id,

              payload: {
                title:
                  cleanTitle,

                currency:
                  String(
                    form.currency ||
                      "GHS"
                  )
                    .trim()
                    .toUpperCase(),

                lineItems:
                  cleanItems,

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

                paymentTerms:
                  form.paymentTerms,

                notes:
                  form.notes,

                validUntil:
                  form.validUntil ||
                  null,
              },
            }
          );

          setIsEditing(false);

          setNotice(
            "Quotation updated successfully."
          );
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Unable to update quotation."
            )
          );
        }
      };

    const runAction =
      async (
        mutation,
        successMessage
      ) => {
        if (
          !quotation ||
          busy
        ) {
          return;
        }

        setLocalError("");
        setNotice("");

        try {
          await mutation.mutateAsync(
            quotation._id
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

    const handleDelete =
      async () => {
        if (
          !quotation ||
          busy
        ) {
          return;
        }

        const confirmed =
          window.confirm(
            "Delete this quotation? This action cannot be undone."
          );

        if (!confirmed) {
          return;
        }

        try {
          await deleteMutation.mutateAsync(
            quotation._id
          );

          navigate(
            "/quotations"
          );
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Unable to delete quotation."
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
              Loading quotation...
            </p>
          </div>
        </div>
      );
    }

    if (
      isError ||
      !quotation
    ) {
      return (
        <div className="rounded-[26px] border border-rose-400/15 bg-rose-400/[0.05] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 text-rose-300" />

            <div>
              <p className="font-semibold text-rose-100">
                Unable to load quotation
              </p>

              <p className="mt-1 text-sm text-rose-100/55">
                {getErrorMessage(
                  error,
                  "Quotation not found."
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

    const lead =
      quotation.lead;

    const business =
      quotation.business;

    const proposal =
      quotation.proposal;

    return (
      <div className="space-y-7">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/quotations"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-white/35 transition hover:text-white/70"
        >
          <ArrowLeft size={16} />

          Back to quotations
        </button>

        <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-6 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                    statusClasses[
                      status
                    ] ||
                    statusClasses.draft
                  }`}
                >
                  {status}
                </span>

                <span className="text-xs font-medium text-white/30">
                  {quotation.quotationNumber}
                </span>
              </div>

              {isEditing ? (
                <input
                  value={form.title}
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
                  {quotation.title}
                </h1>
              )}

              <p className="mt-3 text-sm text-white/35">
                {lead?.name ||
                  business?.name ||
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
                      saveQuotation
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
                    runAction(
                      sendMutation,
                      "Quotation marked as sent."
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

              {status ===
              "sent" ? (
                <>
                  <ActionButton
                    icon={
                      CheckCircle2
                    }
                    onClick={() =>
                      runAction(
                        acceptMutation,
                        "Quotation accepted successfully."
                      )
                    }
                    disabled={
                      busy ||
                      isEditing
                    }
                    primary
                  >
                    Accept
                  </ActionButton>

                  <ActionButton
                    icon={
                      XCircle
                    }
                    onClick={() =>
                      runAction(
                        rejectMutation,
                        "Quotation rejected successfully."
                      )
                    }
                    disabled={
                      busy ||
                      isEditing
                    }
                    danger
                  >
                    Reject
                  </ActionButton>
                </>
              ) : null}

              {[
                "draft",
                "sent",
              ].includes(
                status
              ) ? (
                <ActionButton
                  icon={
                    CalendarDays
                  }
                  onClick={() =>
                    runAction(
                      expireMutation,
                      "Quotation marked as expired."
                    )
                  }
                  disabled={
                    busy ||
                    isEditing
                  }
                >
                  Expire
                </ActionButton>
              ) : null}

              {[
                "rejected",
                "expired",
              ].includes(
                status
              ) ? (
                <ActionButton
                  icon={
                    RotateCcw
                  }
                  onClick={() =>
                    runAction(
                      reopenMutation,
                      "Quotation reopened successfully."
                    )
                  }
                  disabled={busy}
                >
                  Reopen
                </ActionButton>
              ) : null}

              <ActionButton
                icon={Trash2}
                onClick={
                  handleDelete
                }
                disabled={busy}
                danger
              >
                Delete
              </ActionButton>
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
            label="Total"
            value={formatCurrency(
              isEditing
                ? calculatedTotal
                : quotation.total,
              isEditing
                ? form.currency
                : quotation.currency
            )}
            icon={DollarSign}
          />

          <InfoCard
            label="Subtotal"
            value={formatCurrency(
              isEditing
                ? calculatedSubtotal
                : quotation.subtotal,
              isEditing
                ? form.currency
                : quotation.currency
            )}
            icon={FileText}
          />

          <InfoCard
            label="Line items"
            value={
              isEditing
                ? form.lineItems
                    .length
                : quotation
                    .lineItems
                    ?.length || 0
            }
            icon={FileText}
          />

          <InfoCard
            label="Valid until"
            value={
              quotation.validUntil
                ? formatDateTime(
                    quotation.validUntil
                  )
                : "Not set"
            }
            icon={
              CalendarDays
            }
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
          <div className="space-y-6">
            <Section
              title="Line items"
              description="Services, quantities and unit pricing included in this quotation."
            >
              {isEditing ? (
                <div className="space-y-3">
                  {form.lineItems.map(
                    (
                      item,
                      index
                    ) => {
                      const amount =
                        Math.max(
                          Number(
                            item.quantity
                          ) || 0,
                          0
                        ) *
                        Math.max(
                          Number(
                            item.unitPrice
                          ) || 0,
                          0
                        );

                      return (
                        <div
                          key={
                            index
                          }
                          className="rounded-2xl border border-white/[0.07] bg-black/10 p-4"
                        >
                          <div className="grid gap-3 md:grid-cols-[1fr_110px_160px_auto]">
                            <input
                              value={
                                item.description
                              }
                              onChange={(
                                event
                              ) =>
                                updateLineItem(
                                  index,
                                  "description",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="Service or item"
                              className="input-base"
                            />

                            <input
                              type="number"
                              min="0"
                              value={
                                item.quantity
                              }
                              onChange={(
                                event
                              ) =>
                                updateLineItem(
                                  index,
                                  "quantity",
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="input-base"
                            />

                            <input
                              type="number"
                              min="0"
                              value={
                                item.unitPrice
                              }
                              onChange={(
                                event
                              ) =>
                                updateLineItem(
                                  index,
                                  "unitPrice",
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="input-base"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeLineItem(
                                  index
                                )
                              }
                              disabled={
                                form
                                  .lineItems
                                  .length ===
                                1
                              }
                              className="rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-3 text-rose-200 transition hover:bg-rose-400/10 disabled:opacity-30"
                            >
                              <Trash2
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>

                          <p className="mt-3 text-right text-xs text-white/35">
                            Amount:{" "}
                            {formatCurrency(
                              amount,
                              form.currency
                            )}
                          </p>
                        </div>
                      );
                    }
                  )}

                  <button
                    type="button"
                    onClick={
                      addLineItem
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.08]"
                  >
                    <Plus
                      size={16}
                    />

                    Add item
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
                  <div className="grid grid-cols-[1fr_90px_140px_140px] gap-3 border-b border-white/[0.07] bg-white/[0.03] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                    <span>
                      Description
                    </span>

                    <span>
                      Qty
                    </span>

                    <span>
                      Unit price
                    </span>

                    <span>
                      Amount
                    </span>
                  </div>

                  {quotation.lineItems?.map(
                    (item) => (
                      <div
                        key={
                          item._id
                        }
                        className="grid grid-cols-[1fr_90px_140px_140px] gap-3 border-b border-white/[0.06] px-4 py-4 text-sm text-white/60 last:border-b-0"
                      >
                        <span className="font-medium text-white/75">
                          {
                            item.description
                          }
                        </span>

                        <span>
                          {
                            item.quantity
                          }
                        </span>

                        <span>
                          {formatCurrency(
                            item.unitPrice,
                            quotation.currency
                          )}
                        </span>

                        <span>
                          {formatCurrency(
                            item.amount,
                            quotation.currency
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </Section>

            <Section
              title="Payment terms"
              description="Commercial payment arrangement for the client."
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
                  rows={4}
                  className="textarea-base"
                  placeholder="Example: 50% upfront, 50% on completion"
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-7 text-white/55">
                  {quotation.paymentTerms ||
                    "No payment terms added."}
                </p>
              )}
            </Section>

            <Section
              title="Internal notes"
              description="Private notes related to this quotation."
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
                  rows={4}
                  className="textarea-base"
                  placeholder="Add notes..."
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-7 text-white/55">
                  {quotation.notes ||
                    "No internal notes."}
                </p>
              )}
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Pricing summary">
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-xs font-medium text-white/35">
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
                            event
                              .target
                              .value
                          )
                        }
                        className="input-base mt-2"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-white/35">
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
                            event
                              .target
                              .value
                          )
                        }
                        className="input-base mt-2"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-white/35">
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
                            event
                              .target
                              .value
                          )
                        }
                        className="input-base mt-2"
                      />
                    </div>
                  </>
                ) : null}

                <div className="space-y-3 border-t border-white/[0.07] pt-4">
                  <div className="flex justify-between text-sm text-white/40">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      {formatCurrency(
                        isEditing
                          ? calculatedSubtotal
                          : quotation.subtotal,
                        isEditing
                          ? form.currency
                          : quotation.currency
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-white/40">
                    <span>
                      Discount
                    </span>

                    <span>
                      -
                      {formatCurrency(
                        isEditing
                          ? form.discount
                          : quotation.discount,
                        isEditing
                          ? form.currency
                          : quotation.currency
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-white/40">
                    <span>
                      Tax
                    </span>

                    <span>
                      +
                      {formatCurrency(
                        isEditing
                          ? form.tax
                          : quotation.tax,
                        isEditing
                          ? form.currency
                          : quotation.currency
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-white/[0.07] pt-4 text-base font-semibold text-white">
                    <span>
                      Total
                    </span>

                    <span>
                      {formatCurrency(
                        isEditing
                          ? calculatedTotal
                          : quotation.total,
                        isEditing
                          ? form.currency
                          : quotation.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Validity">
              {isEditing ? (
                <input
                  type="date"
                  value={
                    form.validUntil
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "validUntil",
                      event.target
                        .value
                    )
                  }
                  className="input-base"
                />
              ) : (
                <p className="text-sm text-white/55">
                  {quotation.validUntil
                    ? formatDateTime(
                        quotation.validUntil
                      )
                    : "No validity date set."}
                </p>
              )}
            </Section>

            <Section title="Client">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-white/25">
                    Lead
                  </p>

                  <p className="mt-1 font-medium text-white/65">
                    {lead?.name ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/25">
                    Business
                  </p>

                  <p className="mt-1 font-medium text-white/65">
                    {business?.name ||
                      "Not linked"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/25">
                    Related proposal
                  </p>

                  {proposal?._id ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/proposals/${proposal._id}`
                        )
                      }
                      className="mt-1 text-left font-medium text-indigo-200 transition hover:text-indigo-100"
                    >
                      {proposal.proposalNumber ||
                        proposal.title ||
                        "Open proposal"}
                    </button>
                  ) : (
                    <p className="mt-1 font-medium text-white/45">
                      Not linked
                    </p>
                  )}
                </div>
              </div>
            </Section>

            <Section title="Record details">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-white/25">
                    Created
                  </p>

                  <p className="mt-1 text-white/55">
                    {formatDateTime(
                      quotation.createdAt
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/25">
                    Updated
                  </p>

                  <p className="mt-1 text-white/55">
                    {formatDateTime(
                      quotation.updatedAt
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/25">
                    Sent
                  </p>

                  <p className="mt-1 text-white/55">
                    {formatDateTime(
                      quotation.sentAt
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/25">
                    Accepted
                  </p>

                  <p className="mt-1 text-white/55">
                    {formatDateTime(
                      quotation.acceptedAt
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/25">
                    Rejected
                  </p>

                  <p className="mt-1 text-white/55">
                    {formatDateTime(
                      quotation.rejectedAt
                    )}
                  </p>
                </div>
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

export default QuotationDetailsPage;