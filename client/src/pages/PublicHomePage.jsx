import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

const workflow = [
  {
    icon: Search,
    title: "Discover",
    description:
      "Organize businesses and identify potential opportunities.",
  },
  {
    icon: Target,
    title: "Qualify",
    description:
      "Research prospects and evaluate where real business value exists.",
  },
  {
    icon: FileText,
    title: "Propose",
    description:
      "Turn opportunities into structured proposals and quotations.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Deliver",
    description:
      "Track projects, invoices and payments after the deal is won.",
  },
];

const capabilities = [
  "Business and lead management",
  "Research and website audits",
  "Opportunity analysis",
  "Follow-up tracking",
  "Proposal and quotation workflows",
  "Project management",
  "Invoices and payments",
  "Revenue analytics",
];

function PublicHomePage() {
  return (
    <div>
      {/* HERO */}

      <section className="mx-auto max-w-[1500px] px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:px-10 lg:pb-28 lg:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <Sparkles
              size={14}
              className="text-[var(--brand-accent)]"
            />

            Client acquisition. Organized.
          </div>

          <h1 className="text-[clamp(3.2rem,8vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-white">
            Turn opportunities
            <span className="block bg-gradient-to-r from-[#9b87ff] via-[#7c8cff] to-[#5ca9ff] bg-clip-text text-transparent">
              into real business.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
            BonaForge is a client acquisition operating
            system built by Bona Fide to manage the full
            journey from discovering a business to closing
            the deal, delivering the work and tracking
            revenue.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/demo"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Explore the read-only demo

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              to="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border-primary)] bg-white/[0.03] px-6 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
            >
              <ShieldCheck size={16} />

              Admin access
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
            <ShieldCheck
              size={14}
              className="text-emerald-300"
            />

            Visitor access is read-only and separated
            from private workspace data.
          </div>
        </div>
      </section>

      {/* WORKFLOW */}

      <section className="border-y border-[var(--border-primary)] bg-white/[0.015]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mb-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-secondary)]">
              <Workflow size={15} />

              The workflow
            </div>

            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              One system from prospect to revenue.
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              BonaForge keeps the entire client journey
              connected instead of scattering work across
              disconnected notes, spreadsheets and tools.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map(
              ({
                icon: Icon,
                title,
                description,
              }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-6"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                    <Icon
                      size={19}
                      className="text-[var(--brand-secondary)]"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-white">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    {description}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}

      <section className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-28">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-secondary)]">
            <BarChart3 size={15} />

            What BonaForge manages
          </div>

          <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            A complete client acquisition workspace.
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            The private administrator workspace contains
            the tools required to research prospects,
            manage communication, prepare commercial
            documents and follow revenue after conversion.
          </p>

          <Link
            to="/demo"
            className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white"
          >
            See the public demo

            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {capabilities.map(
            (capability) => (
              <div
                key={capability}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.07] text-emerald-300">
                  <CheckCircle2
                    size={16}
                  />
                </div>

                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {capability}
                </span>
              </div>
            )
          )}
        </div>
      </section>

      {/* DEMO CTA */}

      <section className="mx-auto max-w-[1500px] px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <div className="overflow-hidden rounded-[28px] border border-[var(--border-primary)] bg-gradient-to-br from-white/[0.06] to-white/[0.015] p-7 sm:p-10 lg:p-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                Public showcase
              </div>

              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Explore BonaForge without changing anything.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                The demo workspace uses safe sample data.
                Visitors can understand the product and
                explore its workflow without receiving
                access to private admin records or editing
                controls.
              </p>
            </div>

            <Link
              to="/demo"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Open demo workspace

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PublicHomePage;