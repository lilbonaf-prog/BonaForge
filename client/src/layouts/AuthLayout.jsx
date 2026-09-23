import { Outlet } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle2,
  Command,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const features = [
  {
    icon: Workflow,
    title: "One operating system",
    description:
      "Manage prospects, opportunities, proposals, projects and revenue from one workspace.",
  },
  {
    icon: ShieldCheck,
    title: "Built for serious work",
    description:
      "Secure authentication, structured workflows and a foundation designed to scale.",
  },
  {
    icon: Sparkles,
    title: "Designed to move fast",
    description:
      "Turn business opportunities into organized client relationships without losing momentum.",
  },
];

function AuthLayout() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute left-[-14rem] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-[var(--brand-primary)]/10 blur-[120px]" />

        <div className="absolute bottom-[-18rem] right-[-12rem] h-[38rem] w-[38rem] rounded-full bg-[var(--brand-secondary)]/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)]" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[1.08fr_0.92fr]">
        {/* Left brand panel */}
        <section className="relative hidden min-h-screen border-r border-[var(--border-primary)] px-10 py-10 lg:flex lg:flex-col xl:px-16 xl:py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-lg shadow-black/20 backdrop-blur-xl">
                <Command
                  size={20}
                  strokeWidth={2}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-[15px] font-semibold tracking-[-0.01em] text-white">
                  BonaForge
                </p>

                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  by Bona Fide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-white/[0.025] px-3 py-1.5 text-xs text-[var(--text-secondary)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)] shadow-[0_0_12px_rgba(36,214,166,.7)]" />
              Client acquisition OS
            </div>
          </div>

          <div className="my-auto max-w-2xl py-16">
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] backdrop-blur-xl">
                <Sparkles
                  size={14}
                  className="text-[var(--brand-accent)]"
                />
                Forge opportunities into clients
              </div>

              <h1 className="max-w-xl text-[clamp(3rem,5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-white">
                Your entire client pipeline.
                <span className="block bg-gradient-to-r from-[#9b87ff] via-[#7c8cff] to-[#5ca9ff] bg-clip-text text-transparent">
                  Engineered to convert.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-[17px] leading-8 text-[var(--text-secondary)]">
                Discover businesses, research opportunities,
                manage outreach, create proposals, close deals
                and track the work that follows.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-3">
              {features.map(
                (
                  {
                    icon: Icon,
                    title,
                    description,
                  },
                  index
                ) => (
                  <motion.div
                    key={title}
                    initial={{
                      opacity: 0,
                      x: -14,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        0.14 +
                        index * 0.08,
                      duration: 0.45,
                    }}
                    className="group flex gap-4 rounded-2xl border border-transparent p-3 transition-colors duration-300 hover:border-[var(--border-primary)] hover:bg-white/[0.025]"
                  >
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-white/[0.035]">
                      <Icon
                        size={17}
                        className="text-[var(--text-secondary)] transition-colors group-hover:text-white"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {title}
                      </p>

                      <p className="mt-1 max-w-md text-sm leading-6 text-[var(--text-muted)]">
                        {description}
                      </p>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border-primary)] pt-6">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <CheckCircle2
                size={14}
                className="text-[var(--brand-accent)]"
              />
              Secure workspace
            </div>

            <button
              type="button"
              className="group flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-white"
            >
              bonafide
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </section>

        {/* Auth form area */}
        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-20">
          {/* Mobile logo */}
          <div className="absolute left-5 top-6 flex items-center gap-3 lg:hidden sm:left-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <Command
                size={18}
                className="text-white"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                BonaForge
              </p>

              <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                by Bona Fide
              </p>
            </div>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.985,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-[460px]"
          >
            <Outlet />
          </motion.div>
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;