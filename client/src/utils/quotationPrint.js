import {
  escapeHtml,
  formatPrintCurrency,
  formatPrintDate,
  formatPrintText,
  openPrintDocument,
} from "./documentPrint";

const quotationStatusLabels = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

const getClientName = (
  quotation
) =>
  quotation?.business?.name ||
  quotation?.lead?.companyName ||
  quotation?.lead?.name ||
  "Client";

const getLineItemsHtml = (
  quotation
) => {
  const items =
    Array.isArray(
      quotation?.lineItems
    )
      ? quotation.lineItems
      : [];

  if (
    items.length === 0
  ) {
    return `
      <tr>
        <td colspan="4">
          No quotation items available.
        </td>
      </tr>
    `;
  }

  return items
    .map(
      (item) => {
        const quantity =
          Number(
            item.quantity
          ) || 0;

        const unitPrice =
          Number(
            item.unitPrice
          ) || 0;

        const amount =
          item.amount !==
            undefined &&
          item.amount !==
            null
            ? Number(
                item.amount
              ) || 0
            : quantity *
              unitPrice;

        return `
          <tr>
            <td>
              ${escapeHtml(
                item.description ||
                  "Item"
              )}
            </td>

            <td class="bf-number">
              ${escapeHtml(
                quantity
              )}
            </td>

            <td class="bf-number">
              ${escapeHtml(
                formatPrintCurrency(
                  unitPrice,
                  quotation.currency
                )
              )}
            </td>

            <td class="bf-number bf-strong">
              ${escapeHtml(
                formatPrintCurrency(
                  amount,
                  quotation.currency
                )
              )}
            </td>
          </tr>
        `;
      }
    )
    .join("");
};

export const printQuotation = (
  quotation
) => {
  if (!quotation) {
    return {
      success: false,

      message:
        "Quotation data is unavailable.",
    };
  }

  const clientName =
    getClientName(
      quotation
    );

  const quotationNumber =
    quotation.quotationNumber ||
    "Quotation";

  const title =
    quotation.title ||
    quotationNumber;

  const statusLabel =
    quotationStatusLabels[
      quotation.status
    ] ||
    quotation.status ||
    "Draft";

  const itemsHtml =
    getLineItemsHtml(
      quotation
    );

  const paymentTerms =
    quotation.paymentTerms
      ? formatPrintText(
          quotation.paymentTerms
        )
      : "No payment terms provided.";

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
            QUOTATION
          </h2>

          <div class="bf-document-number">
            ${escapeHtml(
              quotationNumber
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
            Prepared for
          </div>

          <div class="bf-client-name">
            ${escapeHtml(
              clientName
            )}
          </div>

          ${
            quotation?.lead?.name &&
            quotation.lead.name !==
              clientName
              ? `
                <div
                  class="bf-muted"
                  style="margin-top:5px;"
                >
                  Contact:
                  ${escapeHtml(
                    quotation.lead.name
                  )}
                </div>
              `
              : ""
          }

          ${
            quotation?.lead?.email
              ? `
                <div class="bf-muted">
                  ${escapeHtml(
                    quotation.lead.email
                  )}
                </div>
              `
              : ""
          }

          ${
            quotation?.lead?.phone
              ? `
                <div class="bf-muted">
                  ${escapeHtml(
                    quotation.lead.phone
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
              Quotation date
            </div>

            <div class="bf-date-value">
              ${escapeHtml(
                formatPrintDate(
                  quotation.createdAt
                )
              )}
            </div>
          </div>

          <div class="bf-date-box">
            <div class="bf-label">
              Valid until
            </div>

            <div class="bf-date-value">
              ${escapeHtml(
                formatPrintDate(
                  quotation.validUntil
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
                  quotation.subtotal,
                  quotation.currency
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
                  quotation.discount,
                  quotation.currency
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
                  quotation.tax,
                  quotation.currency
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
                  quotation.total,
                  quotation.currency
                )
              )}
            </strong>
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
          Validity
        </h2>

        <p class="bf-section-text">
          This quotation is valid until
          <strong>
            ${escapeHtml(
              formatPrintDate(
                quotation.validUntil
              )
            )}
          </strong>.
        </p>
      </section>

      <footer class="bf-footer">
        Generated from BonaForge •
        ${escapeHtml(
          quotationNumber
        )}
      </footer>
    </main>
  `;

  return openPrintDocument({
    title:
      `${quotationNumber} - ${title}`,

    content,
  });
};

export default printQuotation;