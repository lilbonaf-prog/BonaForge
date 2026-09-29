import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  Link2,
  Loader2,
  PencilLine,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Target,
  Trash2,
  UsersRound,
} from "lucide-react";

import {
  useFieldArray,
  useForm,
} from "react-hook-form";

import useResearchByBusiness from "../features/research/useResearchByBusiness";
import useUpdateResearch from "../features/research/useUpdateResearch";
import useCompleteResearch from "../features/research/useCompleteResearch";
import useReopenResearch from "../features/research/useReopenResearch";

// ==============================
// HELPERS
// ==============================

const arrayToText = (items = []) =>
  items.join("\n");

const textToArray = (value = "") =>
  value
    .split("\n")
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);

const editorInputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/10";

const editorTextareaClass =
  "w-full resize-y rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/10";

const cleanCompetitors = (items = []) =>
  items
    .map((item) => ({
      name:
        item?.name?.trim() || "",
      website:
        item?.website?.trim() || "",
      notes:
        item?.notes?.trim() || "",
    }))
    .filter(
      (item) =>
        item.name ||
        item.website ||
        item.notes
    );

const cleanSocialProfiles = (items = []) =>
  items
    .map((item) => ({
      platform:
        item?.platform?.trim() || "",
      handle:
        item?.handle?.trim() || "",
      url:
        item?.url?.trim() || "",
      notes:
        item?.notes?.trim() || "",
    }))
    .filter(
      (item) =>
        item.platform ||
        item.handle ||
        item.url ||
        item.notes
    );

const cleanSources = (items = []) =>
  items
    .map((item) => ({
      title:
        item?.title?.trim() || "",
      url:
        item?.url?.trim() || "",
      sourceType:
        item?.sourceType ||
        "manual",
      notes:
        item?.notes?.trim() || "",
    }))
    .filter(
      (item) =>
        item.title ||
        item.url ||
        item.notes
    );

const getExternalUrl = (value = "") => {
  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `https://${value}`;
};

const formatDate = (value) => {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const getStatusConfig = (status) => {
  if (status === "completed") {
    return {
      label: "Completed",
      icon: CheckCircle2,
      className:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    };
  }

  return {
    label: "In progress",
    icon: Clock3,
    className:
      "border-sky-400/20 bg-sky-400/10 text-sky-300",
  };
};

// ==============================
// PAGE
// ==============================

const ResearchDetailsPage = () => {
  const {
    businessId,
  } = useParams();

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useResearchByBusiness(
    businessId
  );

  const updateMutation =
    useUpdateResearch();

  const completeMutation =
    useCompleteResearch();

  const reopenMutation =
    useReopenResearch();

  const research =
    data?.research;

  const business =
    research?.business;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: {
      isDirty,
    },
  } = useForm({
    defaultValues: {
      companyOverview: "",
      productsServices: "",
      targetAudience: "",
      marketPositioning: "",
      strengths: "",
      weaknesses: "",
      opportunities: "",
      digitalPresenceSummary: "",
      keyFindings: "",
      recommendedApproach: "",
      competitors: [],
      socialProfiles: [],
      sources: [],
      notes: "",
    },
  });

  const {
    fields: competitorFields,
    append: appendCompetitor,
    remove: removeCompetitor,
  } = useFieldArray({
    control,
    name: "competitors",
  });

  const {
    fields: socialProfileFields,
    append: appendSocialProfile,
    remove: removeSocialProfile,
  } = useFieldArray({
    control,
    name: "socialProfiles",
  });

  const {
    fields: sourceFields,
    append: appendSource,
    remove: removeSource,
  } = useFieldArray({
    control,
    name: "sources",
  });

  useEffect(() => {
    if (!research) {
      return;
    }

    reset({
      companyOverview:
        research.companyOverview ||
        "",

      productsServices:
        arrayToText(
          research.productsServices
        ),

      targetAudience:
        research.targetAudience ||
        "",

      marketPositioning:
        research.marketPositioning ||
        "",

      strengths:
        arrayToText(
          research.strengths
        ),

      weaknesses:
        arrayToText(
          research.weaknesses
        ),

      opportunities:
        arrayToText(
          research.opportunities
        ),

      digitalPresenceSummary:
        research.digitalPresenceSummary ||
        "",

      keyFindings:
        arrayToText(
          research.keyFindings
        ),

      recommendedApproach:
        research.recommendedApproach ||
        "",

      competitors:
        (research.competitors || []).map(
          (competitor) => ({
            name:
              competitor.name || "",
            website:
              competitor.website || "",
            notes:
              competitor.notes || "",
          })
        ),

      socialProfiles:
        (research.socialProfiles || []).map(
          (profile) => ({
            platform:
              profile.platform || "",
            handle:
              profile.handle || "",
            url:
              profile.url || "",
            notes:
              profile.notes || "",
          })
        ),

      sources:
        (research.sources || []).map(
          (source) => ({
            title:
              source.title || "",
            url:
              source.url || "",
            sourceType:
              source.sourceType ||
              "manual",
            notes:
              source.notes || "",
          })
        ),

      notes:
        research.notes || "",
    });
  }, [
    research,
    reset,
  ]);

  const statusConfig =
    useMemo(
      () =>
        getStatusConfig(
          research?.status
        ),
      [
        research?.status,
      ]
    );

  const StatusIcon =
    statusConfig.icon;

  const busy =
    updateMutation.isPending ||
    completeMutation.isPending ||
    reopenMutation.isPending;

  const onSubmit = async (
    values
  ) => {
    if (!research?._id) {
      return;
    }

    setActionError("");

    try {
      await updateMutation.mutateAsync({
        researchId:
          research._id,

        payload: {
          companyOverview:
            values.companyOverview,

          productsServices:
            textToArray(
              values.productsServices
            ),

          targetAudience:
            values.targetAudience,

          marketPositioning:
            values.marketPositioning,

          strengths:
            textToArray(
              values.strengths
            ),

          weaknesses:
            textToArray(
              values.weaknesses
            ),

          opportunities:
            textToArray(
              values.opportunities
            ),

          digitalPresenceSummary:
            values.digitalPresenceSummary,

          keyFindings:
            textToArray(
              values.keyFindings
            ),

          recommendedApproach:
            values.recommendedApproach,

          competitors:
            cleanCompetitors(
              values.competitors
            ),

          socialProfiles:
            cleanSocialProfiles(
              values.socialProfiles
            ),

          sources:
            cleanSources(
              values.sources
            ),

          notes:
            values.notes,
        },
      });

      setIsEditing(false);
    } catch (mutationError) {
      setActionError(
        mutationError?.response
          ?.data?.message ||
          "Unable to save research."
      );
    }
  };

  const handleComplete =
    async () => {
      if (!research?._id) {
        return;
      }

      setActionError("");

      try {
        await completeMutation.mutateAsync(
          research._id
        );
      } catch (mutationError) {
        setActionError(
          mutationError?.response
            ?.data?.message ||
            "Unable to complete research."
        );
      }
    };

  const handleReopen =
    async () => {
      if (!research?._id) {
        return;
      }

      setActionError("");

      try {
        await reopenMutation.mutateAsync(
          research._id
        );
      } catch (mutationError) {
        setActionError(
          mutationError?.response
            ?.data?.message ||
            "Unable to reopen research."
        );
      }
    };

  if (isLoading) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    );
  }

  if (
    isError ||
    !research
  ) {
    return (
      <PageShell>
        <ErrorState
          message={
            error?.response?.data
              ?.message ||
            "Research record could not be loaded."
          }
          onRetry={() =>
            refetch()
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* =========================
          TOP BAR
      ========================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link
          to="/research"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft
            size={16}
          />

          Back to research
        </Link>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              refetch()
            }
            disabled={
              isFetching ||
              busy
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-50"
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

          {!isEditing && (
            <button
              type="button"
              onClick={() =>
                setIsEditing(
                  true
                )
              }
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/15 disabled:opacity-50"
            >
              <PencilLine
                size={15}
              />

              Edit research
            </button>
          )}

          {research.status ===
          "completed" ? (
            <button
              type="button"
              onClick={
                handleReopen
              }
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15 disabled:opacity-50"
            >
              {reopenMutation.isPending ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <RotateCcw
                  size={15}
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
                busy ||
                isEditing
              }
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {completeMutation.isPending ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2
                  size={15}
                />
              )}

              Complete research
            </button>
          )}
        </div>
      </div>

      {/* =========================
          HERO
      ========================== */}

      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
                >
                  <StatusIcon
                    size={13}
                  />

                  {
                    statusConfig.label
                  }
                </span>

                {business?.status && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold capitalize text-slate-400">
                    Business:{" "}
                    {
                      business.status
                    }
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {business?.name ||
                  "Business Research"}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {business?.industry ||
                  "Industry not specified"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={`/businesses/${businessId}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07]"
                >
                  <Building2
                    size={15}
                  />

                  View business
                </Link>

                {business?.website ? (
                  <a
                    href={
                      business.website
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07]"
                  >
                    <Globe2
                      size={15}
                    />

                    Website

                    <ExternalLink
                      size={13}
                    />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid min-w-[260px] grid-cols-2 gap-3">
              <HeroStat
                label="Started"
                value={formatDate(
                  research.startedAt
                )}
              />

              <HeroStat
                label="Completed"
                value={formatDate(
                  research.completedAt
                )}
              />
            </div>
          </div>
        </div>
      </section>

      {actionError ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">
          {actionError}
        </div>
      ) : null}

      {/* =========================
          EDIT MODE
      ========================== */}

      {isEditing ? (
        <form
          onSubmit={
            handleSubmit(
              onSubmit
            )
          }
          className="space-y-5"
        >
          <ResearchSection
            icon={Sparkles}
            title="Company overview"
            description="Summarize what the business does and the context you discovered."
          >
            <TextareaField
              register={register}
              name="companyOverview"
              placeholder="Describe the business, what it offers and what makes it relevant..."
              rows={6}
            />
          </ResearchSection>

          <div className="grid gap-5 xl:grid-cols-2">
            <ResearchSection
              icon={
                Building2
              }
              title="Products & services"
              description="Enter one item per line."
            >
              <TextareaField
                register={
                  register
                }
                name="productsServices"
                placeholder={
                  "Website Design\nBranding\nDigital Marketing"
                }
                rows={7}
              />
            </ResearchSection>

            <ResearchSection
              icon={
                UsersRound
              }
              title="Target audience"
              description="Describe who the business primarily serves."
            >
              <TextareaField
                register={
                  register
                }
                name="targetAudience"
                placeholder="Describe the likely customers..."
                rows={7}
              />
            </ResearchSection>
          </div>

          <ResearchSection
            icon={Target}
            title="Market positioning"
            description="Capture how the business appears to be positioned in its market."
          >
            <TextareaField
              register={register}
              name="marketPositioning"
              placeholder="Describe pricing, positioning, reputation, niche or competitive angle..."
              rows={5}
            />
          </ResearchSection>

          <div className="grid gap-5 xl:grid-cols-3">
            <ResearchSection
              title="Strengths"
              description="One item per line."
            >
              <TextareaField
                register={
                  register
                }
                name="strengths"
                rows={8}
              />
            </ResearchSection>

            <ResearchSection
              title="Weaknesses"
              description="One item per line."
            >
              <TextareaField
                register={
                  register
                }
                name="weaknesses"
                rows={8}
              />
            </ResearchSection>

            <ResearchSection
              title="Opportunities"
              description="One item per line."
            >
              <TextareaField
                register={
                  register
                }
                name="opportunities"
                rows={8}
              />
            </ResearchSection>
          </div>

          <ResearchSection
            icon={Search}
            title="Digital presence"
            description="Summarize what you discovered about the business online."
          >
            <TextareaField
              register={register}
              name="digitalPresenceSummary"
              rows={5}
            />
          </ResearchSection>

          <ResearchSection
            icon={Sparkles}
            title="Key findings"
            description="Enter one important finding per line."
          >
            <TextareaField
              register={register}
              name="keyFindings"
              rows={7}
            />
          </ResearchSection>

          <ResearchSection
            icon={Target}
            title="Recommended sales approach"
            description="Record how BonaForge should approach this prospect."
          >
            <TextareaField
              register={register}
              name="recommendedApproach"
              rows={5}
            />
          </ResearchSection>

          <ResearchSection
            icon={UsersRound}
            title="Competitors"
            description="Track relevant competitors, their websites and what you learned about them."
            action={
              <button
                type="button"
                onClick={() =>
                  appendCompetitor({
                    name: "",
                    website: "",
                    notes: "",
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/15"
              >
                <Plus size={14} />
                Add competitor
              </button>
            }
          >
            {competitorFields.length ? (
              <div className="space-y-4">
                {competitorFields.map(
                  (field, index) => (
                    <RepeatableEditorCard
                      key={field.id}
                      title={`Competitor ${index + 1}`}
                      onRemove={() =>
                        removeCompetitor(
                          index
                        )
                      }
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <EditorField label="Name">
                          <input
                            {...register(
                              `competitors.${index}.name`
                            )}
                            placeholder="e.g. Acme Digital"
                            className={editorInputClass}
                          />
                        </EditorField>

                        <EditorField label="Website">
                          <input
                            {...register(
                              `competitors.${index}.website`
                            )}
                            placeholder="https://example.com"
                            className={editorInputClass}
                          />
                        </EditorField>

                        <div className="md:col-span-2">
                          <EditorField label="Notes">
                            <textarea
                              {...register(
                                `competitors.${index}.notes`
                              )}
                              rows={3}
                              placeholder="Pricing, positioning, strengths, weaknesses or anything useful..."
                              className={editorTextareaClass}
                            />
                          </EditorField>
                        </div>
                      </div>
                    </RepeatableEditorCard>
                  )
                )}
              </div>
            ) : (
              <EmptyEditorState
                title="No competitors added"
                description="Add a competitor when you discover another business serving the same market."
              />
            )}
          </ResearchSection>

          <ResearchSection
            icon={Link2}
            title="Social profiles"
            description="Save useful social accounts discovered during research."
            action={
              <button
                type="button"
                onClick={() =>
                  appendSocialProfile({
                    platform: "",
                    handle: "",
                    url: "",
                    notes: "",
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/15"
              >
                <Plus size={14} />
                Add profile
              </button>
            }
          >
            {socialProfileFields.length ? (
              <div className="space-y-4">
                {socialProfileFields.map(
                  (field, index) => (
                    <RepeatableEditorCard
                      key={field.id}
                      title={`Profile ${index + 1}`}
                      onRemove={() =>
                        removeSocialProfile(
                          index
                        )
                      }
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <EditorField label="Platform">
                          <input
                            {...register(
                              `socialProfiles.${index}.platform`
                            )}
                            placeholder="Instagram"
                            className={editorInputClass}
                          />
                        </EditorField>

                        <EditorField label="Handle">
                          <input
                            {...register(
                              `socialProfiles.${index}.handle`
                            )}
                            placeholder="@business"
                            className={editorInputClass}
                          />
                        </EditorField>

                        <div className="md:col-span-2">
                          <EditorField label="Profile URL">
                            <input
                              {...register(
                                `socialProfiles.${index}.url`
                              )}
                              placeholder="https://instagram.com/business"
                              className={editorInputClass}
                            />
                          </EditorField>
                        </div>

                        <div className="md:col-span-2">
                          <EditorField label="Notes">
                            <textarea
                              {...register(
                                `socialProfiles.${index}.notes`
                              )}
                              rows={3}
                              placeholder="Posting activity, follower quality, branding consistency or other observations..."
                              className={editorTextareaClass}
                            />
                          </EditorField>
                        </div>
                      </div>
                    </RepeatableEditorCard>
                  )
                )}
              </div>
            ) : (
              <EmptyEditorState
                title="No social profiles added"
                description="Add Instagram, Facebook, LinkedIn, TikTok or any other useful profile."
              />
            )}
          </ResearchSection>

          <ResearchSection
            icon={Globe2}
            title="Research sources"
            description="Keep a traceable record of where your research information came from."
            action={
              <button
                type="button"
                onClick={() =>
                  appendSource({
                    title: "",
                    url: "",
                    sourceType: "manual",
                    notes: "",
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/15"
              >
                <Plus size={14} />
                Add source
              </button>
            }
          >
            {sourceFields.length ? (
              <div className="space-y-4">
                {sourceFields.map(
                  (field, index) => (
                    <RepeatableEditorCard
                      key={field.id}
                      title={`Source ${index + 1}`}
                      onRemove={() =>
                        removeSource(
                          index
                        )
                      }
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <EditorField label="Title">
                          <input
                            {...register(
                              `sources.${index}.title`
                            )}
                            placeholder="Official website"
                            className={editorInputClass}
                          />
                        </EditorField>

                        <EditorField label="Source type">
                          <select
                            {...register(
                              `sources.${index}.sourceType`
                            )}
                            className={editorInputClass}
                          >
                            <option value="website">
                              Website
                            </option>
                            <option value="social_media">
                              Social media
                            </option>
                            <option value="search">
                              Search
                            </option>
                            <option value="directory">
                              Directory
                            </option>
                            <option value="manual">
                              Manual
                            </option>
                            <option value="other">
                              Other
                            </option>
                          </select>
                        </EditorField>

                        <div className="md:col-span-2">
                          <EditorField label="URL">
                            <input
                              {...register(
                                `sources.${index}.url`
                              )}
                              placeholder="https://example.com/source"
                              className={editorInputClass}
                            />
                          </EditorField>
                        </div>

                        <div className="md:col-span-2">
                          <EditorField label="Notes">
                            <textarea
                              {...register(
                                `sources.${index}.notes`
                              )}
                              rows={3}
                              placeholder="What did this source confirm or reveal?"
                              className={editorTextareaClass}
                            />
                          </EditorField>
                        </div>
                      </div>
                    </RepeatableEditorCard>
                  )
                )}
              </div>
            ) : (
              <EmptyEditorState
                title="No research sources added"
                description="Add the websites, directories, searches or manual sources used to build this research."
              />
            )}
          </ResearchSection>

          <ResearchSection
            title="Internal notes"
            description="Private working notes about this research."
          >
            <TextareaField
              register={register}
              name="notes"
              rows={5}
            />
          </ResearchSection>

          <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-white/10 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => {
                reset();

                setIsEditing(
                  false
                );

                setActionError(
                  ""
                );
              }}
              disabled={
                updateMutation.isPending
              }
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                updateMutation.isPending ||
                !isDirty
              }
              className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Save
                  size={15}
                />
              )}

              Save research
            </button>
          </div>
        </form>
      ) : (
        <ResearchOverview
          research={
            research
          }
        />
      )}
    </PageShell>
  );
};

// ==============================
// OVERVIEW
// ==============================

const ResearchOverview = ({
  research,
}) => {
  return (
    <div className="space-y-5">
      <ResearchSection
        icon={Sparkles}
        title="Company overview"
      >
        <DisplayText
          value={
            research.companyOverview
          }
        />
      </ResearchSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <ResearchSection
          icon={Building2}
          title="Products & services"
        >
          <TagList
            items={
              research.productsServices
            }
          />
        </ResearchSection>

        <ResearchSection
          icon={UsersRound}
          title="Target audience"
        >
          <DisplayText
            value={
              research.targetAudience
            }
          />
        </ResearchSection>
      </div>

      <ResearchSection
        icon={Target}
        title="Market positioning"
      >
        <DisplayText
          value={
            research.marketPositioning
          }
        />
      </ResearchSection>

      <div className="grid gap-5 xl:grid-cols-3">
        <ResearchSection
          title="Strengths"
        >
          <BulletList
            items={
              research.strengths
            }
          />
        </ResearchSection>

        <ResearchSection
          title="Weaknesses"
        >
          <BulletList
            items={
              research.weaknesses
            }
          />
        </ResearchSection>

        <ResearchSection
          title="Opportunities"
        >
          <BulletList
            items={
              research.opportunities
            }
          />
        </ResearchSection>
      </div>

      <ResearchSection
        icon={Search}
        title="Digital presence"
      >
        <DisplayText
          value={
            research.digitalPresenceSummary
          }
        />
      </ResearchSection>

      <ResearchSection
        icon={Sparkles}
        title="Key findings"
      >
        <BulletList
          items={
            research.keyFindings
          }
        />
      </ResearchSection>

      <ResearchSection
        icon={Target}
        title="Recommended sales approach"
      >
        <DisplayText
          value={
            research.recommendedApproach
          }
        />
      </ResearchSection>

      <ResearchSection
        title="Internal notes"
      >
        <DisplayText
          value={
            research.notes
          }
        />
      </ResearchSection>

      <ResearchSection
        title="Competitors"
      >
        {research.competitors
          ?.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {research.competitors.map(
              (
                competitor,
                index
              ) => (
                <div
                  key={`${competitor.name}-${index}`}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                >
                  <p className="font-semibold text-white">
                    {competitor.name ||
                      "Unnamed competitor"}
                  </p>

                  {competitor.website ? (
                    <a
                      href={getExternalUrl(
                        competitor.website
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex max-w-full items-center gap-1.5 break-all text-xs text-violet-300 transition hover:text-violet-200"
                    >
                      {competitor.website}
                      <ExternalLink
                        size={12}
                        className="shrink-0"
                      />
                    </a>
                  ) : null}

                  {competitor.notes ? (
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {
                        competitor.notes
                      }
                    </p>
                  ) : null}
                </div>
              )
            )}
          </div>
        ) : (
          <EmptyValue />
        )}
      </ResearchSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <ResearchSection
          title="Social profiles"
        >
          {research.socialProfiles
            ?.length ? (
            <div className="space-y-3">
              {research.socialProfiles.map(
                (
                  profile,
                  index
                ) => (
                  <div
                    key={`${profile.platform}-${index}`}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
                  >
                    <p className="font-medium text-white">
                      {profile.platform ||
                        "Social profile"}
                    </p>

                    {profile.handle ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {profile.handle}
                      </p>
                    ) : null}

                    {profile.url ? (
                      <a
                        href={getExternalUrl(
                          profile.url
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex max-w-full items-center gap-1.5 break-all text-xs text-violet-300 transition hover:text-violet-200"
                      >
                        {profile.url}
                        <ExternalLink
                          size={12}
                          className="shrink-0"
                        />
                      </a>
                    ) : null}

                    {profile.notes ? (
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {profile.notes}
                      </p>
                    ) : null}
                  </div>
                )
              )}
            </div>
          ) : (
            <EmptyValue />
          )}
        </ResearchSection>

        <ResearchSection
          title="Research sources"
        >
          {research.sources
            ?.length ? (
            <div className="space-y-3">
              {research.sources.map(
                (
                  source,
                  index
                ) => (
                  <div
                    key={`${source.title}-${index}`}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
                  >
                    <p className="font-medium text-white">
                      {source.title ||
                        "Source"}
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-600">
                      {source.sourceType ||
                        "manual"}
                    </p>

                    {source.url ? (
                      <a
                        href={getExternalUrl(
                          source.url
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex max-w-full items-center gap-1.5 break-all text-xs text-violet-300 transition hover:text-violet-200"
                      >
                        {source.url}
                        <ExternalLink
                          size={12}
                          className="shrink-0"
                        />
                      </a>
                    ) : null}

                    {source.notes ? (
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {
                          source.notes
                        }
                      </p>
                    ) : null}
                  </div>
                )
              )}
            </div>
          ) : (
            <EmptyValue />
          )}
        </ResearchSection>
      </div>
    </div>
  );
};

// ==============================
// SHARED COMPONENTS
// ==============================

const PageShell = ({
  children,
}) => {
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      {children}
    </div>
  );
};

const HeroStat = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-300">
        {value}
      </p>
    </div>
  );
};

const ResearchSection = ({
  icon: Icon,
  title,
  description,
  action,
  children,
}) => {
  return (
    <section className="rounded-[24px] border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.08] text-violet-300">
              <Icon
                size={16}
              />
            </div>
          ) : null}

          <div>
            <h2 className="font-semibold text-white">
              {title}
            </h2>

            {description ? (
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {action ? (
          <div className="shrink-0">
            {action}
          </div>
        ) : null}
      </div>

      {children}
    </section>
  );
};

const RepeatableEditorCard = ({
  title,
  onRemove,
  children,
}) => {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-400/15 bg-rose-400/[0.05] text-rose-300 transition hover:bg-rose-400/[0.1] hover:text-rose-200"
          aria-label={`Remove ${title}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {children}
    </div>
  );
};

const EditorField = ({
  label,
  helper,
  children,
}) => {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-slate-400">
        {label}
      </span>

      {children}

      {helper ? (
        <span className="mt-1.5 block text-[11px] leading-5 text-slate-600">
          {helper}
        </span>
      ) : null}
    </label>
  );
};

const EmptyEditorState = ({
  title,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-8 text-center">
      <p className="text-sm font-medium text-slate-300">
        {title}
      </p>

      <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-600">
        {description}
      </p>
    </div>
  );
};

const TextareaField = ({
  register,
  name,
  placeholder = "",
  rows = 5,
}) => {
  return (
    <textarea
      {...register(name)}
      rows={rows}
      placeholder={
        placeholder
      }
      className="w-full resize-y rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/10"
    />
  );
};

const DisplayText = ({
  value,
}) => {
  if (!value) {
    return <EmptyValue />;
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-400">
      {value}
    </p>
  );
};

const TagList = ({
  items = [],
}) => {
  if (!items.length) {
    return <EmptyValue />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(
        (item) => (
          <span
            key={item}
            className="rounded-full border border-violet-400/15 bg-violet-400/[0.07] px-3 py-1.5 text-xs font-medium text-violet-200"
          >
            {item}
          </span>
        )
      )}
    </div>
  );
};

const BulletList = ({
  items = [],
}) => {
  if (!items.length) {
    return <EmptyValue />;
  }

  return (
    <ul className="space-y-3">
      {items.map(
        (
          item,
          index
        ) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-3 text-sm leading-6 text-slate-400"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />

            <span>
              {item}
            </span>
          </li>
        )
      )}
    </ul>
  );
};

const EmptyValue = () => {
  return (
    <p className="text-sm italic text-slate-600">
      Nothing added yet.
    </p>
  );
};

const LoadingState = () => {
  return (
    <div className="space-y-5">
      <div className="h-12 w-44 animate-pulse rounded-xl bg-white/[0.04]" />

      <div className="h-64 animate-pulse rounded-[28px] border border-white/10 bg-slate-950/60" />

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-56 animate-pulse rounded-[24px] border border-white/10 bg-slate-950/60" />

        <div className="h-56 animate-pulse rounded-[24px] border border-white/10 bg-slate-950/60" />
      </div>
    </div>
  );
};

const ErrorState = ({
  message,
  onRetry,
}) => {
  return (
    <div className="rounded-[24px] border border-rose-400/20 bg-rose-400/[0.06] p-8 text-center">
      <p className="font-semibold text-rose-200">
        Research could not be loaded
      </p>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07]"
      >
        <RefreshCw
          size={15}
        />

        Try again
      </button>
    </div>
  );
};

export default ResearchDetailsPage;