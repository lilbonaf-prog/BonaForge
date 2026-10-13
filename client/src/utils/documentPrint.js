export const escapeHtml = (
  value
) =>
  String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

export const formatPrintText = (
  value
) =>
  escapeHtml(
    value
  ).replace(
    /\n/g,
    "<br />"
  );

export const formatPrintDate = (
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

export const formatPrintCurrency = (
  value,
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
      Number(value) || 0
    );
  } catch {
    return `${currency || "GHS"} ${(
      Number(value) || 0
    ).toLocaleString()}`;
  }
};

const basePrintStyles = `
  @page {
    size: A4;
    margin: 14mm;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #111827;
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Arial,
      sans-serif;
  }

  body {
    font-size: 13px;
    line-height: 1.5;
  }

  .bf-document {
    width: 100%;
    max-width: 820px;
    margin: 0 auto;
  }

  .bf-document-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 28px;
    padding-bottom: 28px;
    border-bottom: 2px solid #111827;
  }

  .bf-brand {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .bf-brand-subtitle {
    margin-top: 3px;
    color: #6b7280;
    font-size: 11px;
  }

  .bf-document-type {
    margin: 0;
    text-align: right;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .bf-document-number {
    margin-top: 6px;
    text-align: right;
    color: #4b5563;
    font-size: 12px;
    font-weight: 600;
  }

  .bf-status {
    display: inline-block;
    margin-top: 9px;
    border: 1px solid #d1d5db;
    border-radius: 999px;
    padding: 4px 10px;
    color: #374151;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .bf-meta-grid {
    display: grid;
    grid-template-columns:
      minmax(0, 1.4fr)
      minmax(0, 1fr);
    gap: 34px;
    margin-top: 30px;
  }

  .bf-label {
    margin-bottom: 6px;
    color: #6b7280;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .bf-client-name {
    font-size: 18px;
    font-weight: 700;
  }

  .bf-muted {
    color: #6b7280;
  }

  .bf-date-grid {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .bf-date-box {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px;
  }

  .bf-date-value {
    font-weight: 700;
  }

  .bf-table {
    width: 100%;
    margin-top: 34px;
    border-collapse: collapse;
  }

  .bf-table th {
    border-bottom: 1px solid #9ca3af;
    padding: 10px 8px;
    color: #4b5563;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-align: left;
    text-transform: uppercase;
  }

  .bf-table th:not(:first-child) {
    text-align: right;
  }

  .bf-table td {
    border-bottom: 1px solid #e5e7eb;
    padding: 13px 8px;
    vertical-align: top;
  }

  .bf-number {
    white-space: nowrap;
    text-align: right;
  }

  .bf-strong {
    font-weight: 700;
  }

  .bf-summary-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }

  .bf-summary {
    width: min(330px, 100%);
  }

  .bf-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 7px 0;
    color: #4b5563;
  }

  .bf-summary-row strong {
    color: #111827;
  }

  .bf-summary-total {
    margin-top: 5px;
    border-top: 2px solid #111827;
    padding-top: 11px;
    color: #111827;
    font-size: 16px;
    font-weight: 800;
  }

  .bf-highlight {
    margin-top: 5px;
    border-radius: 10px;
    background: #f3f4f6;
    padding: 11px 12px;
    color: #111827;
    font-weight: 800;
  }

  .bf-section {
    margin-top: 30px;
    border-top: 1px solid #e5e7eb;
    padding-top: 18px;
  }

  .bf-section-title {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .bf-section-text {
    margin: 0;
    color: #4b5563;
  }

  .bf-danger {
    color: #991b1b;
  }

  .bf-footer {
    margin-top: 42px;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
    color: #9ca3af;
    font-size: 10px;
    text-align: center;
  }

  @media print {
    .bf-document {
      max-width: none;
    }
  }
`;

export const openPrintDocument = ({
  title,
  content,
  extraStyles = "",
}) => {
  const printWindow =
    window.open(
      "",
      "_blank",
      "width=980,height=1100"
    );

  if (!printWindow) {
    return {
      success: false,

      message:
        "Your browser blocked the print window. Please allow pop-ups for BonaForge and try again.",
    };
  }

  printWindow.opener =
    null;

  printWindow.document.open();

  printWindow.document.write(`
    <!doctype html>

    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          ${escapeHtml(
            title ||
              "BonaForge Document"
          )}
        </title>

        <style>
          ${basePrintStyles}

          ${extraStyles}
        </style>
      </head>

      <body>
        ${content}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onafterprint =
    () => {
      printWindow.close();
    };

  const triggerPrint =
    () => {
      printWindow.focus();

      printWindow.print();
    };

  if (
    printWindow.document
      .readyState ===
    "complete"
  ) {
    window.setTimeout(
      triggerPrint,
      150
    );
  } else {
    printWindow.addEventListener(
      "load",
      () =>
        window.setTimeout(
          triggerPrint,
          150
        ),
      {
        once: true,
      }
    );
  }

  return {
    success: true,
    message: "",
  };
};