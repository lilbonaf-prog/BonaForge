import {
  useState,
} from "react";

import {
  CalendarClock,
  Clock3,
  FileText,
  MessageCircleMore,
  Save,
  X,
} from "lucide-react";

const activityTypes = [
  {
    value: "phone_call",
    label: "Phone call",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "sms",
    label: "SMS",
  },
  {
    value: "meeting",
    label: "Meeting",
  },
  {
    value: "social_media",
    label: "Social media",
  },
  {
    value: "note",
    label: "Internal note",
  },
  {
    value: "other",
    label: "Other",
  },
];

const directions = [
  {
    value: "outbound",
    label: "Outbound",
  },
  {
    value: "inbound",
    label: "Inbound",
  },
  {
    value: "internal",
    label: "Internal",
  },
];

const outcomes = [
  {
    value: "connected",
    label: "Connected",
  },
  {
    value: "no_answer",
    label: "No answer",
  },
  {
    value: "left_message",
    label: "Left message",
  },
  {
    value: "replied",
    label: "Replied",
  },
  {
    value: "interested",
    label: "Interested",
  },
  {
    value: "not_interested",
    label: "Not interested",
  },
  {
    value: "follow_up_required",
    label: "Follow-up required",
  },
  {
    value: "meeting_scheduled",
    label: "Meeting scheduled",
  },
  {
    value: "proposal_requested",
    label: "Proposal requested",
  },
  {
    value: "quotation_requested",
    label: "Quotation requested",
  },
  {
    value: "won",
    label: "Won",
  },
  {
    value: "lost",
    label: "Lost",
  },
  {
    value: "other",
    label: "Other",
  },
];

const pipelineStatuses = [
  {
    value: "",
    label: "Let BonaForge decide",
  },
  {
    value: "new",
    label: "New",
  },
  {
    value: "contacted",
    label: "Contacted",
  },
  {
    value: "follow_up",
    label: "Follow-up",
  },
  {
    value: "qualified",
    label: "Qualified",
  },
  {
    value: "proposal",
    label: "Proposal",
  },
  {
    value: "negotiation",
    label: "Negotiation",
  },
  {
    value: "won",
    label: "Won",
  },
  {
    value: "lost",
    label: "Lost",
  },
];

const getLocalDateTimeValue = (
  date = new Date()
) => {
  const timezoneOffset =
    date.getTimezoneOffset() *
    60 *
    1000;

  return new Date(
    date.getTime() -
      timezoneOffset
  )
    .toISOString()
    .slice(0, 16);
};

const createInitialForm = () => ({
  type: "phone_call",
  direction: "outbound",
  subject: "",
  summary: "",
  notes: "",
  outcome: "connected",
  contactedAt:
    getLocalDateTimeValue(),
  durationMinutes: "",
  followUpRequired: false,
  nextFollowUpAt: "",
  followUpNote: "",
  leadStatusAfter: "",
});

const LogLeadActivityModal = ({
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
  serverError = "",
}) => {
  const [
    form,
    setForm,
  ] = useState(() =>
    createInitialForm()
  );

  const [
    validationError,
    setValidationError,
  ] = useState("");

  if (!isOpen) {
    return null;
  }

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (validationError) {
      setValidationError("");
    }
  };

  const resetForm = () => {
    setForm(
      createInitialForm()
    );

    setValidationError("");
  };

  const handleClose = () => {
    if (isPending) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      form.followUpRequired &&
      !form.nextFollowUpAt
    ) {
      setValidationError(
        "Choose the next follow-up date and time."
      );

      return;
    }

    const duration =
      form.durationMinutes === ""
        ? 0
        : Number(
            form.durationMinutes
          );

    if (
      Number.isNaN(duration) ||
      duration < 0
    ) {
      setValidationError(
        "Duration must be zero or a positive number."
      );

      return;
    }

    const payload = {
      type: form.type,
      direction:
        form.direction,
      subject:
        form.subject.trim(),
      summary:
        form.summary.trim(),
      notes:
        form.notes.trim(),
      outcome:
        form.outcome,

      contactedAt:
        form.contactedAt
          ? new Date(
              form.contactedAt
            ).toISOString()
          : new Date()
              .toISOString(),

      durationMinutes:
        duration,

      followUpRequired:
        form.followUpRequired,

      nextFollowUpAt:
        form.followUpRequired &&
        form.nextFollowUpAt
          ? new Date(
              form.nextFollowUpAt
            ).toISOString()
          : null,

      followUpNote:
        form.followUpNote.trim(),
    };

    if (
      form.leadStatusAfter
    ) {
      payload.leadStatusAfter =
        form.leadStatusAfter;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close activity modal"
        onClick={
          isPending
            ? undefined
            : handleClose
        }
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/10 bg-[#0b0d12] shadow-2xl shadow-black/60">
        {/* HEADER */}

        <div className="relative overflow-hidden border-b border-white/[0.07] px-6 py-6 md:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_32%)]" />

          <div className="relative flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-indigo-200/60">
                <MessageCircleMore
                  size={14}
                />

                Sales activity
              </div>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Log contact
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                Record a call,
                WhatsApp message,
                email, meeting or
                other interaction and
                schedule the next
                follow-up when needed.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleClose
              }
              disabled={
                isPending
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* BODY */}

        <form
          onSubmit={
            handleSubmit
          }
          className="max-h-[calc(92vh-130px)] overflow-y-auto"
        >
          <div className="space-y-7 p-6 md:p-8">
            {(validationError ||
              serverError) && (
              <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">
                {validationError ||
                  serverError}
              </div>
            )}

            <FormSection
              title="Contact details"
              description="What happened and how did you communicate with this prospect?"
              icon={MessageCircleMore}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Activity type"
                  value={form.type}
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "type",
                      value
                    )
                  }
                  options={
                    activityTypes
                  }
                />

                <SelectField
                  label="Direction"
                  value={
                    form.direction
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "direction",
                      value
                    )
                  }
                  options={
                    directions
                  }
                />

                <div className="md:col-span-2">
                  <TextField
                    label="Subject"
                    placeholder="Example: Initial WhatsApp introduction"
                    value={
                      form.subject
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "subject",
                        value
                      )
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <TextareaField
                    label="Summary"
                    placeholder="Briefly summarize the conversation, prospect response and important details."
                    value={
                      form.summary
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "summary",
                        value
                      )
                    }
                    rows={4}
                  />
                </div>

                <SelectField
                  label="Outcome"
                  value={
                    form.outcome
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "outcome",
                      value
                    )
                  }
                  options={
                    outcomes
                  }
                />

                <SelectField
                  label="Lead status after contact"
                  value={
                    form.leadStatusAfter
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "leadStatusAfter",
                      value
                    )
                  }
                  options={
                    pipelineStatuses
                  }
                />
              </div>
            </FormSection>

            <FormSection
              title="Contact timing"
              description="Record when the interaction happened and how long it lasted."
              icon={Clock3}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <DateTimeField
                  label="Contacted at"
                  value={
                    form.contactedAt
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "contactedAt",
                      value
                    )
                  }
                />

                <NumberField
                  label="Duration in minutes"
                  placeholder="0"
                  value={
                    form.durationMinutes
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "durationMinutes",
                      value
                    )
                  }
                />
              </div>
            </FormSection>

            <FormSection
              title="Next follow-up"
              description="Schedule the next action so this prospect never gets forgotten."
              icon={
                CalendarClock
              }
            >
              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:bg-white/[0.045]">
                <input
                  type="checkbox"
                  checked={
                    form.followUpRequired
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "followUpRequired",
                      event.target
                        .checked
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-black/20 accent-indigo-500"
                />

                <div>
                  <p className="text-sm font-medium text-white/80">
                    Follow-up
                    required
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Add this contact
                    to the active
                    Follow-Up
                    workspace.
                  </p>
                </div>
              </label>

              {form.followUpRequired ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <DateTimeField
                    label="Next follow-up date"
                    value={
                      form.nextFollowUpAt
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "nextFollowUpAt",
                        value
                      )
                    }
                    required
                  />

                  <div className="md:col-span-2">
                    <TextareaField
                      label="Follow-up note"
                      placeholder="Example: Ask whether they reviewed the website proposal and discuss budget."
                      value={
                        form.followUpNote
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "followUpNote",
                          value
                        )
                      }
                      rows={3}
                    />
                  </div>
                </div>
              ) : null}
            </FormSection>

            <FormSection
              title="Internal notes"
              description="Keep extra sales context for yourself."
              icon={FileText}
            >
              <TextareaField
                label="Private notes"
                placeholder="Add any additional context, objections, buying signals or internal reminders."
                value={
                  form.notes
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "notes",
                    value
                  )
                }
                rows={4}
              />
            </FormSection>
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/[0.07] bg-[#0b0d12]/95 px-6 py-5 backdrop-blur-xl sm:flex-row sm:justify-end md:px-8">
            <button
              type="button"
              onClick={
                handleClose
              }
              disabled={
                isPending
              }
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-white/55 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isPending
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/15 px-5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200/25 border-t-indigo-100" />
                  Saving...
                </>
              ) : (
                <>
                  <Save
                    size={16}
                  />
                  Log activity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormSection = ({
  title,
  description,
  icon: Icon,
  children,
}) => (
  <section className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 md:p-6">
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/50">
        <Icon size={17} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-white/35">
          {description}
        </p>
      </div>
    </div>

    {children}
  </section>
);

const TextField = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-medium text-white/40">
      {label}
    </span>

    <input
      type="text"
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-white/[0.09] bg-black/15 px-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-indigo-400/35 focus:bg-black/20"
    />
  </label>
);

const TextareaField = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-medium text-white/40">
      {label}
    </span>

    <textarea
      rows={rows}
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      placeholder={placeholder}
      className="w-full resize-y rounded-xl border border-white/[0.09] bg-black/15 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-indigo-400/35 focus:bg-black/20"
    />
  </label>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-medium text-white/40">
      {label}
    </span>

    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="h-11 w-full rounded-xl border border-white/[0.09] bg-[#10131a] px-3.5 text-sm text-white/75 outline-none transition focus:border-indigo-400/35"
    >
      {options.map(
        (option) => (
          <option
            key={
              option.value
            }
            value={
              option.value
            }
          >
            {option.label}
          </option>
        )
      )}
    </select>
  </label>
);

const DateTimeField = ({
  label,
  value,
  onChange,
  required = false,
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-medium text-white/40">
      {label}
    </span>

    <input
      type="datetime-local"
      value={value}
      required={required}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="h-11 w-full rounded-xl border border-white/[0.09] bg-[#10131a] px-3.5 text-sm text-white/70 outline-none transition focus:border-indigo-400/35"
    />
  </label>
);

const NumberField = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-medium text-white/40">
      {label}
    </span>

    <input
      type="number"
      min="0"
      max="1440"
      step="1"
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-white/[0.09] bg-black/15 px-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-indigo-400/35"
    />
  </label>
);

export default LogLeadActivityModal;