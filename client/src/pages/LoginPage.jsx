import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  useForm,
} from "react-hook-form";
import {
  zodResolver,
} from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  login,
} from "../services/authService";

import {
  useAuth,
} from "../features/auth/AuthContext";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: (data) => {
      saveSession(
        data.token,
        data.user
      );

      navigate("/dashboard", {
        replace: true,
      });
    },
  });

  const onSubmit = (values) => {
    loginMutation.mutate(values);
  };

  const apiError =
    loginMutation.error?.response?.data?.message ||
    (loginMutation.isError
      ? "Unable to sign in. Please try again."
      : "");

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <LockKeyhole
            size={13}
            className="text-[var(--brand-accent)]"
          />
          Secure sign in
        </div>

        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-[2.15rem]">
          Welcome back
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          Sign in to continue managing your
          BonaForge workspace.
        </p>
      </div>

      {apiError && (
        <motion.div
          initial={{
            opacity: 0,
            y: -6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-5 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200"
        >
          {apiError}
        </motion.div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
          >
            Email address
          </label>

          <div className="relative">
            <Mail
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none transition duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]/60 focus:bg-white/[0.045] focus:ring-4 focus:ring-[var(--brand-primary)]/10"
            />
          </div>

          {errors.email && (
            <p className="mt-2 text-xs text-red-300">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[var(--text-secondary)]"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-medium text-[var(--brand-secondary)] transition-colors hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <LockKeyhole
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />

            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
              className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-white/[0.03] pl-11 pr-12 text-sm text-white outline-none transition duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]/60 focus:bg-white/[0.045] focus:ring-4 focus:ring-[var(--brand-primary)]/10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-[var(--text-muted)] transition-colors hover:text-white"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-2 text-xs text-red-300">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            loginMutation.isPending
          }
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending
            ? "Signing in..."
            : "Sign in"}

          {!loginMutation.isPending && (
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          )}
        </button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--border-primary)]" />

        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
          New workspace
        </span>

        <div className="h-px flex-1 bg-[var(--border-primary)]" />
      </div>

      <div className="rounded-2xl border border-[var(--border-primary)] bg-white/[0.025] p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-white transition-colors hover:text-[var(--brand-secondary)]"
          >
            Create your BonaForge account
          </Link>
        </p>
      </div>

      <p className="mt-7 text-center text-[11px] leading-5 text-[var(--text-muted)]">
        Protected by BonaForge authentication
        security and encrypted connections.
      </p>
    </div>
  );
}

export default LoginPage;