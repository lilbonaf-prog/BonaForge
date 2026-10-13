import {
  useParams,
} from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  CalendarDays,
  Command,
  FileText,
  Loader2,
  ReceiptText,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import {
  getPublicInvoiceByToken,
} from "../services/invoiceService";

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  partially_paid:
    "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
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
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
};

const formatCurrency = (
  value,
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
    Number(value) || 0
  );

function SharedInvoicePage() {
  const { token } =
    useParams();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "public",
      "invoice",
      token,
    ],

    queryFn: () =>
      getPublicInvoiceByToken(
        token
      ),

    enabled:
      Boolean(token),

    retry: false,
  });

  const invoice =
    data?.invoice || null;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-5 text-white">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-[var(--brand-secondary)]"
          />

          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Loading shared invoice...
          </p>
        </div>
      </main>
    );
  }

  if (
    isError ||
    !invoice
  ) {
    const message =
      error?.response?.data?.message ||
      "This invoice link is invalid, expired or has been revoked.";

    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-5 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-[var(--border-primary)] bg-white/[0.025] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/15 bg-red-400/[0.06] text-red-300">
            <ReceiptText
              size={21}
            />
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
            Invoice unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            {message}
          </p>
        </div>
      </main>
    );
  }

  const client =
    invoice.client || {};

  const items =
    Array.isArray(
      invoice.items
    )
      ? invoice.items
      : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-white">
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
      >
        <div className="absolute left-[-14rem] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-[var(--brand-primary)]/10 blur-[130px]" />

        <div className="absolute bottom-[-18rem] right-[-12rem] h-[38rem] w-[38rem] rounded-full bg-[var(--brand-secondary)]/10 blur-[150px]" />
      </div>

      <header className="relative z-10 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-[1200px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <Command
                size={20}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                BonaForge
              </p>

              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                by Bona Fide
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5 text-xs font-medium text-emerald-200">
            <ShieldCheck
              size={13}
            />

            Secure read-only invoice
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 py-10 sm:px-8 lg:py-14">
        <section className="rounded-[28px] border border-[var(--border-primary)] bg-white/[0.025] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[var(--border-primary)] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                  {
                    invoice.invoiceNumber
                  }
                </span>

                <span className="rounded-full border border-indigo-400/15 bg-indigo-400/[0.07] px-3 py-1.5 text-xs font-semibold text-indigo-200">
                  {
                    statusLabels[
                      invoice.status
                    ] ||
                    invoice.status
                  }
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
                {
                  invoice.title
                }
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                Invoice prepared for your review and payment records.
              </p>
            </div>

            <div className="min-w-[250px] rounded-2xl border border-[var(--border-primary)] bg-black/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Billed to
              </p>

              <p className="mt-3 text-lg font-semibold text-white">
                {client.businessName ||
                  client.contactName ||
                  "Client"}
              </p>

              {client.contactName &&
              client.contactName !==
                client.businessName ? (
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {
                    client.contactName
                  }
                </p>
              ) : null}

              {client.jobTitle ? (
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {
                    client.jobTitle
                  }
                </p>
              ) : null}

              {client.email ? (
                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  {
                    client.email
                  }
                </p>
              ) : null}

              {client.phone ? (
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {
                    client.phone
                  }
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetaCard
            icon={
              CalendarDays
            }
            label="Issue date"
            value={formatDate(
              invoice.issueDate
            )}
          />

          <MetaCard
            icon={
              CalendarDays
            }
            label="Due date"
            value={formatDate(
              invoice.dueDate
            )}
          />

          <MetaCard
            icon={
              ReceiptText
            }
            label="Status"
            value={
              statusLabels[
                invoice.status
              ] ||
              invoice.status
            }
          />

          <MetaCard
            icon={FileText}
            label="Currency"
            value={
              invoice.currency ||
              "GHS"
            }
          />
        </div>

        <section className="mt-6 rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-6 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <ReceiptText
                size={16}
                className="text-[var(--brand-secondary)]"
              />
            </div>

            <h2 className="text-lg font-semibold text-white">
              Invoice items
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.07] text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  <th className="pb-3 pr-4 font-semibold">
                    Description
                  </th>

                  <th className="pb-3 px-4 text-right font-semibold">
                    Qty
                  </th>

                  <th className="pb-3 px-4 text-right font-semibold">
                    Unit price
                  </th>

                  <th className="pb-3 pl-4 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={
                        item._id ||
                        `${item.description}-${index}`
                      }
                      className="border-b border-white/[0.05]"
                    >
                      <td className="py-4 pr-4 text-sm text-white">
                        {
                          item.description
                        }
                      </td>

                      <td className="px-4 py-4 text-right text-sm text-[var(--text-secondary)]">
                        {
                          item.quantity
                        }
                      </td>

                      <td className="px-4 py-4 text-right text-sm text-[var(--text-secondary)]">
                        {formatCurrency(
                          item.unitPrice,
                          invoice.currency
                        )}
                      </td>

                      <td className="py-4 pl-4 text-right text-sm font-semibold text-white">
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
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <WalletCards
                  size={16}
                  className="text-[var(--brand-secondary)]"
                />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Payment summary
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBox
                label="Amount paid"
                value={formatCurrency(
                  invoice.amountPaid,
                  invoice.currency
                )}
              />

              <InfoBox
                label="Balance due"
                value={formatCurrency(
                  invoice.balanceDue,
                  invoice.currency
                )}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-6">
            <div className="space-y-3">
              <AmountRow
                label="Subtotal"
                value={formatCurrency(
                  invoice.subtotal,
                  invoice.currency
                )}
              />

              <AmountRow
                label="Discount"
                value={formatCurrency(
                  invoice.discount,
                  invoice.currency
                )}
              />

              <AmountRow
                label="Tax"
                value={formatCurrency(
                  invoice.tax,
                  invoice.currency
                )}
              />

              <div className="border-t border-white/[0.08] pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-white">
                    Total
                  </span>

                  <span className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {formatCurrency(
                      invoice.total,
                      invoice.currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {invoice.paymentTerms ? (
          <section className="mt-6 rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-white">
              Payment terms
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">
              {
                invoice.paymentTerms
              }
            </p>
          </section>
        ) : null}

        <div className="mt-8 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-emerald-300"
            />

            <div>
              <p className="text-sm font-semibold text-white">
                Secure client view
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                This invoice is read-only.
                Internal notes, cancellation
                details, administrative records
                and editing controls are not
                included in this shared view.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-[var(--border-primary)]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-7 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>
            BonaForge by Bona Fide
          </span>

          <span>
            Secure invoice sharing
          </span>
        </div>
      </footer>
    </main>
  );
}

function MetaCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Icon size={14} />

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-xs text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function AmountRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--text-muted)]">
        {label}
      </span>

      <span className="font-medium text-[var(--text-secondary)]">
        {value}
      </span>
    </div>
  );
}

export default SharedInvoicePage;