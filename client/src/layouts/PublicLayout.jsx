import {
  Link,
  Outlet,
} from "react-router-dom";

import { motion } from "motion/react";

import {
  ArrowRight,
  Command,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

function PublicLayout() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-white">
      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
      >
        <div className="absolute left-[-12rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-[var(--brand-primary)]/10 blur-[130px]" />

        <div className="absolute bottom-[-16rem] right-[-12rem] h-[36rem] w-[36rem] rounded-full bg-[var(--brand-secondary)]/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize:
              "54px 54px",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)]" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-lg shadow-black/20">
              <Command
                size={20}
                className="text-white"
              />
            </div>

            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-white">
                BonaForge
              </p>

              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                by Bona Fide
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5 text-xs text-emerald-200 md:flex">
              <ShieldCheck size={13} />

              Read-only visitor access
            </div>

            <Link
              to="/demo"
              className="hidden items-center gap-2 rounded-xl border border-[var(--border-primary)] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white/[0.07] hover:text-white sm:inline-flex"
            >
              View demo

              <ArrowRight
                size={15}
              />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              <LockKeyhole
                size={15}
              />

              <span className="hidden sm:inline">
                Admin sign in
              </span>

              <span className="sm:hidden">
                Admin
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Public content */}
      <motion.div
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="relative z-10"
      >
        <Outlet />
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border-primary)]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-8 text-xs text-[var(--text-muted)] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            © BonaForge by Bona Fide
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck
              size={14}
              className="text-emerald-300"
            />

            Public views are read-only
          </div>
        </div>
      </footer>
    </main>
  );
}

export default PublicLayout;