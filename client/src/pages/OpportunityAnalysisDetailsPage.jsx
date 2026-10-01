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
  FileText,
  Globe2,
  Lightbulb,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";

import useOpportunityAnalysisByBusiness from "../features/opportunityAnalysis/useOpportunityAnalysisByBusiness";
import useStartOpportunityAnalysis from "../features/opportunityAnalysis/useStartOpportunityAnalysis";
import useUpdateOpportunityAnalysis from "../features/opportunityAnalysis/useUpdateOpportunityAnalysis";
import useCompleteOpportunityAnalysis from "../features/opportunityAnalysis/useCompleteOpportunityAnalysis";
import useReopenOpportunityAnalysis from "../features/opportunityAnalysis/useReopenOpportunityAnalysis";

const categories = [
  "website",
  "seo",
  "branding",
  "social_media",
  "content",
  "automation",
  "crm",
  "lead_generation",
  "ecommerce",
  "analytics",
  "design",
  "development",
  "marketing",
  "other",
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

const confidenceLevels = [
  "low",
  "medium",
  "high",
];

const sources = [
  "research",
  "website_audit",
  "manual",
  "combined",
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
};

const priorityConfig = {
  low:
    "border-slate-500/20 bg-slate-500/10 text-slate-300",

  medium:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",

  high:
    "border-orange-500/20 bg-orange-500/10 text-orange-300",

  urgent:
    "border-red-500/20 bg-red-500/10 text-red-300",
};

const impactConfig = {
  low:
    "border-slate-500/20 bg-slate-500/10 text-slate-300",

  medium:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",

  high:
    "border-violet-500/20 bg-violet-500/10 text-violet-300",
};

const sourceLabels = {
  research: "Business research",
  website_audit: "Website audit",
  manual: "Manual",
  combined: "Combined",
};

const categoryLabels = {
  website: "Website",
  seo: "SEO",
  branding: "Branding",
  social_media: "Social media",
  content: "Content",
  automation: "Automation",
  crm: "CRM",
  lead_generation:
    "Lead generation",
  ecommerce: "E-commerce",
  analytics: "Analytics",
  design: "Design",
  development: "Development",
  marketing: "Marketing",
  other: "Other",
};

const formatDate = (
  value
) => {
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
  ).format(
    new Date(value)
  );
};

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const createEmptyOpportunity =
  () => ({
    title: "",
    category: "other",
    source: "manual",
    priority: "medium",
    impact: "medium",
    confidence: "medium",
    problem: "",
    evidence: "",
    businessImpact: "",
    recommendedAction: "",
  });

const createEmptyService =
  () => ({
    service: "",
    priority: "medium",
    reason: "",
    expectedOutcome: "",
    source: "manual",
    selectedForLead: false,
  });

const createInitialForm =
  () => ({
    primaryNeed: "",
    qualificationSummary: "",
    detectedOpportunities: [],
    serviceRecommendations: [],
    salesAngle: "",
    valueProposition: "",
    nextBestAction: "",
    notes: "",
  });

const normaliseAnalysisToForm =
  (analysis) => {
    if (!analysis) {
      return createInitialForm();
    }

    return {
      primaryNeed:
        analysis.primaryNeed ||
        "",

      qualificationSummary:
        analysis.qualificationSummary ||
        "",

      detectedOpportunities:
        analysis
          .detectedOpportunities
          ?.map(
            (
              opportunity
            ) => ({
              _id:
                opportunity._id,

              title:
                opportunity.title ||
                "",

              category:
                opportunity.category ||
                "other",

              source:
                opportunity.source ||
                "manual",

              priority:
                opportunity.priority ||
                "medium",

              impact:
                opportunity.impact ||
                "medium",

              confidence:
                opportunity.confidence ||
                "medium",

              problem:
                opportunity.problem ||
                "",

              evidence:
                opportunity.evidence ||
                "",

              businessImpact:
                opportunity.businessImpact ||
                "",

              recommendedAction:
                opportunity.recommendedAction ||
                "",
            })
          ) || [],

      serviceRecommendations:
        analysis
          .serviceRecommendations
          ?.map(
            (
              recommendation
            ) => ({
              _id:
                recommendation._id,

              service:
                recommendation.service ||
                "",

              priority:
                recommendation.priority ||
                "medium",

              reason:
                recommendation.reason ||
                "",

              expectedOutcome:
                recommendation.expectedOutcome ||
                "",

              source:
                recommendation.source ||
                "manual",

              selectedForLead:
                Boolean(
                  recommendation
                    .selectedForLead
                ),
            })
          ) || [],

      salesAngle:
        analysis.salesAngle ||
        "",

      valueProposition:
        analysis.valueProposition ||
        "",

      nextBestAction:
        analysis.nextBestAction ||
        "",

      notes:
        analysis.notes || "",
    };
  };

const OpportunityAnalysisDetailsPage =
  () => {
    const {
      businessId,
    } = useParams();

    const navigate =
      useNavigate();

    const [
      isEditing,
      setIsEditing,
    ] = useState(false);

    const [
      form,
      setForm,
    ] = useState(
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
      useOpportunityAnalysisByBusiness(
        businessId
      );

    const startMutation =
      useStartOpportunityAnalysis();

    const updateMutation =
      useUpdateOpportunityAnalysis();

    const completeMutation =
      useCompleteOpportunityAnalysis();

    const reopenMutation =
      useReopenOpportunityAnalysis();

    const analysis =
      data?.analysis ||
      null;

    const business =
      analysis?.business ||
      null;

    const research =
      analysis?.research ||
      null;

    const websiteAudit =
      analysis?.websiteAudit ||
      null;

    const status =
      analysis?.status ||
      "draft";

    const statusStyle =
      statusConfig[status] ||
      statusConfig.draft;

    const isBusy =
      startMutation.isPending ||
      updateMutation.isPending ||
      completeMutation.isPending ||
      reopenMutation.isPending;

    const summary =
      useMemo(() => {
        const opportunities =
          analysis
            ?.detectedOpportunities ||
          [];

        const services =
          analysis
            ?.serviceRecommendations ||
          [];

        const selectedServices =
          services.filter(
            (service) =>
              service
                .selectedForLead
          );

        const highPriority =
          opportunities.filter(
            (opportunity) =>
              opportunity.priority ===
                "high" ||
              opportunity.priority ===
                "urgent"
          );

        return {
          opportunities:
            opportunities.length,

          highPriority:
            highPriority.length,

          services:
            services.length,

          selectedServices:
            selectedServices.length,
        };
      }, [analysis]);

    const handleStart =
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
              "Opportunity analysis started successfully."
          );
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not start opportunity analysis."
            )
          );
        }
      };

    const handleBeginEdit =
      () => {
        setForm(
          normaliseAnalysisToForm(
            analysis
          )
        );

        setLocalError("");
        setNotice("");
        setIsEditing(true);
      };

    const handleCancelEdit =
      () => {
        setForm(
          normaliseAnalysisToForm(
            analysis
          )
        );

        setLocalError("");
        setNotice("");
        setIsEditing(false);
      };

    const setField = (
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

    const handleOpportunityChange =
      (
        index,
        field,
        value
      ) => {
        setForm(
          (current) => ({
            ...current,

            detectedOpportunities:
              current
                .detectedOpportunities
                .map(
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

            detectedOpportunities:
              [
                ...current
                  .detectedOpportunities,

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

            detectedOpportunities:
              current
                .detectedOpportunities
                .filter(
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
        field,
        value
      ) => {
        setForm(
          (current) => ({
            ...current,

            serviceRecommendations:
              current
                .serviceRecommendations
                .map(
                  (
                    service,
                    serviceIndex
                  ) =>
                    serviceIndex ===
                    index
                      ? {
                          ...service,
                          [field]:
                            value,
                        }
                      : service
                ),
          })
        );
      };

    const addService = () => {
      setForm(
        (current) => ({
          ...current,

          serviceRecommendations:
            [
              ...current
                .serviceRecommendations,

              createEmptyService(),
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

          serviceRecommendations:
            current
              .serviceRecommendations
              .filter(
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
        if (!analysis?._id) {
          return;
        }

        setLocalError("");
        setNotice("");

        const invalidOpportunity =
          form
            .detectedOpportunities
            .find(
              (
                opportunity
              ) =>
                !opportunity
                  .title
                  .trim() &&
                (
                  opportunity
                    .problem
                    .trim() ||
                  opportunity
                    .evidence
                    .trim() ||
                  opportunity
                    .businessImpact
                    .trim() ||
                  opportunity
                    .recommendedAction
                    .trim()
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

        const invalidService =
          form
            .serviceRecommendations
            .find(
              (
                service
              ) =>
                !service
                  .service
                  .trim() &&
                (
                  service
                    .reason
                    .trim() ||
                  service
                    .expectedOutcome
                    .trim()
                )
            );

        if (
          invalidService
        ) {
          setLocalError(
            "Every service recommendation with details must have a service name."
          );

          return;
        }

        const payload = {
          primaryNeed:
            form.primaryNeed.trim(),

          qualificationSummary:
            form
              .qualificationSummary
              .trim(),

          detectedOpportunities:
            form
              .detectedOpportunities
              .filter(
                (
                  opportunity
                ) =>
                  opportunity
                    .title
                    .trim()
              )
              .map(
                (
                  opportunity
                ) => ({
                  ...(opportunity
                    ._id
                    ? {
                        _id:
                          opportunity
                            ._id,
                      }
                    : {}),

                  title:
                    opportunity
                      .title
                      .trim(),

                  category:
                    opportunity
                      .category,

                  source:
                    opportunity.source,

                  priority:
                    opportunity
                      .priority,

                  impact:
                    opportunity.impact,

                  confidence:
                    opportunity
                      .confidence,

                  problem:
                    opportunity
                      .problem
                      .trim(),

                  evidence:
                    opportunity
                      .evidence
                      .trim(),

                  businessImpact:
                    opportunity
                      .businessImpact
                      .trim(),

                  recommendedAction:
                    opportunity
                      .recommendedAction
                      .trim(),
                })
              ),

          serviceRecommendations:
            form
              .serviceRecommendations
              .filter(
                (
                  recommendation
                ) =>
                  recommendation
                    .service
                    .trim()
              )
              .map(
                (
                  recommendation
                ) => ({
                  ...(recommendation
                    ._id
                    ? {
                        _id:
                          recommendation
                            ._id,
                      }
                    : {}),

                  service:
                    recommendation
                      .service
                      .trim(),

                  priority:
                    recommendation
                      .priority,

                  reason:
                    recommendation
                      .reason
                      .trim(),

                  expectedOutcome:
                    recommendation
                      .expectedOutcome
                      .trim(),

                  source:
                    recommendation
                      .source,

                  selectedForLead:
                    Boolean(
                      recommendation
                        .selectedForLead
                    ),
                })
              ),

          salesAngle:
            form.salesAngle.trim(),

          valueProposition:
            form
              .valueProposition
              .trim(),

          nextBestAction:
            form
              .nextBestAction
              .trim(),

          notes:
            form.notes.trim(),
        };

        try {
          const result =
            await updateMutation.mutateAsync(
              {
                analysisId:
                  analysis._id,

                payload,
              }
            );

          setNotice(
            result?.message ||
              "Opportunity analysis saved successfully."
          );

          setIsEditing(false);
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not save opportunity analysis."
            )
          );
        }
      };

    const handleComplete =
      async () => {
        if (!analysis?._id) {
          return;
        }

        setLocalError("");
        setNotice("");

        try {
          const result =
            await completeMutation.mutateAsync(
              analysis._id
            );

          setNotice(
            result?.message ||
              "Opportunity analysis completed successfully."
          );

          setIsEditing(false);
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not complete opportunity analysis."
            )
          );
        }
      };

    const handleReopen =
      async () => {
        if (!analysis?._id) {
          return;
        }

        setLocalError("");
        setNotice("");

        try {
          const result =
            await reopenMutation.mutateAsync(
              analysis._id
            );

          setNotice(
            result?.message ||
              "Opportunity analysis reopened successfully."
          );
        } catch (
          mutationError
        ) {
          setLocalError(
            getErrorMessage(
              mutationError,
              "Could not reopen opportunity analysis."
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
              Loading opportunity
              analysis...
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
                "/opportunities"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Opportunities
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />

              <div>
                <h2 className="font-semibold text-red-200">
                  Could not load
                  opportunity
                  analysis
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

    if (!analysis) {
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.06] text-cyan-300">
              <Target
                size={28}
              />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-white">
              Opportunity
              analysis not
              started
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Start the analysis
              and BonaForge will
              use available
              Business Research
              and Website Audit
              findings to identify
              potential client
              problems, sales
              opportunities and
              recommended
              services.
            </p>

            {localError ? (
              <p className="mx-auto mt-4 max-w-xl text-sm text-red-300">
                {localError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={
                startMutation
                  .isPending
              }
              onClick={
                handleStart
              }
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {startMutation
                .isPending ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Sparkles
                  size={17}
                />
              )}

              Start opportunity
              analysis
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
                "/opportunities"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Opportunities
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

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle.className}`}
                  >
                    {
                      statusStyle
                        .label
                    }
                  </span>

                  {research ? (
                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
                      Research
                      connected
                    </span>
                  ) : null}

                  {websiteAudit ? (
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                      Website audit
                      connected
                    </span>
                  ) : null}
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {business?.name ||
                    "Opportunity Analysis"}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  {business?.industry ||
                    "Industry not set"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {business
                    ?.website ? (
                    <a
                      href={
                        business
                          .website
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                    >
                      <Globe2
                        size={15}
                      />

                      <span className="truncate">
                        {
                          business
                            .website
                        }
                      </span>
                    </a>
                  ) : (
                    <span className="text-sm text-slate-600">
                      No website
                      listed
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/businesses/${businessId}`
                    )
                  }
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  View business
                </button>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={
                      handleBeginEdit
                    }
                    disabled={
                      isBusy
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15 disabled:opacity-60"
                  >
                    <Pencil
                      size={16}
                    />

                    Edit analysis
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
                      {updateMutation
                        .isPending ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Save
                          size={16}
                        />
                      )}

                      Save analysis
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15 disabled:opacity-60"
                  >
                    {reopenMutation
                      .isPending ? (
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
                ) : (
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
                    {completeMutation
                      .isPending ? (
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
                )}
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

        {/* SUMMARY METRICS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-500">
              Opportunities
            </p>

            <p className="mt-2 text-3xl font-semibold text-white">
              {
                summary.opportunities
              }
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-500">
              High priority
            </p>

            <p className="mt-2 text-3xl font-semibold text-orange-300">
              {
                summary.highPriority
              }
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-500">
              Recommended
              services
            </p>

            <p className="mt-2 text-3xl font-semibold text-white">
              {
                summary.services
              }
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.04] p-5">
            <p className="text-sm text-cyan-300/70">
              Selected for lead
            </p>

            <p className="mt-2 text-3xl font-semibold text-cyan-200">
              {
                summary.selectedServices
              }
            </p>
          </div>
        </section>

        {/* SOURCE INTELLIGENCE */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/15 bg-indigo-500/[0.06] text-indigo-300">
                <FileText
                  size={18}
                />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Business
                  Research
                </h2>

                <p className="text-sm text-slate-500">
                  Source
                  intelligence
                </p>
              </div>
            </div>

            {research ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-sm text-slate-400">
                    Status
                  </span>

                  <span className="text-sm font-medium text-white">
                    {research
                      .status ||
                      "Unknown"}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                    Opportunities
                    identified
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-white">
                    {research
                      .opportunities
                      ?.length || 0}
                  </p>
                </div>

                {research
                  .recommendedApproach ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                      Recommended
                      approach
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {
                        research
                          .recommendedApproach
                      }
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-slate-600">
                No Business
                Research record is
                connected to this
                analysis.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/15 bg-cyan-500/[0.06] text-cyan-300">
                <Globe2
                  size={18}
                />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Website Audit
                </h2>

                <p className="text-sm text-slate-500">
                  Digital
                  intelligence
                </p>
              </div>
            </div>

            {websiteAudit ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-sm text-slate-400">
                    Status
                  </span>

                  <span className="text-sm font-medium text-white">
                    {websiteAudit
                      .status ||
                      "Unknown"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs text-slate-600">
                      Issues
                    </p>

                    <p className="mt-1 text-xl font-semibold text-white">
                      {websiteAudit
                        .issues
                        ?.length ||
                        0}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs text-slate-600">
                      Opportunities
                    </p>

                    <p className="mt-1 text-xl font-semibold text-white">
                      {websiteAudit
                        .opportunities
                        ?.length ||
                        0}
                    </p>
                  </div>
                </div>

                {websiteAudit
                  .websiteAvailable ===
                false ? (
                  <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.05] p-3 text-sm text-amber-200">
                    Business
                    currently has no
                    website.
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-slate-600">
                No Website Audit
                record is connected
                to this analysis.
              </p>
            )}
          </div>
        </section>

        {/* PRIMARY NEED */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex items-center gap-2">
            <Target
              size={17}
              className="text-cyan-300"
            />

            <h2 className="font-semibold text-white">
              Primary client need
            </h2>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={
                form.primaryNeed
              }
              onChange={(
                event
              ) =>
                setField(
                  "primaryNeed",
                  event.target
                    .value
                )
              }
              placeholder="What is the most important problem or business need you can help solve?"
              className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
            />
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {analysis.primaryNeed ||
                "No primary need has been defined yet."}
            </p>
          )}
        </section>

        {/* QUALIFICATION */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="font-semibold text-white">
            Qualification
            summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Explain why this
            business is or is not
            a suitable prospect.
          </p>

          {isEditing ? (
            <textarea
              rows={5}
              value={
                form
                  .qualificationSummary
              }
              onChange={(
                event
              ) =>
                setField(
                  "qualificationSummary",
                  event.target
                    .value
                )
              }
              placeholder="Summarize the prospect's need, urgency, fit and sales potential..."
              className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
            />
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {analysis
                .qualificationSummary ||
                "No qualification summary has been added."}
            </p>
          )}
        </section>

        {/* DETECTED OPPORTUNITIES */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Lightbulb
                  size={17}
                  className="text-amber-300"
                />

                <h2 className="font-semibold text-white">
                  Detected
                  opportunities
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Problems and gaps
                that can become
                valuable client
                work.
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
            <div className="mt-5 space-y-5">
              {form
                .detectedOpportunities
                .length === 0 ? (
                <p className="text-sm text-slate-600">
                  No opportunities
                  added.
                </p>
              ) : null}

              {form
                .detectedOpportunities
                .map(
                  (
                    opportunity,
                    index
                  ) => (
                    <div
                      key={
                        opportunity
                          ._id ||
                        `opportunity-${index}`
                      }
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

                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Title
                        </label>

                        <input
                          value={
                            opportunity
                              .title
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
                          placeholder="Professional website development"
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                        />
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Category
                          </label>

                          <select
                            value={
                              opportunity
                                .category
                            }
                            onChange={(
                              event
                            ) =>
                              handleOpportunityChange(
                                index,
                                "category",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                          >
                            {categories.map(
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
                                    categoryLabels[
                                      category
                                    ]
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Source
                          </label>

                          <select
                            value={
                              opportunity
                                .source
                            }
                            onChange={(
                              event
                            ) =>
                              handleOpportunityChange(
                                index,
                                "source",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                          >
                            {sources.map(
                              (
                                source
                              ) => (
                                <option
                                  key={
                                    source
                                  }
                                  value={
                                    source
                                  }
                                >
                                  {
                                    sourceLabels[
                                      source
                                    ]
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Priority
                          </label>

                          <select
                            value={
                              opportunity
                                .priority
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
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
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
                              opportunity
                                .impact
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
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
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

                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Confidence
                          </label>

                          <select
                            value={
                              opportunity
                                .confidence
                            }
                            onChange={(
                              event
                            ) =>
                              handleOpportunityChange(
                                index,
                                "confidence",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                          >
                            {confidenceLevels.map(
                              (
                                confidence
                              ) => (
                                <option
                                  key={
                                    confidence
                                  }
                                  value={
                                    confidence
                                  }
                                >
                                  {
                                    confidence
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        <textarea
                          rows={4}
                          value={
                            opportunity
                              .problem
                          }
                          onChange={(
                            event
                          ) =>
                            handleOpportunityChange(
                              index,
                              "problem",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Problem or gap..."
                          className="resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                        />

                        <textarea
                          rows={4}
                          value={
                            opportunity
                              .evidence
                          }
                          onChange={(
                            event
                          ) =>
                            handleOpportunityChange(
                              index,
                              "evidence",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Evidence supporting this opportunity..."
                          className="resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                        />

                        <textarea
                          rows={4}
                          value={
                            opportunity
                              .businessImpact
                          }
                          onChange={(
                            event
                          ) =>
                            handleOpportunityChange(
                              index,
                              "businessImpact",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Potential business impact..."
                          className="resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                        />

                        <textarea
                          rows={4}
                          value={
                            opportunity
                              .recommendedAction
                          }
                          onChange={(
                            event
                          ) =>
                            handleOpportunityChange(
                              index,
                              "recommendedAction",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Recommended action..."
                          className="resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                        />
                      </div>
                    </div>
                  )
                )}
            </div>
          ) : analysis
              .detectedOpportunities
              ?.length ? (
            <div className="mt-5 space-y-4">
              {analysis
                .detectedOpportunities
                .map(
                  (
                    opportunity,
                    index
                  ) => (
                    <div
                      key={
                        opportunity
                          ._id ||
                        `${opportunity.title}-${index}`
                      }
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white">
                            {
                              opportunity
                                .title
                            }
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                              {categoryLabels[
                                opportunity
                                  .category
                              ] ||
                                opportunity
                                  .category}
                            </span>

                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                              {sourceLabels[
                                opportunity
                                  .source
                              ] ||
                                opportunity
                                  .source}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              priorityConfig[
                                opportunity
                                  .priority
                              ] ||
                              priorityConfig
                                .medium
                            }`}
                          >
                            {
                              opportunity
                                .priority
                            }{" "}
                            priority
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              impactConfig[
                                opportunity
                                  .impact
                              ] ||
                              impactConfig
                                .medium
                            }`}
                          >
                            {
                              opportunity
                                .impact
                            }{" "}
                            impact
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 xl:grid-cols-2">
                        {opportunity
                          .problem ? (
                          <div className="rounded-xl border border-red-500/10 bg-red-500/[0.025] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-red-300/70">
                              Problem
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                              {
                                opportunity
                                  .problem
                              }
                            </p>
                          </div>
                        ) : null}

                        {opportunity
                          .evidence ? (
                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Evidence
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                              {
                                opportunity
                                  .evidence
                              }
                            </p>
                          </div>
                        ) : null}

                        {opportunity
                          .businessImpact ? (
                          <div className="rounded-xl border border-violet-500/10 bg-violet-500/[0.025] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/70">
                              Business
                              impact
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                              {
                                opportunity
                                  .businessImpact
                              }
                            </p>
                          </div>
                        ) : null}

                        {opportunity
                          .recommendedAction ? (
                          <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.025] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300/70">
                              Recommended
                              action
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                              {
                                opportunity
                                  .recommendedAction
                              }
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <p className="mt-4 text-xs text-slate-600">
                        Confidence:{" "}
                        <span className="font-medium text-slate-400">
                          {opportunity
                            .confidence ||
                            "medium"}
                        </span>
                      </p>
                    </div>
                  )
                )}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-600">
              No opportunities
              have been detected.
            </p>
          )}
        </section>

        {/* SERVICE RECOMMENDATIONS */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  size={17}
                  className="text-violet-300"
                />

                <h2 className="font-semibold text-white">
                  Service
                  recommendations
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Choose the
                services that
                should later be
                carried into the
                sales workflow.
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
            <div className="mt-5 space-y-4">
              {form
                .serviceRecommendations
                .length === 0 ? (
                <p className="text-sm text-slate-600">
                  No service
                  recommendations
                  added.
                </p>
              ) : null}

              {form
                .serviceRecommendations
                .map(
                  (
                    recommendation,
                    index
                  ) => (
                    <div
                      key={
                        recommendation
                          ._id ||
                        `service-${index}`
                      }
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-300">
                          Service{" "}
                          {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeService(
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

                      <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Service
                          </label>

                          <input
                            value={
                              recommendation
                                .service
                            }
                            onChange={(
                              event
                            ) =>
                              handleServiceChange(
                                index,
                                "service",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Website Development"
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Priority
                          </label>

                          <select
                            value={
                              recommendation
                                .priority
                            }
                            onChange={(
                              event
                            ) =>
                              handleServiceChange(
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
                            Source
                          </label>

                          <select
                            value={
                              recommendation
                                .source
                            }
                            onChange={(
                              event
                            ) =>
                              handleServiceChange(
                                index,
                                "source",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
                          >
                            {sources.map(
                              (
                                source
                              ) => (
                                <option
                                  key={
                                    source
                                  }
                                  value={
                                    source
                                  }
                                >
                                  {
                                    sourceLabels[
                                      source
                                    ]
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        <textarea
                          rows={4}
                          value={
                            recommendation
                              .reason
                          }
                          onChange={(
                            event
                          ) =>
                            handleServiceChange(
                              index,
                              "reason",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Why should this service be recommended?"
                          className="resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                        />

                        <textarea
                          rows={4}
                          value={
                            recommendation
                              .expectedOutcome
                          }
                          onChange={(
                            event
                          ) =>
                            handleServiceChange(
                              index,
                              "expectedOutcome",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Expected outcome for the client..."
                          className="resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                        />
                      </div>

                      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-cyan-500/15 bg-cyan-500/[0.035] p-4">
                        <input
                          type="checkbox"
                          checked={
                            recommendation
                              .selectedForLead
                          }
                          onChange={(
                            event
                          ) =>
                            handleServiceChange(
                              index,
                              "selectedForLead",
                              event
                                .target
                                .checked
                            )
                          }
                          className="h-4 w-4 rounded border-white/20 bg-slate-900 accent-cyan-400"
                        />

                        <div>
                          <p className="text-sm font-medium text-cyan-200">
                            Select for
                            lead
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Mark this
                            service for
                            the future
                            Lead and
                            Proposal
                            workflow.
                          </p>
                        </div>
                      </label>
                    </div>
                  )
                )}
            </div>
          ) : analysis
              .serviceRecommendations
              ?.length ? (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {analysis
                .serviceRecommendations
                .map(
                  (
                    recommendation,
                    index
                  ) => (
                    <div
                      key={
                        recommendation
                          ._id ||
                        `${recommendation.service}-${index}`
                      }
                      className={`rounded-2xl border p-5 ${
                        recommendation
                          .selectedForLead
                          ? "border-cyan-500/20 bg-cyan-500/[0.04]"
                          : "border-white/10 bg-white/[0.025]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white">
                            {
                              recommendation
                                .service
                            }
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {sourceLabels[
                              recommendation
                                .source
                            ] ||
                              recommendation
                                .source}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              priorityConfig[
                                recommendation
                                  .priority
                              ] ||
                              priorityConfig
                                .medium
                            }`}
                          >
                            {
                              recommendation
                                .priority
                            }
                          </span>

                          {recommendation
                            .selectedForLead ? (
                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                              Selected
                              for lead
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {recommendation
                        .reason ? (
                        <div className="mt-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                            Reason
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {
                              recommendation
                                .reason
                            }
                          </p>
                        </div>
                      ) : null}

                      {recommendation
                        .expectedOutcome ? (
                        <div className="mt-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                            Expected
                            outcome
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {
                              recommendation
                                .expectedOutcome
                            }
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )
                )}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-600">
              No service
              recommendations
              have been added.
            </p>
          )}
        </section>

        {/* SALES STRATEGY */}
        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center gap-2">
              <Sparkles
                size={17}
                className="text-violet-300"
              />

              <h2 className="font-semibold text-white">
                Sales angle
              </h2>
            </div>

            {isEditing ? (
              <textarea
                rows={6}
                value={
                  form.salesAngle
                }
                onChange={(
                  event
                ) =>
                  setField(
                    "salesAngle",
                    event.target
                      .value
                  )
                }
                placeholder="How should you position the solution when speaking with this prospect?"
                className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
              />
            ) : (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                {analysis
                  .salesAngle ||
                  "No sales angle has been defined."}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center gap-2">
              <Target
                size={17}
                className="text-cyan-300"
              />

              <h2 className="font-semibold text-white">
                Value
                proposition
              </h2>
            </div>

            {isEditing ? (
              <textarea
                rows={6}
                value={
                  form
                    .valueProposition
                }
                onChange={(
                  event
                ) =>
                  setField(
                    "valueProposition",
                    event.target
                      .value
                  )
                }
                placeholder="What value will the client receive from the proposed solution?"
                className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
              />
            ) : (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                {analysis
                  .valueProposition ||
                  "No value proposition has been defined."}
              </p>
            )}
          </div>
        </section>

        {/* NEXT BEST ACTION */}
        <section className="rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.035] p-5">
          <div className="flex items-center gap-2">
            <Target
              size={17}
              className="text-cyan-300"
            />

            <h2 className="font-semibold text-white">
              Next best action
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            The most important
            action to move this
            prospect forward.
          </p>

          {isEditing ? (
            <textarea
              rows={5}
              value={
                form
                  .nextBestAction
              }
              onChange={(
                event
              ) =>
                setField(
                  "nextBestAction",
                  event.target
                    .value
                )
              }
              placeholder="Example: Contact the prospect and discuss website requirements, goals, content and budget."
              className="mt-4 w-full resize-y rounded-xl border border-cyan-500/15 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
            />
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-cyan-100/80">
              {analysis
                .nextBestAction ||
                "No next action has been defined."}
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
                setField(
                  "notes",
                  event.target
                    .value
                )
              }
              placeholder="Add private notes about this opportunity analysis..."
              className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
            />
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {analysis.notes ||
                "No internal notes added."}
            </p>
          )}
        </section>

        {/* WORKFLOW READINESS */}
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={17}
              className="text-emerald-300"
            />

            <h2 className="font-semibold text-white">
              Sales workflow
              readiness
            </h2>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Primary need
              </p>

              <p className="mt-2 text-sm font-medium text-slate-300">
                {analysis
                  .primaryNeed
                  ? "Defined"
                  : "Missing"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Opportunities
              </p>

              <p className="mt-2 text-sm font-medium text-slate-300">
                {
                  summary.opportunities
                }{" "}
                identified
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Lead services
              </p>

              <p className="mt-2 text-sm font-medium text-cyan-300">
                {
                  summary.selectedServices
                }{" "}
                selected
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Analysis
              </p>

              <p className="mt-2 text-sm font-medium text-slate-300">
                {
                  statusStyle.label
                }
              </p>
            </div>
          </div>
        </section>

        {/* METADATA */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Started
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {formatDate(
                analysis
                  .startedAt
              )}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Completed
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {formatDate(
                analysis
                  .completedAt
              )}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Created
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {formatDate(
                analysis
                  .createdAt
              )}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Last updated
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {formatDate(
                analysis
                  .updatedAt
              )}
            </p>
          </div>
        </section>
      </div>
    );
  };

export default OpportunityAnalysisDetailsPage;