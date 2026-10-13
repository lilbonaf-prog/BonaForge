import {
  escapeHtml,
  formatPrintCurrency,
  formatPrintDate,
  formatPrintText,
  openPrintDocument,
} from "./documentPrint";

const proposalStatusLabels = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

const getClientName = (
  proposal
) =>
  proposal?.business?.name ||
  proposal?.lead?.companyName ||
  proposal?.lead?.name ||
  "Client";

const buildObjectives = (
  proposal
) => {
  const objectives =
    Array.isArray(
      proposal?.objectives
    )
      ? proposal.objectives
      : [];

  if (
    objectives.length === 0
  ) {
    return `
      <p class="bf-section-text">
        No objectives provided.
      </p>
    `;
  }

  return `
    <ul class="bf-proposal-list">
      ${objectives
        .map(
          (objective) => `
            <li>
              ${escapeHtml(
                objective
              )}
            </li>
          `
        )
        .join("")}
    </ul>
  `;
};

const buildScope = (
  proposal
) => {
  const scope =
    Array.isArray(
      proposal?.scopeOfWork
    )
      ? proposal.scopeOfWork
      : [];

  if (
    scope.length === 0
  ) {
    return `
      <p class="bf-section-text">
        No scope of work provided.
      </p>
    `;
  }

  return scope
    .map(
      (
        item,
        index
      ) => {
        const deliverables =
          Array.isArray(
            item?.deliverables
          )
            ? item.deliverables
            : [];

        return `
          <div class="bf-scope-item">
            <div class="bf-scope-number">
              ${index + 1}
            </div>

            <div class="bf-scope-content">
              <h3 class="bf-scope-title">
                ${escapeHtml(
                  item?.title ||
                    `Scope item ${index + 1}`
                )}
              </h3>

              ${
                item?.description
                  ? `
                    <p class="bf-section-text">
                      ${formatPrintText(
                        item.description
                      )}
                    </p>
                  `
                  : ""
              }

              ${
                deliverables.length >
                0
                  ? `
                    <div class="bf-deliverables">
                      <div class="bf-label">
                        Deliverables
                      </div>

                      <ul class="bf-proposal-list">
                        ${deliverables
                          .map(
                            (
                              deliverable
                            ) => `
                              <li>
                                ${escapeHtml(
                                  deliverable
                                )}
                              </li>
                            `
                          )
                          .join("")}
                      </ul>
                    </div>
                  `
                  : ""
              }
            </div>
          </div>
        `;
      }
    )
    .join("");
};

export const printProposal = (
  proposal
) => {
  if (!proposal) {
    return {
      success: false,

      message:
        "Proposal data is unavailable.",
    };
  }

  const proposalNumber =
    proposal.proposalNumber ||
    "Proposal";

  const title =
    proposal.title ||
    proposalNumber;

  const clientName =
    getClientName(
      proposal
    );

  const statusLabel =
    proposalStatusLabels[
      proposal.status
    ] ||
    proposal.status ||
    "Draft";

  const currency =
    proposal?.pricingOverview
      ?.currency ||
    "GHS";

  const estimatedAmount =
    proposal?.pricingOverview
      ?.estimatedAmount ||
    0;

  const pricingNote =
    proposal?.pricingOverview
      ?.note
      ? formatPrintText(
          proposal
            .pricingOverview
            .note
        )
      : "No pricing notes provided.";

  const summary =
    proposal.summary
      ? formatPrintText(
          proposal.summary
        )
      : "No proposal summary provided.";

  const clientProblem =
    proposal.clientProblem
      ? formatPrintText(
          proposal.clientProblem
        )
      : "No client problem provided.";

  const proposedSolution =
    proposal.proposedSolution
      ? formatPrintText(
          proposal.proposedSolution
        )
      : "No proposed solution provided.";

  const terms =
    proposal.termsAndConditions
      ? formatPrintText(
          proposal.termsAndConditions
        )
      : "No terms and conditions provided.";

  const objectivesHtml =
    buildObjectives(
      proposal
    );

  const scopeHtml =
    buildScope(
      proposal
    );

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
            PROPOSAL
          </h2>

          <div class="bf-document-number">
            ${escapeHtml(
              proposalNumber
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
            proposal?.lead?.name
              ? `
                <div
                  class="bf-muted"
                  style="margin-top:5px;"
                >
                  Contact:
                  ${escapeHtml(
                    proposal.lead.name
                  )}
                </div>
              `
              : ""
          }

          ${
            proposal?.lead
              ?.jobTitle
              ? `
                <div class="bf-muted">
                  ${escapeHtml(
                    proposal.lead
                      .jobTitle
                  )}
                </div>
              `
              : ""
          }

          ${
            proposal?.lead?.email
              ? `
                <div class="bf-muted">
                  ${escapeHtml(
                    proposal.lead.email
                  )}
                </div>
              `
              : ""
          }

          ${
            proposal?.lead?.phone
              ? `
                <div class="bf-muted">
                  ${escapeHtml(
                    proposal.lead.phone
                  )}
                </div>
              `
              : ""
          }

          <div
            style="
              margin-top:18px;
              font-size:20px;
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
              Proposal date
            </div>

            <div class="bf-date-value">
              ${escapeHtml(
                formatPrintDate(
                  proposal.createdAt
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
                  proposal.validUntil
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Proposal summary
        </h2>

        <p class="bf-section-text">
          ${summary}
        </p>
      </section>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Client problem
        </h2>

        <p class="bf-section-text">
          ${clientProblem}
        </p>
      </section>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Proposed solution
        </h2>

        <p class="bf-section-text">
          ${proposedSolution}
        </p>
      </section>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Objectives
        </h2>

        ${objectivesHtml}
      </section>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Scope of work
        </h2>

        ${scopeHtml}
      </section>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Timeline
        </h2>

        <div class="bf-proposal-grid">
          <div class="bf-date-box">
            <div class="bf-label">
              Estimated duration
            </div>

            <div class="bf-date-value">
              ${escapeHtml(
                proposal?.timeline
                  ?.estimatedDuration ||
                  "Not set"
              )}
            </div>
          </div>

          <div class="bf-date-box">
            <div class="bf-label">
              Start date
            </div>

            <div class="bf-date-value">
              ${escapeHtml(
                formatPrintDate(
                  proposal?.timeline
                    ?.startDate
                )
              )}
            </div>
          </div>

          <div class="bf-date-box">
            <div class="bf-label">
              End date
            </div>

            <div class="bf-date-value">
              ${escapeHtml(
                formatPrintDate(
                  proposal?.timeline
                    ?.endDate
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Pricing overview
        </h2>

        <div class="bf-pricing-card">
          <div>
            <div class="bf-label">
              Estimated investment
            </div>

            <div class="bf-proposal-price">
              ${escapeHtml(
                formatPrintCurrency(
                  estimatedAmount,
                  currency
                )
              )}
            </div>
          </div>

          <div>
            <div class="bf-label">
              Currency
            </div>

            <div class="bf-date-value">
              ${escapeHtml(
                currency
              )}
            </div>
          </div>
        </div>

        <div
          class="bf-section-text"
          style="margin-top:14px;"
        >
          ${pricingNote}
        </div>
      </section>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Terms and conditions
        </h2>

        <p class="bf-section-text">
          ${terms}
        </p>
      </section>

      <section class="bf-section">
        <h2 class="bf-section-title">
          Proposal validity
        </h2>

        <p class="bf-section-text">
          This proposal is valid until
          <strong>
            ${escapeHtml(
              formatPrintDate(
                proposal.validUntil
              )
            )}
          </strong>.
        </p>
      </section>

      <footer class="bf-footer">
        Generated from BonaForge •
        ${escapeHtml(
          proposalNumber
        )}
      </footer>
    </main>
  `;

  return openPrintDocument({
    title:
      `${proposalNumber} - ${title}`,

    content,

    extraStyles: `
      .bf-proposal-list {
        margin: 10px 0 0;
        padding-left: 20px;
        color: #4b5563;
      }

      .bf-proposal-list li {
        margin: 6px 0;
      }

      .bf-scope-item {
        display: flex;
        gap: 14px;
        margin-top: 16px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 15px;
        break-inside: avoid;
      }

      .bf-scope-number {
        display: flex;
        width: 28px;
        height: 28px;
        flex: 0 0 28px;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: #111827;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
      }

      .bf-scope-content {
        min-width: 0;
        flex: 1;
      }

      .bf-scope-title {
        margin: 0 0 7px;
        font-size: 14px;
        font-weight: 800;
      }

      .bf-deliverables {
        margin-top: 13px;
      }

      .bf-proposal-grid {
        display: grid;
        grid-template-columns:
          repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .bf-pricing-card {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
        border: 1px solid #d1d5db;
        border-radius: 12px;
        background: #f9fafb;
        padding: 18px;
        break-inside: avoid;
      }

      .bf-proposal-price {
        margin-top: 4px;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.03em;
      }

      @media print {
        .bf-section,
        .bf-date-box,
        .bf-pricing-card {
          break-inside: avoid;
        }
      }
    `,
  });
};

export default printProposal;