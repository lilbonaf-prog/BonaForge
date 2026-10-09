import {
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FolderKanban,
  Loader2,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  RotateCcw,
  Save,
  Target,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import useProject from "../features/projects/useProject";
import useUpdateProject from "../features/projects/useUpdateProject";
import useStartProject from "../features/projects/useStartProject";
import useHoldProject from "../features/projects/useHoldProject";
import useCompleteProject from "../features/projects/useCompleteProject";
import useCancelProject from "../features/projects/useCancelProject";
import useReopenProject from "../features/projects/useReopenProject";
import useAddMilestone from "../features/projects/useAddMilestone";
import useUpdateMilestone from "../features/projects/useUpdateMilestone";
import useDeleteMilestone from "../features/projects/useDeleteMilestone";
import useDeleteProject from "../features/projects/useDeleteProject";
import ProjectInvoiceWorkspace from "../features/invoices/ProjectInvoiceWorkspace";

const statusClasses = {
  planned:
    "border-white/10 bg-white/[0.05] text-white/60",

  in_progress:
    "border-sky-400/20 bg-sky-400/10 text-sky-200",

  on_hold:
    "border-amber-400/20 bg-amber-400/10 text-amber-200",

  completed:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",

  cancelled:
    "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

const statusLabels = {
  planned: "Planned",
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

const milestoneStatusLabels = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

const formatCurrency = (
  amount,
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
      Number(amount) || 0
    );
  } catch {
    return `${currency || "GHS"} ${(
      Number(amount) || 0
    ).toLocaleString()}`;
  }
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
      dateStyle: "medium",
    }
  ).format(date);
};

const formatDateTime = (
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
      timeStyle: "short",
    }
  ).format(date);
};

const toDateInput = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
};

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data
    ?.message ||
  error?.message ||
  fallback;

const normalizeForm = (
  project
) => ({
  name:
    project?.name || "",

  summary:
    project?.summary || "",

  services:
    Array.isArray(
      project?.services
    )
      ? project.services.join(
          ", "
        )
      : "",

  scope:
    project?.scope || "",

  deliverables:
    Array.isArray(
      project?.deliverables
    )
      ? project.deliverables.join(
          "\n"
        )
      : "",

  projectValue:
    project?.projectValue ??
    0,

  currency:
    project?.currency ||
    "GHS",

  progress:
    project?.progress ?? 0,

  startDate:
    toDateInput(
      project?.startDate
    ),

  deadline:
    toDateInput(
      project?.deadline
    ),

  notes:
    project?.notes || "",
});

const ActionButton = ({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  danger = false,
  primary = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
      danger
        ? "border-rose-400/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15"
        : primary
          ? "border-indigo-400/25 bg-indigo-400/15 text-indigo-100 hover:bg-indigo-400/20"
          : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:text-white"
    }`}
  >
    {Icon ? (
      <Icon size={16} />
    ) : null}

    {children}
  </button>
);

const InfoCard = ({
  label,
  value,
  icon: Icon,
}) => (
  <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">
          {label}
        </p>

        <p className="mt-2 break-words text-lg font-semibold text-white">
          {value}
        </p>
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/35">
        <Icon size={17} />
      </div>
    </div>
  </div>
);

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

const ProjectDetailsPage = () => {
  const navigate =
    useNavigate();

  const {
    projectId,
  } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useProject(
    projectId
  );

  const updateMutation =
    useUpdateProject();

  const startMutation =
    useStartProject();

  const holdMutation =
    useHoldProject();

  const completeMutation =
    useCompleteProject();

  const cancelMutation =
    useCancelProject();

  const reopenMutation =
    useReopenProject();

  const addMilestoneMutation =
    useAddMilestone();

  const updateMilestoneMutation =
    useUpdateMilestone();

  const deleteMilestoneMutation =
    useDeleteMilestone();

  const deleteProjectMutation =
    useDeleteProject();

  const project =
    data?.project;

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState(
    normalizeForm(null)
  );

  const [
    notice,
    setNotice,
  ] = useState("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  const [
    showMilestoneForm,
    setShowMilestoneForm,
  ] = useState(false);

  const [
    milestoneForm,
    setMilestoneForm,
  ] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const status =
    project?.status ||
    "planned";

  const canEdit =
    ![
      "completed",
      "cancelled",
    ].includes(status);

  const busy =
    updateMutation.isPending ||
    startMutation.isPending ||
    holdMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending ||
    reopenMutation.isPending ||
    addMilestoneMutation.isPending ||
    updateMilestoneMutation.isPending ||
    deleteMilestoneMutation.isPending ||
    deleteProjectMutation.isPending;

  const updateField = (
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

  const beginEdit = () => {
    setNotice("");
    setLocalError("");

    setForm(
      normalizeForm(
        project
      )
    );

    setIsEditing(true);
  };

  const cancelEdit = () => {
    setNotice("");
    setLocalError("");

    setForm(
      normalizeForm(
        project
      )
    );

    setIsEditing(false);
  };

  const saveProject =
    async () => {
      if (
        !project ||
        updateMutation.isPending
      ) {
        return;
      }

      const cleanName =
        form.name.trim();

      if (!cleanName) {
        setLocalError(
          "Project name is required."
        );

        return;
      }

      const services =
        form.services
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

      const deliverables =
        form.deliverables
          .split("\n")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

      setNotice("");
      setLocalError("");

      try {
        await updateMutation.mutateAsync(
          {
            projectId:
              project._id,

            payload: {
              name:
                cleanName,

              summary:
                form.summary,

              services,

              scope:
                form.scope,

              deliverables,

              projectValue:
                Math.max(
                  Number(
                    form.projectValue
                  ) || 0,
                  0
                ),

              currency:
                String(
                  form.currency ||
                    "GHS"
                )
                  .trim()
                  .toUpperCase(),

              progress:
                Math.min(
                  Math.max(
                    Number(
                      form.progress
                    ) || 0,
                    0
                  ),
                  100
                ),

              startDate:
                form.startDate ||
                null,

              deadline:
                form.deadline ||
                null,

              notes:
                form.notes,
            },
          }
        );

        setIsEditing(false);

        setNotice(
          "Project updated successfully."
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to update project."
          )
        );
      }
    };

  const runSimpleAction =
    async (
      mutation,
      successMessage
    ) => {
      if (
        !project ||
        busy
      ) {
        return;
      }

      setNotice("");
      setLocalError("");

      try {
        await mutation.mutateAsync(
          project._id
        );

        setNotice(
          successMessage
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to complete this action."
          )
        );
      }
    };

  const handleCancelProject =
    async () => {
      if (
        !project ||
        busy
      ) {
        return;
      }

      const reason =
        window.prompt(
          "Why is this project being cancelled? You can leave this blank."
        );

      if (
        reason === null
      ) {
        return;
      }

      setNotice("");
      setLocalError("");

      try {
        await cancelMutation.mutateAsync(
          {
            projectId:
              project._id,

            cancellationReason:
              reason,
          }
        );

        setNotice(
          "Project cancelled successfully."
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to cancel project."
          )
        );
      }
    };

  const handleDeleteProject =
    async () => {
      if (
        !project ||
        busy
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this project? This action cannot be undone."
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteProjectMutation.mutateAsync(
          project._id
        );

        navigate(
          "/projects"
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to delete project."
          )
        );
      }
    };

  const addMilestone =
    async () => {
      if (
        !project ||
        busy
      ) {
        return;
      }

      const title =
        milestoneForm.title.trim();

      if (!title) {
        setLocalError(
          "Milestone title is required."
        );

        return;
      }

      setNotice("");
      setLocalError("");

      try {
        await addMilestoneMutation.mutateAsync(
          {
            projectId:
              project._id,

            payload: {
              title,

              description:
                milestoneForm.description,

              dueDate:
                milestoneForm.dueDate ||
                null,
            },
          }
        );

        setMilestoneForm({
          title: "",
          description: "",
          dueDate: "",
        });

        setShowMilestoneForm(
          false
        );

        setNotice(
          "Milestone added successfully."
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to add milestone."
          )
        );
      }
    };

  const changeMilestoneStatus =
    async (
      milestoneId,
      nextStatus
    ) => {
      if (
        !project ||
        busy
      ) {
        return;
      }

      setNotice("");
      setLocalError("");

      try {
        await updateMilestoneMutation.mutateAsync(
          {
            projectId:
              project._id,

            milestoneId,

            payload: {
              status:
                nextStatus,
            },
          }
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to update milestone."
          )
        );
      }
    };

  const removeMilestone =
    async (
      milestoneId
    ) => {
      if (
        !project ||
        busy
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this milestone?"
        );

      if (!confirmed) {
        return;
      }

      setNotice("");
      setLocalError("");

      try {
        await deleteMilestoneMutation.mutateAsync(
          {
            projectId:
              project._id,

            milestoneId,
          }
        );
      } catch (
        mutationError
      ) {
        setLocalError(
          getErrorMessage(
            mutationError,
            "Unable to delete milestone."
          )
        );
      }
    };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-white/35" />

          <p className="mt-3 text-sm text-white/35">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  if (
    isError ||
    !project
  ) {
    return (
      <div className="mx-auto max-w-[900px] rounded-[26px] border border-rose-400/15 bg-rose-400/[0.05] p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 text-rose-300" />

          <div>
            <p className="font-semibold text-rose-100">
              Unable to load project
            </p>

            <p className="mt-1 text-sm text-rose-100/55">
              {getErrorMessage(
                error,
                "Project not found."
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            refetch()
          }
          className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60"
        >
          Try again
        </button>
      </div>
    );
  }

  const lead =
    project.lead;

  const business =
    project.business;

  const proposal =
    project.proposal;

  const quotation =
    project.quotation;

  const progress =
    Math.min(
      Math.max(
        Number(
          project.progress
        ) || 0,
        0
      ),
      100
    );

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7">
      <button
        type="button"
        onClick={() =>
          navigate(
            "/projects"
          )
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-white/35 transition hover:text-white/70"
      >
        <ArrowLeft
          size={16}
        />

        Back to projects
      </button>

      <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  statusClasses[
                    status
                  ] ||
                  statusClasses.planned
                }`}
              >
                {statusLabels[
                  status
                ] || status}
              </span>

              <span className="text-xs font-medium text-white/30">
                {
                  project.projectNumber
                }
              </span>
            </div>

            {isEditing ? (
              <input
                value={
                  form.name
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "name",
                    event.target
                      .value
                  )
                }
                className="mt-4 w-full max-w-3xl rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-2xl font-semibold text-white outline-none focus:border-indigo-400/30"
              />
            ) : (
              <h1 className="mt-4 break-words text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {project.name}
              </h1>
            )}

            <p className="mt-3 text-sm text-white/35">
              {business?.name ||
                lead?.companyName ||
                lead?.name ||
                "Client"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canEdit &&
            !isEditing ? (
              <ActionButton
                icon={Pencil}
                onClick={
                  beginEdit
                }
                disabled={busy}
              >
                Edit
              </ActionButton>
            ) : null}

            {isEditing ? (
              <>
                <ActionButton
                  icon={X}
                  onClick={
                    cancelEdit
                  }
                  disabled={
                    updateMutation.isPending
                  }
                >
                  Cancel
                </ActionButton>

                <ActionButton
                  icon={Save}
                  onClick={
                    saveProject
                  }
                  disabled={
                    updateMutation.isPending
                  }
                  primary
                >
                  Save
                </ActionButton>
              </>
            ) : null}

            {status ===
              "planned" ? (
              <ActionButton
                icon={
                  PlayCircle
                }
                onClick={() =>
                  runSimpleAction(
                    startMutation,
                    "Project started successfully."
                  )
                }
                disabled={
                  busy ||
                  isEditing
                }
                primary
              >
                Start project
              </ActionButton>
            ) : null}

            {status ===
              "in_progress" ? (
              <ActionButton
                icon={
                  PauseCircle
                }
                onClick={() =>
                  runSimpleAction(
                    holdMutation,
                    "Project placed on hold."
                  )
                }
                disabled={
                  busy ||
                  isEditing
                }
              >
                Put on hold
              </ActionButton>
            ) : null}

            {status ===
              "on_hold" ? (
              <ActionButton
                icon={
                  PlayCircle
                }
                onClick={() =>
                  runSimpleAction(
                    startMutation,
                    "Project resumed successfully."
                  )
                }
                disabled={
                  busy ||
                  isEditing
                }
                primary
              >
                Resume
              </ActionButton>
            ) : null}

            {[
              "planned",
              "in_progress",
              "on_hold",
            ].includes(
              status
            ) ? (
              <ActionButton
                icon={
                  CheckCircle2
                }
                onClick={() =>
                  runSimpleAction(
                    completeMutation,
                    "Project completed successfully."
                  )
                }
                disabled={
                  busy ||
                  isEditing
                }
                primary
              >
                Complete
              </ActionButton>
            ) : null}

            {[
              "planned",
              "in_progress",
              "on_hold",
            ].includes(
              status
            ) ? (
              <ActionButton
                icon={
                  XCircle
                }
                onClick={
                  handleCancelProject
                }
                disabled={
                  busy ||
                  isEditing
                }
                danger
              >
                Cancel project
              </ActionButton>
            ) : null}

            {[
              "completed",
              "cancelled",
            ].includes(
              status
            ) ? (
              <ActionButton
                icon={
                  RotateCcw
                }
                onClick={() =>
                  runSimpleAction(
                    reopenMutation,
                    "Project reopened successfully."
                  )
                }
                disabled={busy}
              >
                Reopen
              </ActionButton>
            ) : null}

            <ActionButton
              icon={Trash2}
              onClick={
                handleDeleteProject
              }
              disabled={busy}
              danger
            >
              Delete
            </ActionButton>
          </div>
        </div>
      </section>

      {notice ? (
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-100">
          {notice}
        </div>
      ) : null}

      {localError ? (
        <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-100">
          {localError}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          label="Project value"
          value={formatCurrency(
            project.projectValue,
            project.currency
          )}
          icon={
            CircleDollarSign
          }
        />

        <InfoCard
          label="Progress"
          value={`${progress}%`}
          icon={Target}
        />

        <InfoCard
          label="Start date"
          value={formatDate(
            project.startDate
          )}
          icon={
            CalendarDays
          }
        />

        <InfoCard
          label="Deadline"
          value={formatDate(
            project.deadline
          )}
          icon={Clock3}
        />
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-white/45">
            Overall progress
          </span>

          <span className="text-sm font-semibold text-white">
            {progress}%
          </span>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-indigo-400/70 transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.85fr]">
        <div className="space-y-6">
          <Section
            title="Project overview"
            description="Core delivery information for this client project."
          >
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-white/35">
                    Summary
                  </label>

                  <textarea
                    value={
                      form.summary
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "summary",
                        event.target
                          .value
                      )
                    }
                    rows={4}
                    className="textarea-base mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-white/35">
                    Services
                  </label>

                  <input
                    value={
                      form.services
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "services",
                        event.target
                          .value
                      )
                    }
                    placeholder="Website Development, SEO"
                    className="input-base mt-2"
                  />

                  <p className="mt-1 text-[11px] text-white/20">
                    Separate services with commas.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-white/35">
                    Scope
                  </label>

                  <textarea
                    value={
                      form.scope
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "scope",
                        event.target
                          .value
                      )
                    }
                    rows={6}
                    className="textarea-base mt-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-white/25">
                    Summary
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/55">
                    {project.summary ||
                      "No project summary added."}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-white/25">
                    Services
                  </p>

                  {project.services
                    ?.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.services.map(
                        (
                          service
                        ) => (
                          <span
                            key={
                              service
                            }
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60"
                          >
                            {
                              service
                            }
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-white/35">
                      No services added.
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-white/25">
                    Scope
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/55">
                    {project.scope ||
                      "No project scope added."}
                  </p>
                </div>
              </div>
            )}
          </Section>

          <Section
            title="Deliverables"
            description="What the client should receive from this project."
          >
            {isEditing ? (
              <>
                <textarea
                  value={
                    form.deliverables
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "deliverables",
                      event.target
                        .value
                    )
                  }
                  rows={6}
                  className="textarea-base"
                  placeholder="Enter one deliverable per line"
                />

                <p className="mt-2 text-[11px] text-white/20">
                  Enter one deliverable per line.
                </p>
              </>
            ) : project
                .deliverables
                ?.length > 0 ? (
              <div className="space-y-3">
                {project.deliverables.map(
                  (
                    deliverable,
                    index
                  ) => (
                    <div
                      key={`${deliverable}-${index}`}
                      className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-4"
                    >
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-300/70"
                      />

                      <p className="text-sm leading-6 text-white/55">
                        {
                          deliverable
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-white/35">
                No deliverables added.
              </p>
            )}
          </Section>

          <Section
            title="Milestones"
            description="Track the important stages of project delivery."
          >
            {canEdit ? (
              <div className="mb-5">
                {!showMilestoneForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalError(
                        ""
                      );

                      setShowMilestoneForm(
                        true
                      );
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/10 px-4 py-2.5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-400/15"
                  >
                    <Plus
                      size={16}
                    />

                    Add milestone
                  </button>
                ) : (
                  <div className="rounded-2xl border border-indigo-400/15 bg-indigo-400/[0.04] p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-xs text-white/35">
                          Title
                        </label>

                        <input
                          value={
                            milestoneForm.title
                          }
                          onChange={(
                            event
                          ) =>
                            setMilestoneForm(
                              (
                                current
                              ) => ({
                                ...current,

                                title:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                          className="input-base mt-2"
                          placeholder="Milestone title"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-white/35">
                          Due date
                        </label>

                        <input
                          type="date"
                          value={
                            milestoneForm.dueDate
                          }
                          onChange={(
                            event
                          ) =>
                            setMilestoneForm(
                              (
                                current
                              ) => ({
                                ...current,

                                dueDate:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                          className="input-base mt-2"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs text-white/35">
                        Description
                      </label>

                      <textarea
                        value={
                          milestoneForm.description
                        }
                        onChange={(
                          event
                        ) =>
                          setMilestoneForm(
                            (
                              current
                            ) => ({
                              ...current,

                              description:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        rows={3}
                        className="textarea-base mt-2"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <ActionButton
                        icon={X}
                        onClick={() => {
                          setShowMilestoneForm(
                            false
                          );

                          setMilestoneForm({
                            title: "",
                            description:
                              "",
                            dueDate: "",
                          });
                        }}
                        disabled={
                          addMilestoneMutation.isPending
                        }
                      >
                        Cancel
                      </ActionButton>

                      <ActionButton
                        icon={Plus}
                        onClick={
                          addMilestone
                        }
                        disabled={
                          addMilestoneMutation.isPending
                        }
                        primary
                      >
                        Add milestone
                      </ActionButton>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {project.milestones
              ?.length > 0 ? (
              <div className="space-y-3">
                {project.milestones.map(
                  (
                    milestone
                  ) => (
                    <div
                      key={
                        milestone._id
                      }
                      className="rounded-2xl border border-white/[0.07] bg-black/10 p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-white/75">
                              {
                                milestone.title
                              }
                            </p>

                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/40">
                              {milestoneStatusLabels[
                                milestone
                                  .status
                              ] ||
                                milestone.status}
                            </span>
                          </div>

                          {milestone.description ? (
                            <p className="mt-2 text-sm leading-6 text-white/40">
                              {
                                milestone.description
                              }
                            </p>
                          ) : null}

                          <p className="mt-2 text-xs text-white/25">
                            Due:{" "}
                            {formatDate(
                              milestone.dueDate
                            )}
                          </p>
                        </div>

                        {canEdit ? (
                          <div className="flex flex-wrap gap-2">
                            {milestone.status !==
                            "pending" ? (
                              <button
                                type="button"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  changeMilestoneStatus(
                                    milestone._id,
                                    "pending"
                                  )
                                }
                                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/45 transition hover:bg-white/[0.07]"
                              >
                                Pending
                              </button>
                            ) : null}

                            {milestone.status !==
                            "in_progress" ? (
                              <button
                                type="button"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  changeMilestoneStatus(
                                    milestone._id,
                                    "in_progress"
                                  )
                                }
                                className="rounded-lg border border-sky-400/15 bg-sky-400/[0.05] px-2.5 py-1.5 text-xs text-sky-200/70 transition hover:bg-sky-400/10"
                              >
                                Start
                              </button>
                            ) : null}

                            {milestone.status !==
                            "completed" ? (
                              <button
                                type="button"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  changeMilestoneStatus(
                                    milestone._id,
                                    "completed"
                                  )
                                }
                                className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-2.5 py-1.5 text-xs text-emerald-200/70 transition hover:bg-emerald-400/10"
                              >
                                Complete
                              </button>
                            ) : null}

                            <button
                              type="button"
                              disabled={
                                busy
                              }
                              onClick={() =>
                                removeMilestone(
                                  milestone._id
                                )
                              }
                              className="rounded-lg border border-rose-400/15 bg-rose-400/[0.05] px-2.5 py-1.5 text-rose-200/70 transition hover:bg-rose-400/10"
                            >
                              <Trash2
                                size={13}
                              />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
                <FolderKanban
                  size={24}
                  className="mx-auto text-white/15"
                />

                <p className="mt-3 text-sm text-white/35">
                  No milestones added yet.
                </p>
              </div>
            )}
          </Section>

          <ProjectInvoiceWorkspace
            project={project}
          />

          <Section
            title="Notes"
            description="Internal project notes."
          >
            {isEditing ? (
              <textarea
                value={
                  form.notes
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "notes",
                    event.target
                      .value
                  )
                }
                rows={5}
                className="textarea-base"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-7 text-white/55">
                {project.notes ||
                  "No notes added."}
              </p>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Commercial">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/35">
                    Project value
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.projectValue
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "projectValue",
                        event.target
                          .value
                      )
                    }
                    className="input-base mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/35">
                    Currency
                  </label>

                  <input
                    value={
                      form.currency
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "currency",
                        event.target
                          .value
                      )
                    }
                    className="input-base mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/35">
                    Progress
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      form.progress
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "progress",
                        event.target
                          .value
                      )
                    }
                    className="input-base mt-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <DetailRow
                  label="Project value"
                  value={formatCurrency(
                    project.projectValue,
                    project.currency
                  )}
                />

                <DetailRow
                  label="Currency"
                  value={
                    project.currency ||
                    "GHS"
                  }
                />

                <DetailRow
                  label="Progress"
                  value={`${progress}%`}
                />
              </div>
            )}
          </Section>

          <Section title="Schedule">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/35">
                    Start date
                  </label>

                  <input
                    type="date"
                    value={
                      form.startDate
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "startDate",
                        event.target
                          .value
                      )
                    }
                    className="input-base mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/35">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={
                      form.deadline
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "deadline",
                        event.target
                          .value
                      )
                    }
                    className="input-base mt-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <DetailRow
                  label="Start date"
                  value={formatDate(
                    project.startDate
                  )}
                />

                <DetailRow
                  label="Deadline"
                  value={formatDate(
                    project.deadline
                  )}
                />

                <DetailRow
                  label="Completed"
                  value={formatDateTime(
                    project.completedAt
                  )}
                />
              </div>
            )}
          </Section>

          <Section title="Client">
            <div className="space-y-4">
              <DetailRow
                label="Lead"
                value={
                  lead?.name ||
                  "Not available"
                }
              />

              <DetailRow
                label="Business"
                value={
                  business?.name ||
                  "Not linked"
                }
              />

              {lead?._id ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/leads/${lead._id}`
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Open lead
                </button>
              ) : null}
            </div>
          </Section>

          <Section title="Sales documents">
            <div className="space-y-3">
              {proposal?._id ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/proposals/${proposal._id}`
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08]"
                >
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                    Proposal
                  </p>

                  <p className="mt-1 text-sm font-medium text-indigo-200">
                    {proposal.proposalNumber ||
                      proposal.title}
                  </p>
                </button>
              ) : (
                <p className="text-sm text-white/30">
                  No proposal linked.
                </p>
              )}

              {quotation?._id ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/quotations/${quotation._id}`
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08]"
                >
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                    Quotation
                  </p>

                  <p className="mt-1 text-sm font-medium text-indigo-200">
                    {quotation.quotationNumber ||
                      quotation.title}
                  </p>
                </button>
              ) : (
                <p className="text-sm text-white/30">
                  No quotation linked.
                </p>
              )}
            </div>
          </Section>

          {status ===
          "cancelled" ? (
            <Section title="Cancellation">
              <p className="text-sm leading-7 text-rose-100/60">
                {project.cancellationReason ||
                  "No cancellation reason provided."}
              </p>

              <p className="mt-3 text-xs text-white/25">
                Cancelled:{" "}
                {formatDateTime(
                  project.cancelledAt
                )}
              </p>
            </Section>
          ) : null}

          <Section title="Record details">
            <div className="space-y-4">
              <DetailRow
                label="Created"
                value={formatDateTime(
                  project.createdAt
                )}
              />

              <DetailRow
                label="Updated"
                value={formatDateTime(
                  project.updatedAt
                )}
              />

              <DetailRow
                label="Project ID"
                value={
                  project._id
                }
              />
            </div>
          </Section>
        </div>
      </div>

      <style>{`
        .input-base {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.20);
          padding: 0.75rem 0.875rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: 150ms ease;
        }

        .input-base:focus {
          border-color: rgba(129,140,248,0.35);
          box-shadow: 0 0 0 2px rgba(129,140,248,0.08);
        }

        .textarea-base {
          width: 100%;
          resize: vertical;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.20);
          padding: 0.875rem;
          font-size: 0.875rem;
          line-height: 1.6;
          color: white;
          outline: none;
        }

        .textarea-base:focus {
          border-color: rgba(129,140,248,0.35);
          box-shadow: 0 0 0 2px rgba(129,140,248,0.08);
        }
      `}</style>
    </div>
  );
};

const DetailRow = ({
  label,
  value,
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-b-0 last:pb-0">
    <span className="text-xs text-white/30">
      {label}
    </span>

    <span className="max-w-[65%] break-words text-right text-sm font-medium text-white/60">
      {value}
    </span>
  </div>
);

export default ProjectDetailsPage;