import {
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "motion/react";

import {
  Building2,
  CircleAlert,
  Filter,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useBusinesses,
} from "../features/businesses/useBusinesses";

import {
  useCreateBusiness,
} from "../features/businesses/useCreateBusiness";

import AddBusinessModal from "../features/businesses/AddBusinessModal";

const statusOptions = [
  {
    value: "all",
    label: "All statuses",
  },
  {
    value: "saved",
    label: "Saved",
  },
  {
    value: "researching",
    label: "Researching",
  },
  {
    value: "researched",
    label: "Researched",
  },
  {
    value: "qualified",
    label: "Qualified",
  },
  {
    value: "not_suitable",
    label: "Not suitable",
  },
  {
    value: "converted",
    label: "Converted",
  },
];

const formatStatus = (
  status
) => {
  if (!status) {
    return "Saved";
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

function BusinessesPage() {
  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    isAddBusinessOpen,
    setIsAddBusinessOpen,
  ] = useState(false);

  const [
    createError,
    setCreateError,
  ] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useBusinesses();

  const createBusinessMutation =
    useCreateBusiness();

  const businesses = useMemo(
    () =>
      data?.businesses || [],
    [data?.businesses]
  );

  const filteredBusinesses =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return businesses.filter(
        (business) => {
          const matchesSearch =
            !normalizedSearch ||
            [
              business.name,
              business.industry,
              business.email,
              business.phone,
              business.location
                ?.city,
              business.location
                ?.region,
            ]
              .filter(Boolean)
              .some((value) =>
                value
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
              );

          const matchesStatus =
            statusFilter ===
              "all" ||
            business.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      businesses,
      searchTerm,
      statusFilter,
    ]);

  const handleCreateBusiness = (
    payload,
    resetForm
  ) => {
    setCreateError("");

    createBusinessMutation.mutate(
      payload,
      {
        onSuccess: () => {
          resetForm();

          setIsAddBusinessOpen(
            false
          );
        },

        onError: (error) => {
          setCreateError(
            error?.response?.data
              ?.message ||
              "Unable to save business. Please try again."
          );
        },
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}

      <motion.header
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-col gap-6 border-b border-[var(--border-primary)] pb-7 xl:flex-row xl:items-end xl:justify-between"
      >
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
            <Sparkles
              size={12}
            />

            Business discovery
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
            Businesses
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Discover, save and
            organize businesses before
            researching their digital
            presence and converting
            them into leads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateError("");

            setIsAddBusinessOpen(
              true
            );
          }}
          className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          <Plus size={16} />

          Add business
        </button>
      </motion.header>

      {/* ============================== */}
      {/* SUMMARY */}
      {/* ============================== */}

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Total businesses
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {businesses.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Researching
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {
              businesses.filter(
                (business) =>
                  business.status ===
                  "researching"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Converted
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {
              businesses.filter(
                (business) =>
                  business.status ===
                  "converted"
              ).length
            }
          </p>
        </div>
      </section>

      {/* ============================== */}
      {/* SEARCH / FILTER */}
      {/* ============================== */}

      <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search businesses, industry, location..."
            className="h-11 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]/50 focus:ring-4 focus:ring-[var(--brand-primary)]/10"
          />
        </div>

        <div className="relative lg:w-52">
          <Filter
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="h-11 w-full appearance-none rounded-xl border border-[var(--border-primary)] bg-[#0d121b] pl-10 pr-4 text-sm text-[var(--text-secondary)] outline-none transition focus:border-[var(--brand-primary)]/50"
          >
            {statusOptions.map(
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
        </div>

        <button
          type="button"
          onClick={() =>
            refetch()
          }
          disabled={
            isFetching
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-primary)] bg-white/[0.025] px-4 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={
              isFetching
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </section>

      {/* ============================== */}
      {/* ERROR */}
      {/* ============================== */}

      {isError && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-4">
          <CircleAlert
            size={18}
            className="mt-0.5 shrink-0 text-red-300"
          />

          <div>
            <p className="text-sm font-semibold text-red-200">
              Unable to load
              businesses
            </p>

            <p className="mt-1 text-xs text-red-200/70">
              {error?.response?.data
                ?.message ||
                "Please try again."}
            </p>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* LOADING */}
      {/* ============================== */}

      {isLoading && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)]"
              />
            )
          )}
        </div>
      )}

      {/* ============================== */}
      {/* EMPTY STATE */}
      {/* ============================== */}

      {!isLoading &&
        !isError &&
        businesses.length === 0 && (
          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-6 flex min-h-[430px] flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border-primary)] bg-[var(--surface-primary)] px-6 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--brand-primary)]/20 blur-3xl" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/10 text-[var(--brand-secondary)]">
                <Building2
                  size={25}
                />
              </div>
            </div>

            <h2 className="mt-6 text-lg font-semibold text-white">
              Start your business
              database
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
              Add businesses you want
              to research and
              potentially work with.
              They do not need to have
              a website.
            </p>

            <button
              type="button"
              onClick={() => {
                setCreateError("");

                setIsAddBusinessOpen(
                  true
                );
              }}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              <Plus size={16} />

              Add your first business
            </button>
          </motion.section>
        )}

      {/* ============================== */}
      {/* NO FILTER RESULTS */}
      {/* ============================== */}

      {!isLoading &&
        !isError &&
        businesses.length > 0 &&
        filteredBusinesses.length ===
          0 && (
          <div className="mt-6 flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border-primary)] bg-[var(--surface-primary)] px-6 text-center">
            <Search
              size={24}
              className="text-[var(--text-muted)]"
            />

            <p className="mt-4 text-sm font-semibold text-white">
              No businesses found
            </p>

            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Try another search or
              status filter.
            </p>
          </div>
        )}

      {/* ============================== */}
      {/* BUSINESS GRID */}
      {/* ============================== */}

      {!isLoading &&
        !isError &&
        filteredBusinesses.length >
          0 && (
          <section className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredBusinesses.map(
              (
                business,
                index
              ) => (
                <motion.article
                  key={
                    business._id
                  }
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index *
                      0.03,
                  }}
                  className="group rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-primary)]/[0.08] text-[var(--brand-secondary)]">
                      <Building2
                        size={19}
                      />
                    </div>

                    <span className="rounded-lg border border-[var(--border-primary)] bg-white/[0.025] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      {formatStatus(
                        business.status
                      )}
                    </span>
                  </div>

                  <h2 className="mt-5 truncate text-base font-semibold text-white">
                    {
                      business.name
                    }
                  </h2>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {business.industry ||
                      "Industry not specified"}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-[var(--border-primary)] pt-4">
                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                      <MapPin
                        size={14}
                        className="shrink-0 text-[var(--text-muted)]"
                      />

                      <span className="truncate">
                        {[
                          business
                            .location
                            ?.city,
                          business
                            .location
                            ?.region,
                          business
                            .location
                            ?.country,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            ", "
                          ) ||
                          "Location not added"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                      <Phone
                        size={14}
                        className="shrink-0 text-[var(--text-muted)]"
                      />

                      <span className="truncate">
                        {business.phone ||
                          "No phone number"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                      <Mail
                        size={14}
                        className="shrink-0 text-[var(--text-muted)]"
                      />

                      <span className="truncate">
                        {business.email ||
                          "No email address"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                      <Globe2
                        size={14}
                        className="shrink-0 text-[var(--text-muted)]"
                      />

                      <span className="truncate">
                        {business.website ||
                          "No website"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[var(--border-primary)] pt-4">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Source:{" "}
                      {formatStatus(
                        business.source
                      )}
                    </span>

                    <Link
                      to={`/businesses/${business._id}`}
                      className="text-xs font-semibold text-[var(--brand-secondary)] transition hover:text-white"
                    >
                      View details
                    </Link>
                  </div>
                </motion.article>
              )
            )}
          </section>
        )}

      {/* ============================== */}
      {/* ADD BUSINESS MODAL */}
      {/* ============================== */}

      <AddBusinessModal
        isOpen={
          isAddBusinessOpen
        }
        onClose={() => {
          setCreateError("");

          setIsAddBusinessOpen(
            false
          );
        }}
        onSubmit={
          handleCreateBusiness
        }
        isPending={
          createBusinessMutation
            .isPending
        }
        serverError={
          createError
        }
      />
    </div>
  );
}

export default BusinessesPage;