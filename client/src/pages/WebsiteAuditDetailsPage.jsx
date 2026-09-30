import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Gauge,
  Globe2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import useWebsiteAuditByBusiness from "../features/websiteAudit/useWebsiteAuditByBusiness";
import useStartWebsiteAudit from "../features/websiteAudit/useStartWebsiteAudit";
import useUpdateWebsiteAudit from "../features/websiteAudit/useUpdateWebsiteAudit";
import useCompleteWebsiteAudit from "../features/websiteAudit/useCompleteWebsiteAudit";
import useReopenWebsiteAudit from "../features/websiteAudit/useReopenWebsiteAudit";

const scoreFields = [
  {
    key: "performance",
    label: "Performance",
  },
  {
    key: "mobile",
    label: "Mobile",
  },
  {
    key: "seo",
    label: "SEO",
  },
  {
    key: "accessibility",
    label: "Accessibility",
  },
  {
    key: "content",
    label: "Content",
  },
  {
    key: "trust",
    label: "Trust",
  },
  {
    key: "ux",
    label: "UX",
  },
];

const technicalFields = [
  {
    key: "sslEnabled",
    label: "SSL enabled",
  },
  {
    key: "mobileResponsive",
    label: "Mobile responsive",
  },
  {
    key: "contactInformationVisible",
    label: "Contact information visible",
  },
  {
    key: "clearCallToAction",
    label: "Clear call to action",
  },
  {
    key: "socialLinksPresent",
    label: "Social links present",
  },
  {
    key: "analyticsDetected",
    label: "Analytics detected",
  },
  {
    key: "metadataPresent",
    label: "Metadata present",
  },
  {
    key: "sitemapPresent",
    label: "Sitemap present",
  },
  {
    key: "robotsTxtPresent",
    label: "Robots.txt present",
  },
];

const issueCategories = [
  "performance",
  "mobile",
  "seo",
  "accessibility",
  "content",
  "security",
  "trust",
  "ux",
  "technical",
  "other",
];

const issueSeverities = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

const priorities = [
  "low",
  "medium",
  "high",
  "urgent",
];

const impacts = [
  "low",
  "medium",
  "high",
];

const statusConfig = {
  draft: {
    label: "Draft",
    className:
      "border-slate-700 bg-slate-800/70 text-slate-300",
  },

  in_progress: {
    label: "In progress",
    className:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  },

  completed: {
    label: "Completed",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  },

  not_applicable: {
    label: "No website",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
  },
};

const severityConfig = {
  critical:
    "border-red-500/20 bg-red-500/10 text-red-300",

  high:
    "border-orange-500/20 bg-orange-500/10 text-orange-300",

  medium:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",

  low:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",

  info:
    "border-slate-700 bg-slate-800 text-slate-300",
};

const createEmptyIssue = () => ({
  title: "",
  category: "other",
  severity: "medium",
  description: "",
  evidence: "",
  recommendation: "",
});

const createEmptyOpportunity = () => ({
  title: "",
  service: "",
  priority: "medium",
  impact: "medium",
  description: "",
});

const createInitialForm = () => ({
  websiteUrl: "",
  auditMode: "manual",
  overallScore: "",

  scores: {
    performance: "",
    mobile: "",
    seo: "",
    accessibility: "",
    content: "",
    trust: "",
    ux: "",
  },

  technicalChecks: {
    sslEnabled: null,
    mobileResponsive: null,
    contactInformationVisible: null,
    clearCallToAction: null,
    socialLinksPresent: null,
    analyticsDetected: null,
    metadataPresent: null,
    sitemapPresent: null,
    robotsTxtPresent: null,
  },

  summary: "",
  strengths: [],
  issues: [],
  opportunities: [],
  recommendedServices: [],
  nextStep: "",
  notes: "",
});

const formatDate = (value) => {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
};

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const cleanStringArray = (
  values = []
) =>
  values
    .map((value) =>
      value.trim()
    )
    .filter(Boolean);

const normaliseAuditToForm = (
  audit
) => {
  if (!audit) {
    return createInitialForm();
  }

  return {
    websiteUrl:
      audit.websiteUrl || "",

    auditMode:
      audit.auditMode ||
      "manual",

    overallScore:
      audit.overallScore ??
      "",

    scores: {
      performance:
        audit.scores
          ?.performance ??
        "",

      mobile:
        audit.scores
          ?.mobile ??
        "",

      seo:
        audit.scores
          ?.seo ??
        "",

      accessibility:
        audit.scores
          ?.accessibility ??
        "",

      content:
        audit.scores
          ?.content ??
        "",

      trust:
        audit.scores
          ?.trust ??
        "",

      ux:
        audit.scores?.ux ??
        "",
    },

    technicalChecks: {
      sslEnabled:
        audit.technicalChecks
          ?.sslEnabled ??
        null,

      mobileResponsive:
        audit.technicalChecks
          ?.mobileResponsive ??
        null,

      contactInformationVisible:
        audit.technicalChecks
          ?.contactInformationVisible ??
        null,

      clearCallToAction:
        audit.technicalChecks
          ?.clearCallToAction ??
        null,

      socialLinksPresent:
        audit.technicalChecks
          ?.socialLinksPresent ??
        null,

      analyticsDetected:
        audit.technicalChecks
          ?.analyticsDetected ??
        null,

      metadataPresent:
        audit.technicalChecks
          ?.metadataPresent ??
        null,

      sitemapPresent:
        audit.technicalChecks
          ?.sitemapPresent ??
        null,

      robotsTxtPresent:
        audit.technicalChecks
          ?.robotsTxtPresent ??
        null,
    },

    summary:
      audit.summary || "",

    strengths:
      audit.strengths
        ? [...audit.strengths]
        : [],

    issues:
      audit.issues
        ? audit.issues.map(
            (issue) => ({
              title:
                issue.title ||
                "",

              category:
                issue.category ||
                "other",

              severity:
                issue.severity ||
                "medium",

              description:
                issue.description ||
                "",

              evidence:
                issue.evidence ||
                "",

              recommendation:
                issue.recommendation ||
                "",
            })
          )
        : [],

    opportunities:
      audit.opportunities
        ? audit.opportunities.map(
            (
              opportunity
            ) => ({
              title:
                opportunity.title ||
                "",

              service:
                opportunity.service ||
                "",

              priority:
                opportunity.priority ||
                "medium",

              impact:
                opportunity.impact ||
                "medium",

              description:
                opportunity.description ||
                "",
            })
          )
        : [],

    recommendedServices:
      audit.recommendedServices
        ? [
            ...audit.recommendedServices,
          ]
        : [],

    nextStep:
      audit.nextStep || "",

    notes:
      audit.notes || "",
  };
};

const WebsiteAuditDetailsPage =
  () => {
    const {
      businessId,
    } = useParams();

    const navigate =
      useNavigate();

    const [isEditing, setIsEditing] =
      useState(false);

    const [form, setForm] =
      useState(
        createInitialForm
      );

    const [
      localError,
      setLocalError,
    ] = useState("");

    const [
      notice,
      setNotice,
    ] = useState("");

    const {
      data,
      isLoading,
      isFetching,
      isError,
      error,
      refetch,
    } =
      useWebsiteAuditByBusiness(
        businessId
      );

    const startMutation =
      useStartWebsiteAudit();

    const updateMutation =
      useUpdateWebsiteAudit();

    const completeMutation =
      useCompleteWebsiteAudit();

    const reopenMutation =
      useReopenWebsiteAudit();

    const audit =
      data?.audit || null;

    const business =
      audit?.business ||
      null;


    const isBusy =
      startMutation.isPending ||
      updateMutation.isPending ||
      completeMutation.isPending ||
      reopenMutation.isPending;

    const status =
      audit?.status ||
      "draft";

    const statusStyle =
      statusConfig[status] ||
      statusConfig.draft;

    const websiteAvailable =
      Boolean(
        audit?.websiteAvailable
      );

    const scoreSummary =
      useMemo(() => {
        const entries =
          scoreFields
            .map(
              ({ key }) =>
                audit?.scores?.[
                  key
                ]
            )
            .filter(
              (value) =>
                typeof value ===
                "number"
            );

        if (
          entries.length === 0
        ) {
          return null;
        }

        const total =
          entries.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          );

        return Math.round(
          total /
            entries.length
        );
      }, [audit]);

    const handleStartAudit =
      async () => {
        setLocalError("");
        setNotice("");

        try {
          const result =
            await startMutation.mutateAsync(
              businessId
            );

          setNotice(
            result?.message ||
              "Website audit started successfully."
          );
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not start website audit."
            )
          );
        }
      };

    const handleCancelEdit =
      () => {
        setForm(
          normaliseAuditToForm(
            audit
          )
        );

        setLocalError("");
        setNotice("");
        setIsEditing(false);
      };

    const handleScoreChange = (
      key,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          scores: {
            ...current.scores,
            [key]:
              value,
          },
        })
      );
    };

    const handleTechnicalChange =
      (
        key,
        value
      ) => {
        let parsedValue =
          null;

        if (
          value === "true"
        ) {
          parsedValue =
            true;
        }

        if (
          value === "false"
        ) {
          parsedValue =
            false;
        }

        setForm(
          (current) => ({
            ...current,

            technicalChecks: {
              ...current.technicalChecks,
              [key]:
                parsedValue,
            },
          })
        );
      };

    const handleStrengthChange =
      (
        index,
        value
      ) => {
        setForm(
          (current) => ({
            ...current,

            strengths:
              current.strengths.map(
                (
                  item,
                  itemIndex
                ) =>
                  itemIndex ===
                  index
                    ? value
                    : item
              ),
          })
        );
      };

    const addStrength = () => {
      setForm(
        (current) => ({
          ...current,
          strengths: [
            ...current.strengths,
            "",
          ],
        })
      );
    };

    const removeStrength = (
      index
    ) => {
      setForm(
        (current) => ({
          ...current,

          strengths:
            current.strengths.filter(
              (
                _item,
                itemIndex
              ) =>
                itemIndex !==
                index
            ),
        })
      );
    };

    const handleIssueChange = (
      index,
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          issues:
            current.issues.map(
              (
                issue,
                issueIndex
              ) =>
                issueIndex ===
                index
                  ? {
                      ...issue,
                      [field]:
                        value,
                    }
                  : issue
            ),
        })
      );
    };

    const addIssue = () => {
      setForm(
        (current) => ({
          ...current,
          issues: [
            ...current.issues,
            createEmptyIssue(),
          ],
        })
      );
    };

    const removeIssue = (
      index
    ) => {
      setForm(
        (current) => ({
          ...current,

          issues:
            current.issues.filter(
              (
                _issue,
                issueIndex
              ) =>
                issueIndex !==
                index
            ),
        })
      );
    };

    const handleOpportunityChange =
      (
        index,
        field,
        value
      ) => {
        setForm(
          (current) => ({
            ...current,

            opportunities:
              current.opportunities.map(
                (
                  opportunity,
                  opportunityIndex
                ) =>
                  opportunityIndex ===
                  index
                    ? {
                        ...opportunity,
                        [field]:
                          value,
                      }
                    : opportunity
              ),
          })
        );
      };

    const addOpportunity =
      () => {
        setForm(
          (current) => ({
            ...current,

            opportunities: [
              ...current.opportunities,
              createEmptyOpportunity(),
            ],
          })
        );
      };

    const removeOpportunity =
      (index) => {
        setForm(
          (current) => ({
            ...current,

            opportunities:
              current.opportunities.filter(
                (
                  _opportunity,
                  opportunityIndex
                ) =>
                  opportunityIndex !==
                  index
              ),
          })
        );
      };

    const handleServiceChange =
      (
        index,
        value
      ) => {
        setForm(
          (current) => ({
            ...current,

            recommendedServices:
              current.recommendedServices.map(
                (
                  service,
                  serviceIndex
                ) =>
                  serviceIndex ===
                  index
                    ? value
                    : service
              ),
          })
        );
      };

    const addService = () => {
      setForm(
        (current) => ({
          ...current,

          recommendedServices:
            [
              ...current.recommendedServices,
              "",
            ],
        })
      );
    };

    const removeService = (
      index
    ) => {
      setForm(
        (current) => ({
          ...current,

          recommendedServices:
            current.recommendedServices.filter(
              (
                _service,
                serviceIndex
              ) =>
                serviceIndex !==
                index
            ),
        })
      );
    };

    const handleSave =
      async () => {
        if (!audit?._id) {
          return;
        }

        setLocalError("");
        setNotice("");

        const invalidIssue =
          form.issues.find(
            (issue) =>
              !issue.title.trim() &&
              (
                issue.description.trim() ||
                issue.evidence.trim() ||
                issue.recommendation.trim()
              )
          );

        if (invalidIssue) {
          setLocalError(
            "Every issue with details must have a title."
          );

          return;
        }

        const invalidOpportunity =
          form.opportunities.find(
            (
              opportunity
            ) =>
              !opportunity.title.trim() &&
              (
                opportunity.service.trim() ||
                opportunity.description.trim()
              )
          );

        if (
          invalidOpportunity
        ) {
          setLocalError(
            "Every opportunity with details must have a title."
          );

          return;
        }

        const normaliseScore =
          (value) => {
            if (
              value === "" ||
              value ===
                null ||
              value ===
                undefined
            ) {
              return null;
            }

            const number =
              Number(value);

            return Number.isNaN(
              number
            )
              ? null
              : number;
          };

        const payload = {
          websiteUrl:
            form.websiteUrl.trim(),

          auditMode:
            form.auditMode,

          overallScore:
            normaliseScore(
              form.overallScore
            ),

          scores: {
            performance:
              normaliseScore(
                form.scores
                  .performance
              ),

            mobile:
              normaliseScore(
                form.scores
                  .mobile
              ),

            seo:
              normaliseScore(
                form.scores
                  .seo
              ),

            accessibility:
              normaliseScore(
                form.scores
                  .accessibility
              ),

            content:
              normaliseScore(
                form.scores
                  .content
              ),

            trust:
              normaliseScore(
                form.scores
                  .trust
              ),

            ux:
              normaliseScore(
                form.scores
                  .ux
              ),
          },

          technicalChecks:
            form.technicalChecks,

          summary:
            form.summary.trim(),

          strengths:
            cleanStringArray(
              form.strengths
            ),

          issues:
            form.issues
              .filter(
                (issue) =>
                  issue.title.trim()
              )
              .map(
                (issue) => ({
                  title:
                    issue.title.trim(),

                  category:
                    issue.category,

                  severity:
                    issue.severity,

                  description:
                    issue.description.trim(),

                  evidence:
                    issue.evidence.trim(),

                  recommendation:
                    issue.recommendation.trim(),
                })
              ),

          opportunities:
            form.opportunities
              .filter(
                (
                  opportunity
                ) =>
                  opportunity.title.trim()
              )
              .map(
                (
                  opportunity
                ) => ({
                  title:
                    opportunity.title.trim(),

                  service:
                    opportunity.service.trim(),

                  priority:
                    opportunity.priority,

                  impact:
                    opportunity.impact,

                  description:
                    opportunity.description.trim(),
                })
              ),

          recommendedServices:
            cleanStringArray(
              form.recommendedServices
            ),

          nextStep:
            form.nextStep.trim(),

          notes:
            form.notes.trim(),
        };

        try {
          const result =
            await updateMutation.mutateAsync(
              {
                auditId:
                  audit._id,
                payload,
              }
            );

          setNotice(
            result?.message ||
              "Website audit saved successfully."
          );

          setIsEditing(false);
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not save website audit."
            )
          );
        }
      };

    const handleComplete =
      async () => {
        if (!audit?._id) {
          return;
        }

        setLocalError("");
        setNotice("");

        try {
          const result =
            await completeMutation.mutateAsync(
              audit._id
            );

          setNotice(
            result?.message ||
              "Website audit completed successfully."
          );

          setIsEditing(false);
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not complete website audit."
            )
          );
        }
      };

    const handleReopen =
      async () => {
        if (!audit?._id) {
          return;
        }

        setLocalError("");
        setNotice("");

        try {
          const result =
            await reopenMutation.mutateAsync(
              audit._id
            );

          setNotice(
            result?.message ||
              "Website audit reopened successfully."
          );
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not reopen website audit."
            )
          );
        }
      };

    if (isLoading) {
      return (
        <div className="flex min-h-[520px] items-center justify-center rounded-[28px] border border-white/10 bg-slate-950/60">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-cyan-300" />

            <p className="mt-3 text-sm text-slate-400">
              Loading website
              audit...
            </p>
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/website-audits"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />
            Website audits
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />

              <div>
                <h2 className="font-semibold text-red-200">
                  Could not load
                  this website
                  audit
                </h2>

                <p className="mt-1 text-sm text-red-200/70">
                  {getErrorMessage(
                    error,
                    "Something went wrong."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!audit) {
      return (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/businesses/${businessId}`
              )
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />
            Back to business
          </button>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
              <Globe2
                size={28}
              />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-white">
              Website audit
              not started
            </h1>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Start the website
              audit for this
              business. If the
              business does not
              have a website,
              BonaForge will
              automatically record
              the website
              development
              opportunity.
            </p>

            {localError ? (
              <p className="mx-auto mt-4 max-w-xl text-sm text-red-300">
                {localError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={
                startMutation.isPending
              }
              onClick={
                handleStartAudit
              }
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {startMutation.isPending ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <ClipboardCheck
                  size={17}
                />
              )}

              Start website
              audit
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* TOP NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/website-audits"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />
            Website audits
          </button>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            disabled={
              isFetching
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* HEADER */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle.className}`}
                  >
                    {
                      statusStyle.label
                    }
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
                    {audit.auditMode ||
                      "manual"}{" "}
                    audit
                  </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {business?.name ||
                    "Website Audit"}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  {business?.industry ||
                    "Industry not set"}
                </p>

                {websiteAvailable &&
                audit.websiteUrl ? (
                  <a
                    href={
                      audit.websiteUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex max-w-full items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                  >
                    <Globe2
                      size={16}
                    />

                    <span className="truncate">
                      {
                        audit.websiteUrl
                      }
                    </span>

                    <ExternalLink
                      size={14}
                    />
                  </a>
                ) : (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-sm font-medium text-amber-200">
                    <ShieldAlert
                      size={16}
                    />
                    Business currently
                    has no website
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/businesses/${businessId}`
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  View business
                </button>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(
                        normaliseAuditToForm(
                          audit
                        )
                      );
                      setLocalError(
                        ""
                      );
                      setNotice("");
                      setIsEditing(
                        true
                      );
                    }}
                    disabled={
                      isBusy
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Pencil
                      size={16}
                    />
                    Edit audit
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={
                        handleCancelEdit
                      }
                      disabled={
                        isBusy
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:opacity-60"
                    >
                      <X
                        size={16}
                      />
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSave
                      }
                      disabled={
                        isBusy
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updateMutation.isPending ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Save
                          size={16}
                        />
                      )}

                      Save audit
                    </button>
                  </>
                )}

                {status ===
                "completed" ? (
                  <button
                    type="button"
                    onClick={
                      handleReopen
                    }
                    disabled={
                      isBusy
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reopenMutation.isPending ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <RotateCcw
                        size={16}
                      />
                    )}

                    Reopen
                  </button>
                ) : status !==
                  "not_applicable" ? (
                  <button
                    type="button"
                    onClick={
                      handleComplete
                    }
                    disabled={
                      isBusy ||
                      isEditing
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {completeMutation.isPending ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCircle2
                        size={16}
                      />
                    )}

                    Complete
                  </button>
                ) : null}
              </div>
            </div>

            {localError ? (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

                <p className="text-sm text-red-200">
                  {localError}
                </p>
              </div>
            ) : null}

            {notice ? (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

                <p className="text-sm text-emerald-200">
                  {notice}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {/* SCORE OVERVIEW */}
        <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <Gauge
                size={17}
              />
              Overall score
            </div>

            {isEditing ? (
              <div className="mt-6">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    form.overallScore
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        overallScore:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="0 - 100"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-2xl font-semibold text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-500/40"
                />

                <p className="mt-2 text-xs text-slate-600">
                  Enter an overall
                  score between 0
                  and 100.
                </p>
              </div>
            ) : (
              <>
                <p className="mt-5 text-5xl font-semibold tracking-tight text-white">
                  {audit.overallScore ===
                    null ||
                  audit.overallScore ===
                    undefined
                    ? "—"
                    : audit.overallScore}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {audit.overallScore ===
                    null ||
                  audit.overallScore ===
                    undefined
                    ? "Not scored yet"
                    : "out of 100"}
                </p>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-white">
                Score breakdown
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review the main
                website quality
                areas.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {scoreFields.map(
                ({
                  key,
                  label,
                }) => {
                  const value =
                    isEditing
                      ? form.scores[
                          key
                        ]
                      : audit
                          .scores?.[
                          key
                        ];

                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {label}
                      </p>

                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            value
                          }
                          onChange={(
                            event
                          ) =>
                            handleScoreChange(
                              key,
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="0-100"
                          className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-500/40"
                        />
                      ) : (
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {typeof value ===
                          "number"
                            ? `${value}/100`
                            : "—"}
                        </p>
                      )}
                    </div>
                  );
                }
              )}

              {!isEditing &&
              scoreSummary !==
                null ? (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-cyan-300/70">
                    Category average
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-cyan-200">
                    {scoreSummary}
                    /100
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* WEBSITE SETTINGS */}
        {isEditing ? (
          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="font-semibold text-white">
              Audit settings
            </h2>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Website URL
                </label>

                <input
                  type="url"
                  value={
                    form.websiteUrl
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        websiteUrl:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Audit mode
                </label>

                <select
                  value={
                    form.auditMode
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        auditMode:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                >
                  <option value="manual">
                    Manual
                  </option>

                  <option value="automated">
                    Automated
                  </option>

                  <option value="hybrid">
                    Hybrid
                  </option>
                </select>
              </div>
            </div>
          </section>
        ) : null}

        {/* TECHNICAL CHECKS */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">
                Technical checks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Core website
                signals and
                conversion
                essentials.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {technicalFields.map(
              ({
                key,
                label,
              }) => {
                const value =
                  isEditing
                    ? form
                        .technicalChecks[
                        key
                      ]
                    : audit
                        .technicalChecks?.[
                        key
                      ];

                if (isEditing) {
                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <label className="block text-sm font-medium text-slate-300">
                        {label}
                      </label>

                      <select
                        value={
                          value ===
                          true
                            ? "true"
                            : value ===
                                false
                              ? "false"
                              : ""
                        }
                        onChange={(
                          event
                        ) =>
                          handleTechnicalChange(
                            key,
                            event
                              .target
                              .value
                          )
                        }
                        className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40"
                      >
                        <option value="">
                          Not checked
                        </option>

                        <option value="true">
                          Yes
                        </option>

                        <option value="false">
                          No
                        </option>
                      </select>
                    </div>
                  );
                }

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-sm text-slate-300">
                      {label}
                    </p>

                    {value ===
                    true ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                        Yes
                      </span>
                    ) : value ===
                      false ? (
                      <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-300">
                        No
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                        Not checked
                      </span>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* SUMMARY */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="font-semibold text-white">
            Audit summary
          </h2>

          {isEditing ? (
            <textarea
              rows={6}
              value={
                form.summary
              }
              onChange={(
                event
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    summary:
                      event.target
                        .value,
                  })
                )
              }
              placeholder="Summarize the website condition, strengths, weaknesses and business impact..."
              className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
            />
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {audit.summary ||
                "No audit summary has been added yet."}
            </p>
          )}
        </section>

        {/* STRENGTHS */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">
                Website strengths
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Positive qualities
                worth preserving.
              </p>
            </div>

            {isEditing ? (
              <button
                type="button"
                onClick={
                  addStrength
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
              >
                <Plus
                  size={14}
                />
                Add strength
              </button>
            ) : null}
          </div>

          {isEditing ? (
            <div className="mt-4 space-y-3">
              {form.strengths.length ===
              0 ? (
                <p className="text-sm text-slate-600">
                  No strengths
                  added.
                </p>
              ) : null}

              {form.strengths.map(
                (
                  strength,
                  index
                ) => (
                  <div
                    key={`strength-${index}`}
                    className="flex gap-2"
                  >
                    <input
                      value={
                        strength
                      }
                      onChange={(
                        event
                      ) =>
                        handleStrengthChange(
                          index,
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Example: Mobile responsive layout"
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeStrength(
                          index
                        )
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-500/[0.05] text-red-300 transition hover:bg-red-500/10"
                    >
                      <Trash2
                        size={15}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          ) : audit.strengths
              ?.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {audit.strengths.map(
                (
                  strength,
                  index
                ) => (
                  <div
                    key={`${strength}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />

                    <p className="text-sm leading-6 text-slate-300">
                      {strength}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              No strengths added
              yet.
            </p>
          )}
        </section>

        {/* ISSUES */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">
                Issues discovered
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Technical,
                usability, SEO and
                conversion problems.
              </p>
            </div>

            {isEditing ? (
              <button
                type="button"
                onClick={addIssue}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
              >
                <Plus
                  size={14}
                />
                Add issue
              </button>
            ) : null}
          </div>

          {isEditing ? (
            <div className="mt-5 space-y-4">
              {form.issues.length ===
              0 ? (
                <p className="text-sm text-slate-600">
                  No issues added.
                </p>
              ) : null}

              {form.issues.map(
                (
                  issue,
                  index
                ) => (
                  <div
                    key={`issue-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-300">
                        Issue{" "}
                        {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeIssue(
                            index
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/15 bg-red-500/[0.05] text-red-300 transition hover:bg-red-500/10"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Title
                        </label>

                        <input
                          value={
                            issue.title
                          }
                          onChange={(
                            event
                          ) =>
                            handleIssueChange(
                              index,
                              "title",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Weak call to action"
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Category
                          </label>

                          <select
                            value={
                              issue.category
                            }
                            onChange={(
                              event
                            ) =>
                              handleIssueChange(
                                index,
                                "category",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                          >
                            {issueCategories.map(
                              (
                                category
                              ) => (
                                <option
                                  key={
                                    category
                                  }
                                  value={
                                    category
                                  }
                                >
                                  {
                                    category
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Severity
                          </label>

                          <select
                            value={
                              issue.severity
                            }
                            onChange={(
                              event
                            ) =>
                              handleIssueChange(
                                index,
                                "severity",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                          >
                            {issueSeverities.map(
                              (
                                severity
                              ) => (
                                <option
                                  key={
                                    severity
                                  }
                                  value={
                                    severity
                                  }
                                >
                                  {
                                    severity
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-3">
                      <textarea
                        rows={4}
                        value={
                          issue.description
                        }
                        onChange={(
                          event
                        ) =>
                          handleIssueChange(
                            index,
                            "description",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Describe the issue..."
                        className="resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                      />

                      <textarea
                        rows={4}
                        value={
                          issue.evidence
                        }
                        onChange={(
                          event
                        ) =>
                          handleIssueChange(
                            index,
                            "evidence",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Evidence observed..."
                        className="resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                      />

                      <textarea
                        rows={4}
                        value={
                          issue.recommendation
                        }
                        onChange={(
                          event
                        ) =>
                          handleIssueChange(
                            index,
                            "recommendation",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Recommended fix..."
                        className="resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : audit.issues
              ?.length ? (
            <div className="mt-5 space-y-4">
              {audit.issues.map(
                (
                  issue,
                  index
                ) => (
                  <div
                    key={
                      issue._id ||
                      `${issue.title}-${index}`
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">
                          {
                            issue.title
                          }
                        </h3>

                        <p className="mt-1 text-xs uppercase tracking-wider text-slate-600">
                          {
                            issue.category
                          }
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          severityConfig[
                            issue
                              .severity
                          ] ||
                          severityConfig.info
                        }`}
                      >
                        {
                          issue.severity
                        }
                      </span>
                    </div>

                    {issue.description ? (
                      <div className="mt-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                          Description
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                          {
                            issue.description
                          }
                        </p>
                      </div>
                    ) : null}

                    {issue.evidence ? (
                      <div className="mt-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                          Evidence
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                          {
                            issue.evidence
                          }
                        </p>
                      </div>
                    ) : null}

                    {issue.recommendation ? (
                      <div className="mt-4 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.04] p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-cyan-300/70">
                          Recommendation
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                          {
                            issue.recommendation
                          }
                        </p>
                      </div>
                    ) : null}
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              No issues have been
              recorded.
            </p>
          )}
        </section>

        {/* OPPORTUNITIES */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">
                Sales opportunities
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Turn website
                findings into
                practical services
                you can sell.
              </p>
            </div>

            {isEditing ? (
              <button
                type="button"
                onClick={
                  addOpportunity
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
              >
                <Plus
                  size={14}
                />
                Add opportunity
              </button>
            ) : null}
          </div>

          {isEditing ? (
            <div className="mt-5 space-y-4">
              {form.opportunities
                .length === 0 ? (
                <p className="text-sm text-slate-600">
                  No opportunities
                  added.
                </p>
              ) : null}

              {form.opportunities.map(
                (
                  opportunity,
                  index
                ) => (
                  <div
                    key={`opportunity-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-300">
                        Opportunity{" "}
                        {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeOpportunity(
                            index
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/15 bg-red-500/[0.05] text-red-300 transition hover:bg-red-500/10"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Title
                        </label>

                        <input
                          value={
                            opportunity.title
                          }
                          onChange={(
                            event
                          ) =>
                            handleOpportunityChange(
                              index,
                              "title",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Improve lead conversion"
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Service
                        </label>

                        <input
                          value={
                            opportunity.service
                          }
                          onChange={(
                            event
                          ) =>
                            handleOpportunityChange(
                              index,
                              "service",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Website Optimization"
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Priority
                        </label>

                        <select
                          value={
                            opportunity.priority
                          }
                          onChange={(
                            event
                          ) =>
                            handleOpportunityChange(
                              index,
                              "priority",
                              event
                                .target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                        >
                          {priorities.map(
                            (
                              priority
                            ) => (
                              <option
                                key={
                                  priority
                                }
                                value={
                                  priority
                                }
                              >
                                {
                                  priority
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Impact
                        </label>

                        <select
                          value={
                            opportunity.impact
                          }
                          onChange={(
                            event
                          ) =>
                            handleOpportunityChange(
                              index,
                              "impact",
                              event
                                .target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                        >
                          {impacts.map(
                            (
                              impact
                            ) => (
                              <option
                                key={
                                  impact
                                }
                                value={
                                  impact
                                }
                              >
                                {
                                  impact
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={
                        opportunity.description
                      }
                      onChange={(
                        event
                      ) =>
                        handleOpportunityChange(
                          index,
                          "description",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Explain why this opportunity matters..."
                      className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                    />
                  </div>
                )
              )}
            </div>
          ) : audit
              .opportunities
              ?.length ? (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {audit.opportunities.map(
                (
                  opportunity,
                  index
                ) => (
                  <div
                    key={
                      opportunity._id ||
                      `${opportunity.title}-${index}`
                    }
                    className="rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.035] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">
                          {
                            opportunity.title
                          }
                        </h3>

                        <p className="mt-1 text-sm text-cyan-300">
                          {opportunity.service ||
                            "Service not set"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                          {
                            opportunity.priority
                          }{" "}
                          priority
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                          {
                            opportunity.impact
                          }{" "}
                          impact
                        </span>
                      </div>
                    </div>

                    {opportunity.description ? (
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                        {
                          opportunity.description
                        }
                      </p>
                    ) : null}
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              No sales
              opportunities have
              been recorded.
            </p>
          )}
        </section>

        {/* RECOMMENDED SERVICES */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">
                Recommended
                services
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Services to
                propose based on
                the audit.
              </p>
            </div>

            {isEditing ? (
              <button
                type="button"
                onClick={
                  addService
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
              >
                <Plus
                  size={14}
                />
                Add service
              </button>
            ) : null}
          </div>

          {isEditing ? (
            <div className="mt-4 space-y-3">
              {form
                .recommendedServices
                .length === 0 ? (
                <p className="text-sm text-slate-600">
                  No services
                  added.
                </p>
              ) : null}

              {form.recommendedServices.map(
                (
                  service,
                  index
                ) => (
                  <div
                    key={`service-${index}`}
                    className="flex gap-2"
                  >
                    <input
                      value={
                        service
                      }
                      onChange={(
                        event
                      ) =>
                        handleServiceChange(
                          index,
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Website Development"
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeService(
                          index
                        )
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-500/[0.05] text-red-300 transition hover:bg-red-500/10"
                    >
                      <Trash2
                        size={15}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          ) : audit
              .recommendedServices
              ?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {audit.recommendedServices.map(
                (
                  service,
                  index
                ) => (
                  <span
                    key={`${service}-${index}`}
                    className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-200"
                  >
                    {service}
                  </span>
                )
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              No recommended
              services yet.
            </p>
          )}
        </section>

        {/* NEXT STEP */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="font-semibold text-white">
            Next sales step
          </h2>

          {isEditing ? (
            <textarea
              rows={5}
              value={
                form.nextStep
              }
              onChange={(
                event
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    nextStep:
                      event.target
                        .value,
                  })
                )
              }
              placeholder="What should you do next with this prospect?"
              className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
            />
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {audit.nextStep ||
                "No next step has been defined."}
            </p>
          )}
        </section>

        {/* NOTES */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="font-semibold text-white">
            Internal notes
          </h2>

          {isEditing ? (
            <textarea
              rows={6}
              value={
                form.notes
              }
              onChange={(
                event
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    notes:
                      event.target
                        .value,
                  })
                )
              }
              placeholder="Add internal notes about the audit or prospect..."
              className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
            />
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {audit.notes ||
                "No internal notes added."}
            </p>
          )}
        </section>

        {/* METADATA */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Started
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {formatDate(
                audit.startedAt
              )}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Completed
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {formatDate(
                audit.completedAt
              )}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Created
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {formatDate(
                audit.createdAt
              )}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Last updated
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {formatDate(
                audit.updatedAt
              )}
            </p>
          </div>
        </section>
      </div>
    );
  };

export default WebsiteAuditDetailsPage;