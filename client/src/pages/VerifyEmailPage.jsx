import {
  useEffect,
  useRef,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useMutation,
} from "@tanstack/react-query";

import { motion } from "motion/react";

import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  LoaderCircle,
  MailCheck,
} from "lucide-react";

import {
  verifyEmail,
} from "../services/authService";

function VerifyEmailPage() {
  const { token } = useParams();

  const verificationStarted =
    useRef(false);

  const {
    mutate,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: (verificationToken) =>
      verifyEmail(
        verificationToken
      ),
  });

  useEffect(() => {
    if (
      !token ||
      verificationStarted.current
    ) {
      return;
    }

    verificationStarted.current =
      true;

    mutate(token);
  }, [token, mutate]);

  const apiError =
    error?.response?.data?.message ||
    (isError
      ? "Unable to verify your email address."
      : "");

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <MailCheck
            size={13}
            className="text-[var(--brand-accent)]"
          />

          Email verification
        </div>

        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-[2.15rem]">
          Verify your email
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          BonaForge is confirming that
          this email address belongs to
          you.
        </p>
      </div>

      {isPending && (
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-white/[0.035]">
              <LoaderCircle
                size={20}
                className="animate-spin text-[var(--brand-secondary)]"
              />
            </div>

            <div>
              <p className="font-semibold text-white">
                Verifying email...
              </p>

              <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                Please keep this page
                open while we validate
                your verification link.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {isSuccess && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.98,
            y: 8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
              <BadgeCheck
                size={21}
                className="text-emerald-300"
              />
            </div>

            <div>
              <p className="font-semibold text-white">
                Email verified
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-100/70">
                Your email address has
                been verified successfully.
                Your BonaForge account is
                ready.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {apiError && (
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10">
              <CircleAlert
                size={20}
                className="text-red-300"
              />
            </div>

            <div>
              <p className="font-semibold text-white">
                Verification failed
              </p>

              <p className="mt-1 text-sm leading-6 text-red-100/70">
                {apiError}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <Link
        to="/login"
        className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition duration-200 hover:bg-white/90"
      >
        Continue to sign in

        <ArrowRight
          size={16}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </Link>

      <p className="mt-6 text-center text-[11px] leading-5 text-[var(--text-muted)]">
        Verification links are
        single-use and expire for
        security.
      </p>
    </div>
  );
}

export default VerifyEmailPage;