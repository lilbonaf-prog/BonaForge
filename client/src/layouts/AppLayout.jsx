import {
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "motion/react";

import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ChevronRight,
  FileText,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Search,
  Settings,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import {
  logout,
} from "../services/authService";

import {
  useAuth,
} from "../features/auth/authContext";

// ==============================
// NAVIGATION
// ==============================

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
  },
  {
    label: "Businesses",
    icon: Building2,
    to: "/businesses",
  },
  {
    label: "Leads",
    icon: UsersRound,
    to: "/leads",
  },
  {
    label: "Follow-Ups",
    icon: CalendarClock,
    to: "/follow-ups",
  },
  {
    label: "Research",
    icon: Search,
    to: "/research",
  },
  {
    label: "Website Audit",
    icon: Globe2,
    to: "/website-audits",
  },
  {
    label: "Opportunities",
    icon: Target,
    to: "/opportunities",
  },
  {
    label: "Proposals",
    icon: FileText,
    to: "/proposals",
  },
  {
    label: "Quotations",
    icon: ReceiptText,
    to: "/quotations",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    comingSoon: true,
  },
  {
    label: "Invoices",
    icon: ReceiptText,
    comingSoon: true,
  },
  {
    label: "Analytics",
    icon: BarChart3,
    comingSoon: true,
  },
];

// ==============================
// SIDEBAR CONTENT
// ==============================

function SidebarContent({
  user,
  initials,
  closeMobileSidebar,
  handleLogout,
  isLoggingOut,
}) {
  return (
    <>
      {/* ============================== */}
      {/* BRAND */}
      {/* ============================== */}

      <div className="flex h-20 items-center border-b border-[var(--border-primary)] px-5">
        <NavLink
          to="/dashboard"
          onClick={
            closeMobileSidebar
          }
          className="flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] shadow-lg shadow-[var(--brand-primary)]/15">
            <Sparkles
              size={18}
              className="text-white"
            />

            <div className="absolute inset-0 bg-white/[0.06]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-semibold tracking-[-0.025em] text-white">
                BonaForge
              </span>

              <span className="rounded-md border border-[var(--border-primary)] bg-white/[0.04] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                OS
              </span>
            </div>

            <p className="mt-0.5 text-[10px] tracking-[0.04em] text-[var(--text-muted)]">
              by Bona Fide
            </p>
          </div>
        </NavLink>
      </div>

      {/* ============================== */}
      {/* WORKSPACE LABEL */}
      {/* ============================== */}

      <div className="px-4 pt-6">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Workspace
        </p>
      </div>

      {/* ============================== */}
      {/* NAVIGATION */}
      {/* ============================== */}

      <nav className="mt-3 flex-1 space-y-1 px-3">
        {navigation.map(
          (item) => {
            const Icon =
              item.icon;

            if (
              item.comingSoon
            ) {
              return (
                <button
                  key={
                    item.label
                  }
                  type="button"
                  disabled
                  className="group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-[var(--text-muted)] opacity-55"
                >
                  <Icon
                    size={17}
                  />

                  <span className="flex-1">
                    {
                      item.label
                    }
                  </span>

                  <span className="rounded-md border border-[var(--border-primary)] bg-white/[0.025] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em]">
                    Soon
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={
                  item.label
                }
                to={
                  item.to
                }
                onClick={
                  closeMobileSidebar
                }
                className={({
                  isActive,
                }) =>
                  `group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                    isActive
                      ? "border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/10 text-white"
                      : "border border-transparent text-[var(--text-secondary)] hover:bg-white/[0.035] hover:text-white"
                  }`
                }
              >
                {({
                  isActive,
                }) => (
                  <>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                        isActive
                          ? "bg-[var(--brand-primary)]/15 text-[var(--brand-secondary)]"
                          : "text-[var(--text-muted)] group-hover:text-white"
                      }`}
                    >
                      <Icon
                        size={16}
                      />
                    </div>

                    <span className="flex-1">
                      {
                        item.label
                      }
                    </span>

                    {isActive && (
                      <ChevronRight
                        size={13}
                        className="text-[var(--brand-secondary)]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          }
        )}
      </nav>

      {/* ============================== */}
      {/* CLIENT ACQUISITION ENGINE */}
      {/* ============================== */}

      <div className="mx-4 mb-4 rounded-2xl border border-[var(--brand-primary)]/15 bg-gradient-to-br from-[var(--brand-primary)]/[0.08] to-transparent p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--brand-primary)]/15 bg-[var(--brand-primary)]/10 text-[var(--brand-secondary)]">
          <BriefcaseBusiness
            size={15}
          />
        </div>

        <p className="mt-3 text-xs font-semibold text-white">
          Client Acquisition OS
        </p>

        <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">
          Find, convert and manage
          clients from one workspace.
        </p>
      </div>

      {/* ============================== */}
      {/* ACCOUNT */}
      {/* ============================== */}

      <div className="border-t border-[var(--border-primary)] p-3">
        <NavLink
          to="/account"
          onClick={
            closeMobileSidebar
          }
          className="group flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-white/[0.035]"
        >
          {user?.avatar?.url ? (
            <img
              src={
                user.avatar.url
              }
              alt={
                user.name
              }
              className="h-9 w-9 rounded-xl border border-[var(--border-primary)] object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-gradient-to-br from-[var(--brand-primary)]/25 to-[var(--brand-secondary)]/10 text-xs font-semibold text-white">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {user?.name}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
              {user?.email}
            </p>
          </div>

          <Settings
            size={15}
            className="text-[var(--text-muted)] transition group-hover:text-white"
          />
        </NavLink>

        <button
          type="button"
          onClick={
            handleLogout
          }
          disabled={
            isLoggingOut
          }
          className="mt-1 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-medium text-[var(--text-muted)] transition hover:bg-red-400/[0.05] hover:text-red-200 disabled:opacity-50"
        >
          <LogOut
            size={15}
          />

          {isLoggingOut
            ? "Signing out..."
            : "Sign out"}
        </button>
      </div>
    </>
  );
}

// ==============================
// APP LAYOUT
// ==============================

function AppLayout() {
  const navigate =
    useNavigate();

  const {
    user,
    clearSession,
  } = useAuth();

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  // ==============================
  // USER INITIALS
  // ==============================

  const initials =
    user?.name
      ?.split(" ")
      .map((part) =>
        part.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase() || "BF";

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout =
    async () => {
      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(true);

      try {
        await logout();
      } catch {
        // Local logout must still work
        // even if the API request fails.
      } finally {
        clearSession();

        navigate(
          "/login",
          {
            replace: true,
          }
        );
      }
    };

  // ==============================
  // MOBILE SIDEBAR
  // ==============================

  const closeMobileSidebar =
    () => {
      setMobileSidebarOpen(
        false
      );
    };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white">
      {/* ============================== */}
      {/* BACKGROUND EFFECTS */}
      {/* ============================== */}

      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
      >
        <div className="absolute left-[14rem] top-[-15rem] h-[32rem] w-[32rem] rounded-full bg-[var(--brand-primary)]/[0.055] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize:
              "52px 52px",
          }}
        />
      </div>

      {/* ============================== */}
      {/* DESKTOP SIDEBAR */}
      {/* ============================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] flex-col overflow-y-auto border-r border-[var(--border-primary)] bg-[#090c12]/95 backdrop-blur-xl lg:flex">
        <SidebarContent
          user={
            user
          }
          initials={
            initials
          }
          closeMobileSidebar={
            closeMobileSidebar
          }
          handleLogout={
            handleLogout
          }
          isLoggingOut={
            isLoggingOut
          }
        />
      </aside>

      {/* ============================== */}
      {/* MOBILE SIDEBAR */}
      {/* ============================== */}

      {mobileSidebarOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={
              closeMobileSidebar
            }
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
          />

          <motion.aside
            initial={{
              x: -280,
            }}
            animate={{
              x: 0,
            }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-y-auto border-r border-[var(--border-primary)] bg-[#090c12] shadow-2xl lg:hidden"
          >
            <button
              type="button"
              onClick={
                closeMobileSidebar
              }
              aria-label="Close menu"
              className="absolute right-3 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-white/[0.03] text-[var(--text-secondary)] transition hover:text-white"
            >
              <X
                size={17}
              />
            </button>

            <SidebarContent
              user={
                user
              }
              initials={
                initials
              }
              closeMobileSidebar={
                closeMobileSidebar
              }
              handleLogout={
                handleLogout
              }
              isLoggingOut={
                isLoggingOut
              }
            />
          </motion.aside>
        </>
      )}

      {/* ============================== */}
      {/* MAIN WORKSPACE */}
      {/* ============================== */}

      <div className="relative min-h-screen lg:pl-[250px]">
        {/* ============================== */}
        {/* MOBILE HEADER */}
        {/* ============================== */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/85 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileSidebarOpen(
                true
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-white/[0.025] text-[var(--text-secondary)] transition hover:text-white"
            aria-label="Open navigation"
          >
            <Menu
              size={18}
            />
          </button>

          <NavLink
            to="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)]">
              <Sparkles
                size={14}
              />
            </div>

            <span className="text-sm font-semibold">
              BonaForge
            </span>
          </NavLink>

          <NavLink
            to="/account"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-primary)] bg-white/[0.025]"
            aria-label="Account settings"
          >
            {user?.avatar?.url ? (
              <img
                src={
                  user.avatar.url
                }
                alt={
                  user.name
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound
                size={17}
              />
            )}
          </NavLink>
        </header>

        {/* ============================== */}
        {/* PAGE CONTENT */}
        {/* ============================== */}

        <main className="relative min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;