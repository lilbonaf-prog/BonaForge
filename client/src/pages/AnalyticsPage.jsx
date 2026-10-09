import {
  useState,
} from "react";

import {
  Activity,
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FileText,
  FolderKanban,
  Loader2,
  ReceiptText,
  Target,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useAnalytics from "../features/analytics/useAnalytics";

// ==============================
// HELPERS
// ==============================

const formatCurrency = (
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

const formatCompactCurrency = (
  value,
  currency = "GHS"
) => {
  const amount =
    Number(value) || 0;

  try {
    return new Intl.NumberFormat(
      "en-GH",
      {
        style: "currency",
        currency:
          currency || "GHS",
        notation: "compact",
        maximumFractionDigits: 1,
      }
    ).format(amount);
  } catch {
    return `${currency || "GHS"} ${amount.toLocaleString()}`;
  }
};

const formatNumber = (
  value
) =>
  new Intl.NumberFormat(
    "en-GH"
  ).format(
    Number(value) || 0
  );

const formatPercent = (
  value
) =>
  `${Number(value) || 0}%`;

const statusLabels = {
  saved: "Saved",
  researching: "Researching",
  researched: "Researched",
  qualified: "Qualified",
  not_suitable: "Not suitable",
  converted: "Converted",

  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",

  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",

  planned: "Planned",
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",

  partially_paid:
    "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
};

const methodLabels = {
  bank_transfer:
    "Bank transfer",
  cash: "Cash",
  mobile_money:
    "Mobile money",
  card: "Card",
  cheque: "Cheque",
  other: "Other",
};

const monthOptions = [
  {
    label: "6 months",
    value: 6,
  },
  {
    label: "12 months",
    value: 12,
  },
  {
    label: "18 months",
    value: 18,
  },
  {
    label: "24 months",
    value: 24,
  },
];

const pieColors = [
  "#5B8FF9",
  "#61DDAA",
  "#F6BD16",
  "#9270CA",
  "#E8684A",
  "#6DC8EC",
];

// ==============================
// KPI CARD
// ==============================

const MetricCard = ({
  label,
  value,
  helper,
  icon: Icon,
}) => (
  <div className="relative min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
    <div className="min-w-0 pr-12">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <p className="mt-3 whitespace-nowrap text-[clamp(1.125rem,1.65vw,1.5rem)] font-semibold leading-none tracking-tight text-white tabular-nums">
        {value}
      </p>

      {helper ? (
        <p className="mt-2 text-xs leading-5 text-white/30">
          {helper}
        </p>
      ) : null}
    </div>

    <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/40 sm:right-5 sm:top-5 sm:h-10 sm:w-10 sm:rounded-2xl">
      <Icon size={17} />
    </div>
  </div>
);

// ==============================
// SECTION
// ==============================

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

// ==============================
// STATUS LIST
// ==============================

const StatusList = ({
  rows = [],
  showValue = false,
  currency = "GHS",
}) => {
  const total =
    rows.reduce(
      (
        sum,
        row
      ) =>
        sum +
        (Number(
          row.count
        ) || 0),
      0
    );

  return (
    <div className="space-y-3">
      {rows.map(
        (row) => {
          const count =
            Number(
              row.count
            ) || 0;

          const width =
            total > 0
              ? Math.max(
                  (count /
                    total) *
                    100,
                  count > 0
                    ? 4
                    : 0
                )
              : 0;

          return (
            <div
              key={
                row.status
              }
              className="rounded-2xl border border-white/[0.07] bg-black/10 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/65">
                    {statusLabels[
                      row.status
                    ] ||
                      row.status}
                  </p>

                  {showValue ? (
                    <p className="mt-1 whitespace-nowrap text-xs text-white/25">
                      {formatCurrency(
                        row.value,
                        currency
                      )}
                    </p>
                  ) : null}
                </div>

                <span className="shrink-0 text-sm font-semibold text-white/70">
                  {formatNumber(
                    count
                  )}
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-[var(--brand-secondary)]/70"
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};

// ==============================
// TOOLTIP
// ==============================

const AnalyticsTooltip = ({
  active,
  payload,
  label,
  currency = "GHS",
}) => {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0f16] px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-white/70">
        {label}
      </p>

      <div className="mt-2 space-y-1">
        {payload.map(
          (entry) => (
            <p
              key={
                entry.dataKey
              }
              className="text-xs text-white/45"
            >
              {entry.name}:{" "}

              <span className="font-semibold text-white/70">
                {entry.dataKey ===
                "revenue"
                  ? formatCurrency(
                      entry.value,
                      currency
                    )
                  : formatNumber(
                      entry.value
                    )}
              </span>
            </p>
          )
        )}
      </div>
    </div>
  );
};

// ==============================
// ANALYTICS PAGE
// ==============================

const AnalyticsPage = () => {
  const [
    months,
    setMonths,
  ] = useState(12);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useAnalytics({
    months,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-white/35" />

          <p className="mt-3 text-sm text-white/35">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (
    isError ||
    !data
  ) {
    return (
      <div className="mx-auto max-w-[900px] rounded-[26px] border border-rose-400/15 bg-rose-400/[0.05] p-6">
        <p className="font-semibold text-rose-100">
          Unable to load analytics
        </p>

        <p className="mt-2 text-sm text-rose-100/55">
          {error?.response
            ?.data?.message ||
            error?.message ||
            "Something went wrong while loading analytics."}
        </p>

        <button
          type="button"
          onClick={() =>
            refetch()
          }
          className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const currency =
    data.currency ||
    "GHS";

  const summary =
    data.summary || {};

  const pipeline =
    data.pipeline || {};

  const proposals =
    data.proposals || {};

  const quotations =
    data.quotations || {};

  const projects =
    data.projects || {};

  const billing =
    data.billing || {};

  const businesses =
    data.businesses || {};

  const monthlyTrend =
    data.trends
      ?.monthly || [];

  const paymentMethods =
    billing.payments
      ?.methodBreakdown ||
    [];

  const paymentPieData =
    paymentMethods
      .filter(
        (row) =>
          Number(
            row.amount
          ) > 0
      )
      .map(
        (row) => ({
          name:
            methodLabels[
              row.method
            ] ||
            row.method,

          value:
            Number(
              row.amount
            ) || 0,
        })
      );

  const pipelineChartData =
    (
      pipeline.statusBreakdown ||
      []
    ).map(
      (row) => ({
        name:
          statusLabels[
            row.status
          ] ||
          row.status,

        count:
          Number(
            row.count
          ) || 0,

        value:
          Number(
            row.value
          ) || 0,
      })
    );

  const leadsInPeriod =
    monthlyTrend.reduce(
      (
        sum,
        row
      ) =>
        sum +
        (Number(
          row.leads
        ) || 0),
      0
    );

  const businessesInPeriod =
    monthlyTrend.reduce(
      (
        sum,
        row
      ) =>
        sum +
        (Number(
          row.businesses
        ) || 0),
      0
    );

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-7 p-4 md:p-6 xl:p-8">
      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}

      <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3
                size={18}
                className="text-[var(--brand-secondary)]"
              />

              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/30">
                Business intelligence
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Analytics
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/35">
              Track revenue,
              pipeline performance,
              projects, billing and
              client acquisition from
              one workspace.
            </p>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
              Trend period
            </label>

            <select
              value={
                months
              }
              onChange={(
                event
              ) =>
                setMonths(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              className="mt-2 min-w-[150px] rounded-xl border border-white/10 bg-[#0b0f16] px-4 py-2.5 text-sm text-white/65 outline-none"
            >
              {monthOptions.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* MAIN KPI CARDS */}
      {/* ============================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={formatCurrency(
            summary.revenue,
            currency
          )}
          helper="Completed payments received"
          icon={
            CircleDollarSign
          }
        />

        <MetricCard
          label="Pipeline value"
          value={formatCurrency(
            summary.pipelineValue,
            currency
          )}
          helper={`${formatNumber(
            pipeline.openLeads
          )} open leads`}
          icon={
            TrendingUp
          }
        />

        <MetricCard
          label="Outstanding"
          value={formatCurrency(
            summary.outstandingBalance,
            currency
          )}
          helper={`${formatCurrency(
            summary.overdueBalance,
            currency
          )} overdue`}
          icon={
            ReceiptText
          }
        />

        <MetricCard
          label="Lead conversion"
          value={formatPercent(
            summary.leadConversionRate
          )}
          helper={`${formatNumber(
            summary.wonLeads
          )} won • ${formatNumber(
            summary.lostLeads
          )} lost`}
          icon={
            Target
          }
        />
      </section>

      {/* ============================== */}
      {/* SECONDARY KPI CARDS */}
      {/* ============================== */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Businesses"
          value={formatNumber(
            summary.businesses
          )}
          icon={
            BriefcaseBusiness
          }
        />

        <MetricCard
          label="Leads"
          value={formatNumber(
            summary.leads
          )}
          icon={
            UsersRound
          }
        />

        <MetricCard
          label="Proposals"
          value={formatNumber(
            summary.proposals
          )}
          icon={
            FileText
          }
        />

        <MetricCard
          label="Quotations"
          value={formatNumber(
            summary.quotations
          )}
          icon={
            ReceiptText
          }
        />

        <MetricCard
          label="Projects"
          value={formatNumber(
            summary.projects
          )}
          icon={
            FolderKanban
          }
        />

        <MetricCard
          label="Invoices"
          value={formatNumber(
            summary.invoices
          )}
          icon={
            WalletCards
          }
        />
      </section>

      {/* ============================== */}
      {/* REVENUE TREND */}
      {/* ============================== */}

      <Section
        title="Revenue & acquisition trend"
        description="Completed payment revenue with new lead and business growth over time."
      >
        <div className="h-[360px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={
                monthlyTrend
              }
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--brand-secondary)"
                    stopOpacity={0.28}
                  />

                  <stop
                    offset="100%"
                    stopColor="var(--brand-secondary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                vertical={
                  false
                }
              />

              <XAxis
                dataKey="label"
                axisLine={
                  false
                }
                tickLine={
                  false
                }
                tick={{
                  fill:
                    "rgba(255,255,255,0.30)",
                  fontSize: 11,
                }}
              />

              <YAxis
                axisLine={
                  false
                }
                tickLine={
                  false
                }
                tick={{
                  fill:
                    "rgba(255,255,255,0.25)",
                  fontSize: 11,
                }}
                tickFormatter={(
                  value
                ) =>
                  formatCompactCurrency(
                    value,
                    currency
                  )
                }
              />

              <Tooltip
                content={
                  <AnalyticsTooltip
                    currency={
                      currency
                    }
                  />
                }
              />

              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="var(--brand-secondary)"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
            <p className="text-xs text-white/30">
              New leads in period
            </p>

            <p className="mt-2 whitespace-nowrap text-xl font-semibold text-white tabular-nums">
              {formatNumber(
                leadsInPeriod
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
            <p className="text-xs text-white/30">
              New businesses in period
            </p>

            <p className="mt-2 whitespace-nowrap text-xl font-semibold text-white tabular-nums">
              {formatNumber(
                businessesInPeriod
              )}
            </p>
          </div>
        </div>
      </Section>

      {/* ============================== */}
      {/* PIPELINE + PAYMENT METHODS */}
      {/* ============================== */}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Section
          title="Lead pipeline"
          description="Current lead distribution across the sales process."
        >
          <div className="h-[350px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  pipelineChartData
                }
                layout="vertical"
                margin={{
                  top: 0,
                  right: 20,
                  left: 20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  horizontal={
                    false
                  }
                />

                <XAxis
                  type="number"
                  allowDecimals={
                    false
                  }
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  tick={{
                    fill:
                      "rgba(255,255,255,0.25)",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  tick={{
                    fill:
                      "rgba(255,255,255,0.35)",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  content={
                    <AnalyticsTooltip
                      currency={
                        currency
                      }
                    />
                  }
                />

                <Bar
                  dataKey="count"
                  name="Leads"
                  fill="var(--brand-secondary)"
                  radius={[
                    0,
                    6,
                    6,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section
          title="Payment methods"
          description="How completed revenue has been received."
        >
          {paymentPieData.length >
          0 ? (
            <>
              <div className="h-[240px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        paymentPieData
                      }
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={4}
                    >
                      {paymentPieData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={
                              pieColors[
                                index %
                                  pieColors.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(
                        value
                      ) =>
                        formatCurrency(
                          value,
                          currency
                        )
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {paymentMethods.map(
                  (row) => (
                    <div
                      key={
                        row.method
                      }
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white/55">
                          {methodLabels[
                            row.method
                          ] ||
                            row.method}
                        </p>

                        <p className="mt-0.5 text-[10px] text-white/25">
                          {formatNumber(
                            row.count
                          )}{" "}
                          payments
                        </p>
                      </div>

                      <p className="shrink-0 whitespace-nowrap text-xs font-semibold text-white/65">
                        {formatCurrency(
                          row.amount,
                          currency
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/10 text-center">
              <div>
                <Banknote
                  size={28}
                  className="mx-auto text-white/15"
                />

                <p className="mt-3 text-sm font-medium text-white/40">
                  No payment data yet
                </p>
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* ============================== */}
      {/* SALES PERFORMANCE */}
      {/* ============================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Proposal performance"
          description="Acceptance performance across all proposals."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Total"
              value={formatNumber(
                proposals.total
              )}
              icon={
                FileText
              }
            />

            <MetricCard
              label="Accepted"
              value={formatNumber(
                proposals.accepted
              )}
              icon={
                Target
              }
            />

            <MetricCard
              label="Acceptance"
              value={formatPercent(
                proposals.acceptanceRate
              )}
              icon={
                TrendingUp
              }
            />
          </div>

          <div className="mt-4">
            <StatusList
              rows={
                proposals.statusBreakdown ||
                []
              }
              showValue
              currency={
                currency
              }
            />
          </div>
        </Section>

        <Section
          title="Quotation performance"
          description="Track quotation acceptance and value conversion."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Total"
              value={formatNumber(
                quotations.total
              )}
              icon={
                ReceiptText
              }
            />

            <MetricCard
              label="Accepted"
              value={formatNumber(
                quotations.accepted
              )}
              icon={
                Target
              }
            />

            <MetricCard
              label="Acceptance"
              value={formatPercent(
                quotations.acceptanceRate
              )}
              icon={
                TrendingUp
              }
            />
          </div>

          <div className="mt-4">
            <StatusList
              rows={
                quotations.statusBreakdown ||
                []
              }
              showValue
              currency={
                currency
              }
            />
          </div>
        </Section>
      </div>

      {/* ============================== */}
      {/* PROJECT + BILLING */}
      {/* ============================== */}

      <div className="grid gap-6 xl:grid-cols-2">
        <Section
          title="Project performance"
          description="Delivery activity and commercial project value."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Active"
              value={formatNumber(
                projects.active
              )}
              icon={
                Activity
              }
            />

            <MetricCard
              label="Completed"
              value={formatNumber(
                projects.completed
              )}
              icon={
                FolderKanban
              }
            />

            <MetricCard
              label="Completion"
              value={formatPercent(
                projects.completionRate
              )}
              icon={
                TrendingUp
              }
            />

            <MetricCard
              label="Avg progress"
              value={formatPercent(
                projects.averageProgress
              )}
              icon={
                BarChart3
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/10 p-4">
            <p className="text-xs text-white/30">
              Total project value
            </p>

            <p className="mt-2 whitespace-nowrap text-2xl font-semibold text-white tabular-nums">
              {formatCurrency(
                projects.totalValue,
                currency
              )}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/20">
                  Active value
                </p>

                <p className="mt-1 whitespace-nowrap text-sm font-semibold text-white/60 tabular-nums">
                  {formatCurrency(
                    projects.activeValue,
                    currency
                  )}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/20">
                  Completed value
                </p>

                <p className="mt-1 whitespace-nowrap text-sm font-semibold text-white/60 tabular-nums">
                  {formatCurrency(
                    projects.completedValue,
                    currency
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <StatusList
              rows={
                projects.statusBreakdown ||
                []
              }
              showValue
              currency={
                currency
              }
            />
          </div>
        </Section>

        <Section
          title="Billing performance"
          description="Invoice value, outstanding balances and received revenue."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Invoiced"
              value={formatCurrency(
                billing.invoicedTotal,
                currency
              )}
              icon={
                ReceiptText
              }
            />

            <MetricCard
              label="Revenue"
              value={formatCurrency(
                billing.payments
                  ?.revenue,
                currency
              )}
              icon={
                CircleDollarSign
              }
            />

            <MetricCard
              label="Outstanding"
              value={formatCurrency(
                billing.outstandingBalance,
                currency
              )}
              icon={
                WalletCards
              }
            />

            <MetricCard
              label="Overdue"
              value={formatCurrency(
                billing.overdueBalance,
                currency
              )}
              icon={
                Banknote
              }
            />
          </div>

          <div className="mt-4">
            <StatusList
              rows={
                billing.invoiceStatus ||
                []
              }
              showValue
              currency={
                currency
              }
            />
          </div>
        </Section>
      </div>

      {/* ============================== */}
      {/* BUSINESS ACQUISITION */}
      {/* ============================== */}

      <Section
        title="Business acquisition"
        description="Business records moving from research to conversion."
      >
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <MetricCard
            label="Businesses"
            value={formatNumber(
              businesses.total
            )}
            icon={
              BriefcaseBusiness
            }
          />

          <MetricCard
            label="Converted"
            value={formatNumber(
              businesses.converted
            )}
            icon={
              Target
            }
          />
        </div>

        <StatusList
          rows={
            businesses.statusBreakdown ||
            []
          }
        />
      </Section>
    </div>
  );
};

export default AnalyticsPage;