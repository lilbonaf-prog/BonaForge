import {
  escapeHtml,
  formatPrintCurrency,
  formatPrintDate,
  formatPrintText,
  openPrintDocument,
} from "./documentPrint";

const invoiceStatusLabels = {
  draft: "Draft",
  sent: "Sent",
  partially_paid:
    "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

const getClientName = (
  invoice
) =>
  invoice?.business?.name ||
  invoice?.lead
    ?.companyName ||
  invoice?.lead?.name ||
  "Client";

const getInvoiceItemsHtml = (
  invoice
) => {
  const items =
    Array.isArray(
      invoice?.items
    )
      ? invoice.items
      : [];

  if (
    items.length === 0
  ) {
    return `
      <tr>
        <td colspan="4">
          No invoice items available.
        </td>
      </tr>
    `;
  }

  return items
    .map(
      (item) => `
        <tr>
          <td>
            ${escapeHtml(
              item.description ||
                "Item"
            )}
          </td>

          <td class="bf-number">
            ${escapeHtml(
              item.quantity ?? 0
            )}
          </td>

          <td class="bf-number">
            ${escapeHtml(
              formatPrintCurrency(
                item.unitPrice,
                invoice.currency
              )
            )}
          </td>

          <td class="bf-number bf-strong">
            ${escapeHtml(
              formatPrintCurrency(
                item.amount,
                invoice.currency
              )
            )}
          </td>
        </tr>
      `
    )
    .join("");
};

export const printInvoice = (
  invoice
) => {
  if (!invoice) {
    return {
      success: false,

      message:
        "Invoice data is unavailable.",
    };
  }

  const clientName =
    getClientName(
      invoice
    );

  const statusLabel =
    invoiceStatusLabels[
      invoice.status
    ] ||
    invoice.status ||
    "Draft";

  const invoiceNumber =
    invoice.invoiceNumber ||
    "Invoice";

  const title =
    invoice.title ||
    invoiceNumber;

  const itemsHtml =
    getInvoiceItemsHtml(
      invoice
    );

  const paymentTerms =
    invoice.paymentTerms
      ? formatPrintText(
          invoice.paymentTerms
        )
      : "No payment terms provided.";

  const notes =
    invoice.notes
      ? formatPrintText(
          invoice.notes
        )
      : "No additional notes.";

  const cancellationHtml =
    invoice.status ===
    "cancelled"
      ? `
        <section class="bf-section">
          <h2 class="bf-section-title bf-danger">
            Cancellation
          </h2>

          <p class="bf-section-text bf-danger">
            ${
              invoice.cancellationReason
                ? formatPrintText(
                    invoice.cancellationReason
                  )
                : "No cancellation reason provided."
            }
          </p>
        </section>
      `
      : "";

  const content = `
    <main class="bf-document">
      <header class="bf-document-header">
        <div>
          <h1 class="bf-brand">
            BonaForge
          </h1>

          <div class="bf-brand-subtitle">
            Client Acquisition OS
          </div>
        </div>

        <div>
          <h2 class="bf-document-type">
            INVOICE
          </h2>

          <div class="bf-document-number">
            ${escapeHtml(
              invoiceNumber
            )}
          </div>

          <div style="text-align:right;">
            <span class="bf-status">
              ${escapeHtml(
                statusLabel
              )}
            </span>
          </div>
        </div>
      </header>

      <section class="bf-meta-grid">
        <div>
          <div class="bf-label">
            Bill to
          </div>

          <div class="bf-client-name">
            ${escapeHtml(
              clientName
            )}
          </div>

          ${
            invoice?.lead?.name &&
            invoice.lead.name !==
              clientName
              ? `
                <div
                  class="bf-muted"
                  style="margin-top:5px;"
                >
                  Contact:
                  ${escapeHtml(
                    invoice.lead.name
                  )}
                </div>
              `
              : ""
          }

          ${
            invoice?.lead?.email
              ? `
                <div class="bf-muted">
                  ${escapeHtml(
                    invoice.lead.email
                  )}
                </div>
              `
              : ""
          }

          ${
            invoice?.lead?.phone
              ? `
                <div class="bf-muted">
                  ${escapeHtml(
                    invoice.lead.phone
                  )}
                </div>
              `
              : ""
          }

          <div
            style="
              margin-top:18px;
              font-size:18px;
              font-weight:700;
            "
          >
            ${escapeHtml(
              title
            )}
          </div>
        </div>

        <div class="bf-date-grid">
          <div class="bf-date-box">
            <div class="bf-label">
              Issue date
            </div>

            <div class="bf-date-value">
              ${escapeHtml(
                formatPrintDate(
                  invoice.issueDate
                )
              )}
            </div>
          </div>

          <div class="bf-date-box">
            <div class="bf-label">
              Due date
            </div>

            <div class="bf-date-value">
              ${escapeHtml(
                formatPrintDate(
                  invoice.dueDate
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <table class="bf-table">
        <thead>
          <tr>
            <th>
              Description
            </th>

            <th>
              Qty
            </th>

            <th>
              Unit price
            </th>

            <th>
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="bf-summary-wrap">
        <div class="bf-summary">
          <div class="bf-summary-row">
            <span>
              Subtotal
            </span>

            <strong>
              ${escapeHtml(
                formatPrintCurrency(
                  invoice.subtotal,
                  invoice.currency
                )
              )}
            </strong>
          </div>

          <div class="bf-summary-row">
            <span>
              Discount
            </span>

            <strong>
              ${escapeHtml(
                formatPrintCurrency(
                  invoice.discount,
                  invoice.currency
                )
              )}
            </strong>
          </div>

          <div class="bf-summary-row">
            <span>
              Tax
            </span>

            <strong>
              ${escapeHtml(
                formatPrintCurrency(
                  invoice.tax,
                  invoice.currency
                )
              )}
            </strong>
          </div>

          <div class="bf-summary-row bf-summary-total">
            <span>
              Total
            </span>

            <strong>
              ${escapeHtml(
                formatPrintCurrency(
                  invoice.total,
                  invoice.currency
                )
              )}
            </strong>
          </div>

          <div class="bf-summary-row">
            <span>
              Amount paid
            </span>

            <strong>
              ${escapeHtml(
                formatPrintCurrency(
                  invoice.amountPaid,
                  invoice.currency
                )
              )}
            </strong>
          </div>

          <div class="bf-highlight">
            <div
              style="
                display:flex;
                justify-content:space-between;
                gap:20px;
              "
            >
              <span>
                Balance due
              </span>

              <span>
                ${escapeHtml(
                  formatPrintCurrency(
                    invoice.balanceDue,
                    invoice.currency
                  )
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Payment terms
        </h2>

        <p class="bf-section-text">
          ${paymentTerms}
        </p>
      </section>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Notes
        </h2>

        <p class="bf-section-text">
          ${notes}
        </p>
      </section>

      ${cancellationHtml}

      <footer class="bf-footer">
        Generated from BonaForge •
        ${escapeHtml(
          invoiceNumber
        )}
      </footer>
    </main>
  `;

  return openPrintDocument({
    title:
      `${invoiceNumber} - ${title}`,

    content,
  });
};

export default printInvoice;