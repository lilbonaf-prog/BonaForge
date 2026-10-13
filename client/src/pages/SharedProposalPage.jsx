import {
  useParams,
} from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Command,
  FileText,
  Loader2,
  ShieldCheck,
  Target,
} from "lucide-react";

import {
  getPublicProposalByToken,
} from "../services/proposalService";

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
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

function SharedProposalPage() {
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
      "proposal",
      token,
    ],

    queryFn: () =>
      getPublicProposalByToken(
        token
      ),

    enabled:
      Boolean(token),

    retry: false,
  });

  const proposal =
    data?.proposal || null;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-5 text-white">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-[var(--brand-secondary)]"
          />

          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Loading shared proposal...
          </p>
        </div>
      </main>
    );
  }

  if (
    isError ||
    !proposal
  ) {
    const message =
      error?.response?.data?.message ||
      "This proposal link is invalid, expired or has been revoked.";

    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-5 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-[var(--border-primary)] bg-white/[0.025] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/15 bg-red-400/[0.06] text-red-300">
            <FileText
              size={21}
            />
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
            Proposal unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            {message}
          </p>
        </div>
      </main>
    );
  }

  const client =
    proposal.client || {};

  const timeline =
    proposal.timeline || {};

  const pricing =
    proposal.pricingOverview ||
    {};

  const scope =
    Array.isArray(
      proposal.scopeOfWork
    )
      ? proposal.scopeOfWork
      : [];

  const objectives =
    Array.isArray(
      proposal.objectives
    )
      ? proposal.objectives
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

      {/* Header */}

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

            Secure read-only proposal
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 py-10 sm:px-8 lg:py-14">
        {/* Proposal hero */}

        <section className="rounded-[28px] border border-[var(--border-primary)] bg-white/[0.025] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[var(--border-primary)] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                  {
                    proposal.proposalNumber
                  }
                </span>

                <span className="rounded-full border border-indigo-400/15 bg-indigo-400/[0.07] px-3 py-1.5 text-xs font-semibold text-indigo-200">
                  {
                    statusLabels[
                      proposal.status
                    ] ||
                    proposal.status
                  }
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
                {
                  proposal.title
                }
              </h1>

              {proposal.summary ? (
                <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  {
                    proposal.summary
                  }
                </p>
              ) : null}
            </div>

            <div className="min-w-[250px] rounded-2xl border border-[var(--border-primary)] bg-black/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Prepared for
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

        {/* Meta */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetaCard
            icon={
              CalendarDays
            }
            label="Proposal date"
            value={formatDate(
              proposal.createdAt
            )}
          />

          <MetaCard
            icon={
              CalendarDays
            }
            label="Valid until"
            value={formatDate(
              proposal.validUntil
            )}
          />

          <MetaCard
            icon={Clock3}
            label="Duration"
            value={
              timeline.estimatedDuration ||
              "Not set"
            }
          />

          <MetaCard
            icon={
              FileText
            }
            label="Status"
            value={
              statusLabels[
                proposal.status
              ] ||
              proposal.status
            }
          />
        </div>

        {/* Client problem */}

        {proposal.clientProblem ? (
          <Section
            title="Understanding your challenge"
            icon={Target}
          >
            <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">
              {
                proposal.clientProblem
              }
            </p>
          </Section>
        ) : null}

        {/* Solution */}

        {proposal.proposedSolution ? (
          <Section
            title="Proposed solution"
            icon={CheckCircle2}
          >
            <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">
              {
                proposal.proposedSolution
              }
            </p>
          </Section>
        ) : null}

        {/* Objectives */}

        {objectives.length >
        0 ? (
          <Section
            title="Objectives"
            icon={Target}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {objectives.map(
                (
                  objective,
                  index
                ) => (
                  <div
                    key={`${objective}-${index}`}
                    className="flex gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.07] text-emerald-300">
                      <CheckCircle2
                        size={14}
                      />
                    </div>

                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {
                        objective
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </Section>
        ) : null}

        {/* Scope */}

        {scope.length > 0 ? (
          <Section
            title="Scope of work"
            icon={FileText}
          >
            <div className="space-y-4">
              {scope.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item._id ||
                      `${item.title}-${index}`
                    }
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                        {
                          index +
                          1
                        }
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-white">
                          {
                            item.title
                          }
                        </h3>

                        {item.description ? (
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)]">
                            {
                              item.description
                            }
                          </p>
                        ) : null}

                        {Array.isArray(
                          item.deliverables
                        ) &&
                        item.deliverables
                          .length >
                          0 ? (
                          <div className="mt-4 space-y-2">
                            {item.deliverables.map(
                              (
                                deliverable,
                                deliverableIndex
                              ) => (
                                <div
                                  key={`${deliverable}-${deliverableIndex}`}
                                  className="flex items-start gap-2 text-sm text-[var(--text-muted)]"
                                >
                                  <CheckCircle2
                                    size={
                                      14
                                    }
                                    className="mt-0.5 shrink-0 text-emerald-300"
                                  />

                                  <span>
                                    {
                                      deliverable
                                    }
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </Section>
        ) : null}

        {/* Timeline */}

        <Section
          title="Timeline"
          icon={Clock3}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoBox
              label="Estimated duration"
              value={
                timeline.estimatedDuration ||
                "Not set"
              }
            />

            <InfoBox
              label="Start date"
              value={formatDate(
                timeline.startDate
              )}
            />

            <InfoBox
              label="End date"
              value={formatDate(
                timeline.endDate
              )}
            />
          </div>
        </Section>

        {/* Pricing */}

        <Section
          title="Investment"
          icon={FileText}
        >
          <div className="rounded-2xl border border-indigo-400/15 bg-indigo-400/[0.045] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">
              Estimated investment
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              {formatCurrency(
                pricing.estimatedAmount,
                pricing.currency
              )}
            </p>

            {pricing.note ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)]">
                {
                  pricing.note
                }
              </p>
            ) : null}
          </div>
        </Section>

        {/* Terms */}

        {proposal.termsAndConditions ? (
          <Section
            title="Terms and conditions"
            icon={ShieldCheck}
          >
            <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">
              {
                proposal.termsAndConditions
              }
            </p>
          </Section>
        ) : null}

        {/* Footer notice */}

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
                This page is read-only.
                Administrative notes, internal
                records and editing controls are
                not included in this shared view.
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
            Secure proposal sharing
          </span>
        </div>
      </footer>
    </main>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section className="mt-6 rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          <Icon
            size={16}
            className="text-[var(--brand-secondary)]"
          />
        </div>

        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>
      </div>

      {children}
    </section>
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

export default SharedProposalPage;