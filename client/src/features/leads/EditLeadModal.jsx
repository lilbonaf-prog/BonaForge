import {
  useEffect,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  CircleDollarSign,
  Save,
  X,
} from "lucide-react";

const EditLeadModal = ({
  isOpen,
  onClose,
  lead,
  onUpdate,
  isPending = false,
  serverError = "",
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm();

  useEffect(() => {
    if (
      !isOpen ||
      !lead
    ) {
      return;
    }

    reset({
      name:
        lead.name || "",

      companyName:
        lead.companyName || "",

      jobTitle:
        lead.jobTitle || "",

      email:
        lead.email || "",

      phone:
        lead.phone || "",

      whatsapp:
        lead.whatsapp || "",

      preferredContactMethod:
        lead.preferredContactMethod ||
        "whatsapp",

      status:
        lead.status ||
        "new",

      priority:
        lead.priority ||
        "medium",

      estimatedValue:
        lead.estimatedValue ?? "",

      currency:
        lead.currency ||
        "GHS",

      servicesInterestedIn:
        (
          lead.servicesInterestedIn ||
          []
        ).join(", "),

      opportunitySummary:
        lead.opportunitySummary ||
        "",

      nextFollowUpAt:
        lead.nextFollowUpAt
          ? new Date(
              lead.nextFollowUpAt
            )
              .toISOString()
              .slice(0, 16)
          : "",

      source:
        lead.source ||
        "manual",

      sourceDetails:
        lead.sourceDetails ||
        "",

      notes:
        lead.notes || "",
    });
  }, [
    isOpen,
    lead,
    reset,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
          "Escape" &&
        !isPending
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    isPending,
    onClose,
  ]);

  if (
    !isOpen ||
    !lead
  ) {
    return null;
  }

  const submitHandler = (
    values
  ) => {
    const services =
      values
        .servicesInterestedIn
        ?.split(",")
        .map((service) =>
          service.trim()
        )
        .filter(Boolean) ||
      [];

    const payload = {
      name:
        values.name.trim(),

      companyName:
        values.companyName.trim(),

      jobTitle:
        values.jobTitle.trim(),

      email:
        values.email.trim(),

      phone:
        values.phone.trim(),

      whatsapp:
        values.whatsapp.trim(),

      preferredContactMethod:
        values
          .preferredContactMethod,

      status:
        values.status,

      priority:
        values.priority,

      estimatedValue:
        values
          .estimatedValue ===
        ""
          ? 0
          : Number(
              values
                .estimatedValue
            ),

      currency:
        values.currency.trim() ||
        "GHS",

      servicesInterestedIn:
        services,

      opportunitySummary:
        values
          .opportunitySummary
          .trim(),

      nextFollowUpAt:
        values.nextFollowUpAt
          ? new Date(
              values
                .nextFollowUpAt
            ).toISOString()
          : null,

      source:
        values.source,

      sourceDetails:
        values
          .sourceDetails
          .trim(),

      notes:
        values.notes.trim(),
    };

    onUpdate(payload);
  };

  const handleBackdrop =
    (event) => {
      if (
        event.target ===
          event.currentTarget &&
        !isPending
      ) {
        onClose();
      }
    };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onMouseDown={
        handleBackdrop
      }
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0d14] shadow-2xl shadow-black/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_30%)]" />

        {/* HEADER */}
        <div className="relative flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-5 md:px-7">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">
              Lead management
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
              Edit lead
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Update contact details,
              opportunity value,
              pipeline stage,
              follow-up information
              and notes.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isPending
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close edit lead modal"
          >
            <X
              size={18}
            />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(
            submitHandler
          )}
          className="relative overflow-y-auto"
        >
          <div className="space-y-7 px-6 py-6 md:px-7">
            <FormSection
              title="Prospect details"
              description="Update who this prospect is and how you can contact them."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Lead name"
                  required
                  error={
                    errors.name
                      ?.message
                  }
                >
                  <input
                    {...register(
                      "name",
                      {
                        required:
                          "Lead name is required",

                        minLength: {
                          value: 2,
                          message:
                            "Lead name must be at least 2 characters",
                        },
                      }
                    )}
                    className={inputClass}
                  />
                </Field>

                <Field label="Company / business">
                  <input
                    {...register(
                      "companyName"
                    )}
                    className={inputClass}
                  />
                </Field>

                <Field label="Job title">
                  <input
                    {...register(
                      "jobTitle"
                    )}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Email"
                  error={
                    errors.email
                      ?.message
                  }
                >
                  <input
                    type="email"
                    {...register(
                      "email",
                      {
                        pattern: {
                          value:
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message:
                            "Enter a valid email address",
                        },
                      }
                    )}
                    className={inputClass}
                  />
                </Field>

                <Field label="Phone">
                  <input
                    {...register(
                      "phone"
                    )}
                    className={inputClass}
                  />
                </Field>

                <Field label="WhatsApp">
                  <input
                    {...register(
                      "whatsapp"
                    )}
                    className={inputClass}
                  />
                </Field>

                <Field label="Preferred contact">
                  <select
                    {...register(
                      "preferredContactMethod"
                    )}
                    className={inputClass}
                  >
                    <option value="whatsapp">
                      WhatsApp
                    </option>

                    <option value="phone">
                      Phone
                    </option>

                    <option value="email">
                      Email
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Sales pipeline"
              description="Update the stage, priority and value of this opportunity."
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Field label="Stage">
                  <select
                    {...register(
                      "status"
                    )}
                    className={inputClass}
                  >
                    <option value="new">
                      New
                    </option>

                    <option value="contacted">
                      Contacted
                    </option>

                    <option value="follow_up">
                      Follow-up
                    </option>

                    <option value="qualified">
                      Qualified
                    </option>

                    <option value="proposal">
                      Proposal
                    </option>

                    <option value="negotiation">
                      Negotiation
                    </option>

                    <option value="won">
                      Won
                    </option>

                    <option value="lost">
                      Lost
                    </option>
                  </select>
                </Field>

                <Field label="Priority">
                  <select
                    {...register(
                      "priority"
                    )}
                    className={inputClass}
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="urgent">
                      Urgent
                    </option>
                  </select>
                </Field>

                <Field
                  label="Estimated value"
                  error={
                    errors
                      .estimatedValue
                      ?.message
                  }
                >
                  <div className="relative">
                    <CircleDollarSign
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register(
                        "estimatedValue",
                        {
                          min: {
                            value: 0,
                            message:
                              "Value cannot be negative",
                          },
                        }
                      )}
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </Field>

                <Field label="Currency">
                  <input
                    {...register(
                      "currency"
                    )}
                    maxLength={10}
                    className={inputClass}
                  />
                </Field>

                <div className="md:col-span-2 lg:col-span-4">
                  <Field
                    label="Services interested in"
                    helper="Separate multiple services with commas."
                  >
                    <input
                      {...register(
                        "servicesInterestedIn"
                      )}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="md:col-span-2 lg:col-span-4">
                  <Field label="Opportunity summary">
                    <textarea
                      {...register(
                        "opportunitySummary"
                      )}
                      rows={4}
                      className={textareaClass}
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Follow-up"
              description="Keep the next sales action and source information accurate."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Next follow-up">
                  <input
                    type="datetime-local"
                    {...register(
                      "nextFollowUpAt"
                    )}
                    className={inputClass}
                  />
                </Field>

                <Field label="Lead source">
                  <select
                    {...register(
                      "source"
                    )}
                    className={inputClass}
                  >
                    <option value="manual">
                      Manual
                    </option>

                    <option value="business_conversion">
                      Business conversion
                    </option>

                    <option value="referral">
                      Referral
                    </option>

                    <option value="social_media">
                      Social media
                    </option>

                    <option value="website">
                      Website
                    </option>

                    <option value="email">
                      Email
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Source details">
                    <input
                      {...register(
                        "sourceDetails"
                      )}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Notes">
                    <textarea
                      {...register(
                        "notes"
                      )}
                      rows={4}
                      className={textareaClass}
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            {serverError ? (
              <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] px-4 py-3 text-sm leading-6 text-rose-200">
                {serverError}
              </div>
            ) : null}
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/[0.08] bg-[#0b0d14]/95 px-6 py-4 backdrop-blur-xl sm:flex-row sm:justify-end md:px-7">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                isPending
              }
              className="h-11 rounded-xl border border-white/10 px-5 text-sm font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isPending
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save
                size={16}
              />

              {isPending
                ? "Saving changes..."
                : "Save changes"}
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
  children,
}) => {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-white/35">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
};

const Field = ({
  label,
  required = false,
  helper,
  error,
  children,
}) => {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-white/55">
        {label}

        {required ? (
          <span className="ml-1 text-rose-300">
            *
          </span>
        ) : null}
      </span>

      {children}

      {error ? (
        <span className="mt-1.5 block text-xs text-rose-300">
          {error}
        </span>
      ) : helper ? (
        <span className="mt-1.5 block text-[11px] leading-5 text-white/30">
          {helper}
        </span>
      ) : null}
    </label>
  );
};

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:bg-black/30";

const textareaClass =
  "w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:bg-black/30";

export default EditLeadModal;