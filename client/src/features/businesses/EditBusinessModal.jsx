import {
  Building2,
  BriefcaseBusiness,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  useForm,
} from "react-hook-form";

function EditBusinessModal({
  isOpen,
  onClose,
  onSubmit,
  business,
  isPending = false,
  serverError = "",
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm({
    defaultValues: {
      name: "",
      industry: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      city: "",
      region: "",
      country: "Ghana",
      source: "manual",
      status: "saved",
      notes: "",
    },
  });

  useEffect(() => {
    if (
      isOpen &&
      business
    ) {
      reset({
        name:
          business.name || "",

        industry:
          business.industry || "",

        description:
          business.description || "",

        phone:
          business.phone || "",

        email:
          business.email || "",

        website:
          business.website || "",

        address:
          business.location
            ?.address || "",

        city:
          business.location
            ?.city || "",

        region:
          business.location
            ?.region || "",

        country:
          business.location
            ?.country ||
          "Ghana",

        source:
          business.source ||
          "manual",

        status:
          business.status ||
          "saved",

        notes:
          business.notes || "",
      });
    }
  }, [
    isOpen,
    business,
    reset,
  ]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (isPending) {
      return;
    }

    onClose();
  };

  const submitForm = (
    values
  ) => {
    const payload = {
      name:
        values.name.trim(),

      industry:
        values.industry.trim(),

      description:
        values.description.trim(),

      phone:
        values.phone.trim(),

      email:
        values.email
          .trim()
          .toLowerCase(),

      website:
        values.website.trim(),

      location: {
        address:
          values.address.trim(),

        city:
          values.city.trim(),

        region:
          values.region.trim(),

        country:
          values.country.trim() ||
          "Ghana",
      },

      source:
        values.source,

      status:
        values.status,

      notes:
        values.notes.trim(),
    };

    onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-business-title"
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={handleClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--border-primary)] bg-[#0b0f16] shadow-2xl shadow-black/50">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-5 border-b border-[var(--border-primary)] px-5 py-5 sm:px-7">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/10 text-[var(--brand-secondary)]">
              <Building2
                size={19}
              />
            </div>

            <div>
              <h2
                id="edit-business-title"
                className="text-lg font-semibold tracking-[-0.025em] text-white"
              >
                Edit business
              </h2>

              <p className="mt-1 max-w-lg text-xs leading-5 text-[var(--text-muted)]">
                Update business
                information,
                contact details,
                location and workflow
                status.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-primary)] text-[var(--text-muted)] transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(
            submitForm
          )}
          className="overflow-y-auto"
        >
          <div className="space-y-7 px-5 py-6 sm:px-7">
            {/* BUSINESS INFORMATION */}

            <section>
              <div className="mb-4">
                <p className="text-xs font-semibold text-white">
                  Business
                  information
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Business name
                    <span className="ml-1 text-red-300">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Building2
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      {...register(
                        "name",
                        {
                          required:
                            "Business name is required",

                          minLength: {
                            value: 2,
                            message:
                              "Business name must be at least 2 characters",
                          },
                        }
                      )}
                      type="text"
                      className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50 focus:ring-4 focus:ring-[var(--brand-primary)]/10"
                    />
                  </div>

                  {errors.name && (
                    <p className="mt-1.5 text-[11px] text-red-300">
                      {
                        errors.name
                          .message
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Industry
                  </label>

                  <div className="relative">
                    <BriefcaseBusiness
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      {...register(
                        "industry"
                      )}
                      type="text"
                      className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Status
                  </label>

                  <select
                    {...register(
                      "status"
                    )}
                    className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-[#0d121b] px-3.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)]/50"
                  >
                    <option value="saved">
                      Saved
                    </option>

                    <option value="researching">
                      Researching
                    </option>

                    <option value="researched">
                      Researched
                    </option>

                    <option value="qualified">
                      Qualified
                    </option>

                    <option value="not_suitable">
                      Not suitable
                    </option>

                    <option value="converted">
                      Converted
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Source
                  </label>

                  <select
                    {...register(
                      "source"
                    )}
                    className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-[#0d121b] px-3.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)]/50"
                  >
                    <option value="manual">
                      Manual
                    </option>

                    <option value="google">
                      Google
                    </option>

                    <option value="social_media">
                      Social media
                    </option>

                    <option value="referral">
                      Referral
                    </option>

                    <option value="directory">
                      Directory
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Description
                  </label>

                  <textarea
                    {...register(
                      "description"
                    )}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-[var(--border-primary)] bg-white/[0.025] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50"
                  />
                </div>
              </div>
            </section>

            {/* CONTACT */}

            <section className="border-t border-[var(--border-primary)] pt-6">
              <p className="mb-4 text-xs font-semibold text-white">
                Contact & digital
                presence
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Phone
                  </label>

                  <div className="relative">
                    <Phone
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      {...register(
                        "phone"
                      )}
                      type="text"
                      className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
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
                      type="email"
                      className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50"
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-1.5 text-[11px] text-red-300">
                      {
                        errors.email
                          .message
                      }
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
                    <span>
                      Website
                    </span>

                    <span className="text-[10px] font-normal text-[var(--text-muted)]">
                      Optional
                    </span>
                  </label>

                  <div className="relative">
                    <Globe2
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      {...register(
                        "website"
                      )}
                      type="text"
                      className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* LOCATION */}

            <section className="border-t border-[var(--border-primary)] pt-6">
              <div className="mb-4 flex items-center gap-2">
                <MapPin
                  size={14}
                  className="text-[var(--brand-secondary)]"
                />

                <p className="text-xs font-semibold text-white">
                  Location
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Address
                  </label>

                  <input
                    {...register(
                      "address"
                    )}
                    type="text"
                    className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.025] px-3.5 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    City
                  </label>

                  <input
                    {...register(
                      "city"
                    )}
                    type="text"
                    className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.025] px-3.5 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Region
                  </label>

                  <input
                    {...register(
                      "region"
                    )}
                    type="text"
                    className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.025] px-3.5 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Country
                  </label>

                  <input
                    {...register(
                      "country"
                    )}
                    type="text"
                    className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.025] px-3.5 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50"
                  />
                </div>
              </div>
            </section>

            {/* NOTES */}

            <section className="border-t border-[var(--border-primary)] pt-6">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-white">
                <FileText
                  size={14}
                  className="text-[var(--brand-secondary)]"
                />

                Notes
              </label>

              <textarea
                {...register(
                  "notes"
                )}
                rows={4}
                className="w-full resize-none rounded-xl border border-[var(--border-primary)] bg-white/[0.025] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[var(--brand-primary)]/50"
              />
            </section>

            {serverError && (
              <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-xs text-red-200">
                {serverError}
              </div>
            )}
          </div>

          {/* FOOTER */}

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-[var(--border-primary)] bg-[#0b0f16]/95 px-5 py-4 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="h-11 rounded-xl border border-[var(--border-primary)] px-5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Building2
                size={15}
              />

              {isPending
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBusinessModal;