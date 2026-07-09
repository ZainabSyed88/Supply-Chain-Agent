import { NavLink } from "react-router-dom"
import {
  Bot,
  Building2,
  Factory,
  FileText,
  Globe2,
  Headset,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Play,
  ShieldCheck,
  Sparkles,
  X
} from "lucide-react"
import clsx from "clsx"
import ChainPulseLogo from "../branding/ChainPulseLogo"
import StatusDot from "../ui/StatusDot"
import { useLocalization } from "../../context/LocalizationContext"
import { formatRelativeTime } from "../../utils/formatters"

const NAV_ITEMS = [
  {
    to: "/dashboard",
    labelKey: "routes.dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-sky-200 bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(255,255,255,0.98)_58%,rgba(186,230,253,0.78))] text-sky-800 shadow-[0_14px_28px_rgba(14,165,233,0.12)]",
      icon: "border-sky-200 bg-sky-50 text-sky-600",
      hover: "hover:border-sky-200/80 hover:bg-[linear-gradient(135deg,rgba(14,165,233,0.10),rgba(255,255,255,0.96)_68%,rgba(186,230,253,0.55))] hover:text-sky-800",
      stripe: "from-sky-400 to-sky-600"
    }
  },
  {
    to: "/map",
    labelKey: "routes.supplyChainMap",
    icon: Globe2,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-cyan-200 bg-[linear-gradient(135deg,rgba(6,182,212,0.16),rgba(255,255,255,0.98)_58%,rgba(165,243,252,0.76))] text-cyan-800 shadow-[0_14px_28px_rgba(6,182,212,0.12)]",
      icon: "border-cyan-200 bg-cyan-50 text-cyan-600",
      hover: "hover:border-cyan-200/80 hover:bg-[linear-gradient(135deg,rgba(6,182,212,0.10),rgba(255,255,255,0.96)_68%,rgba(165,243,252,0.55))] hover:text-cyan-800",
      stripe: "from-cyan-400 to-cyan-600"
    }
  },
  {
    to: "/war-room",
    labelKey: "routes.warRoom",
    icon: Bot,
    roles: ["admin", "analyst"],
    tone: {
      active: "border-rose-200 bg-[linear-gradient(135deg,rgba(244,63,94,0.16),rgba(255,255,255,0.98)_58%,rgba(254,205,211,0.78))] text-rose-800 shadow-[0_14px_28px_rgba(244,63,94,0.12)]",
      icon: "border-rose-200 bg-rose-50 text-rose-600",
      hover: "hover:border-rose-200/80 hover:bg-[linear-gradient(135deg,rgba(244,63,94,0.10),rgba(255,255,255,0.96)_68%,rgba(254,205,211,0.55))] hover:text-rose-800",
      stripe: "from-rose-400 to-rose-600"
    }
  },
  {
    to: "/simulator",
    labelKey: "routes.whatIfSimulator",
    icon: Sparkles,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-violet-200 bg-[linear-gradient(135deg,rgba(139,92,246,0.16),rgba(255,255,255,0.98)_58%,rgba(221,214,254,0.8))] text-violet-800 shadow-[0_14px_28px_rgba(139,92,246,0.12)]",
      icon: "border-violet-200 bg-violet-50 text-violet-600",
      hover: "hover:border-violet-200/80 hover:bg-[linear-gradient(135deg,rgba(139,92,246,0.10),rgba(255,255,255,0.96)_68%,rgba(221,214,254,0.58))] hover:text-violet-800",
      stripe: "from-violet-400 to-violet-600"
    }
  },
  {
    to: "/orders",
    labelKey: "routes.orders",
    icon: ShoppingCart,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-blue-200 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(255,255,255,0.98)_58%,rgba(191,219,254,0.8))] text-blue-800 shadow-[0_14px_28px_rgba(59,130,246,0.12)]",
      icon: "border-blue-200 bg-blue-50 text-blue-600",
      hover: "hover:border-blue-200/80 hover:bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(255,255,255,0.96)_68%,rgba(191,219,254,0.58))] hover:text-blue-800",
      stripe: "from-blue-400 to-blue-600"
    }
  },
  {
    to: "/suppliers",
    labelKey: "routes.suppliers",
    icon: Factory,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-emerald-200 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(255,255,255,0.98)_58%,rgba(167,243,208,0.82))] text-emerald-800 shadow-[0_14px_28px_rgba(16,185,129,0.12)]",
      icon: "border-emerald-200 bg-emerald-50 text-emerald-600",
      hover: "hover:border-emerald-200/80 hover:bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.96)_68%,rgba(167,243,208,0.58))] hover:text-emerald-800",
      stripe: "from-emerald-400 to-emerald-600"
    }
  },
  {
    to: "/shipments",
    labelKey: "routes.shipments",
    icon: Package,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-amber-200 bg-[linear-gradient(135deg,rgba(245,158,11,0.16),rgba(255,255,255,0.98)_58%,rgba(253,230,138,0.82))] text-amber-800 shadow-[0_14px_28px_rgba(245,158,11,0.12)]",
      icon: "border-amber-200 bg-amber-50 text-amber-600",
      hover: "hover:border-amber-200/80 hover:bg-[linear-gradient(135deg,rgba(245,158,11,0.10),rgba(255,255,255,0.96)_68%,rgba(253,230,138,0.58))] hover:text-amber-800",
      stripe: "from-amber-400 to-amber-600"
    }
  },
  {
    to: "/warehouses",
    labelKey: "routes.warehouses",
    icon: Building2,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-teal-200 bg-[linear-gradient(135deg,rgba(20,184,166,0.16),rgba(255,255,255,0.98)_58%,rgba(153,246,228,0.8))] text-teal-800 shadow-[0_14px_28px_rgba(20,184,166,0.12)]",
      icon: "border-teal-200 bg-teal-50 text-teal-600",
      hover: "hover:border-teal-200/80 hover:bg-[linear-gradient(135deg,rgba(20,184,166,0.10),rgba(255,255,255,0.96)_68%,rgba(153,246,228,0.58))] hover:text-teal-800",
      stripe: "from-teal-400 to-teal-600"
    }
  },
  {
    to: "/chat",
    labelKey: "routes.copilot",
    icon: Bot,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-indigo-200 bg-[linear-gradient(135deg,rgba(99,102,241,0.16),rgba(255,255,255,0.98)_58%,rgba(199,210,254,0.82))] text-indigo-800 shadow-[0_14px_28px_rgba(99,102,241,0.12)]",
      icon: "border-indigo-200 bg-indigo-50 text-indigo-600",
      hover: "hover:border-indigo-200/80 hover:bg-[linear-gradient(135deg,rgba(99,102,241,0.10),rgba(255,255,255,0.96)_68%,rgba(199,210,254,0.58))] hover:text-indigo-800",
      stripe: "from-indigo-400 to-indigo-600"
    }
  },
  {
    to: "/support",
    labelKey: "routes.support",
    icon: Headset,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-orange-200 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(255,255,255,0.98)_58%,rgba(254,215,170,0.82))] text-orange-800 shadow-[0_14px_28px_rgba(249,115,22,0.12)]",
      icon: "border-orange-200 bg-orange-50 text-orange-600",
      hover: "hover:border-orange-200/80 hover:bg-[linear-gradient(135deg,rgba(249,115,22,0.10),rgba(255,255,255,0.96)_68%,rgba(254,215,170,0.58))] hover:text-orange-800",
      stripe: "from-orange-400 to-orange-600"
    }
  },
  {
    to: "/esg",
    labelKey: "routes.esg",
    icon: ShieldCheck,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-green-200 bg-[linear-gradient(135deg,rgba(34,197,94,0.16),rgba(255,255,255,0.98)_58%,rgba(187,247,208,0.82))] text-green-800 shadow-[0_14px_28px_rgba(34,197,94,0.12)]",
      icon: "border-green-200 bg-green-50 text-green-600",
      hover: "hover:border-green-200/80 hover:bg-[linear-gradient(135deg,rgba(34,197,94,0.10),rgba(255,255,255,0.96)_68%,rgba(187,247,208,0.58))] hover:text-green-800",
      stripe: "from-green-400 to-green-600"
    }
  },
  {
    to: "/reports",
    labelKey: "routes.reports",
    icon: FileText,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-fuchsia-200 bg-[linear-gradient(135deg,rgba(217,70,239,0.16),rgba(255,255,255,0.98)_58%,rgba(245,208,254,0.82))] text-fuchsia-800 shadow-[0_14px_28px_rgba(217,70,239,0.12)]",
      icon: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600",
      hover: "hover:border-fuchsia-200/80 hover:bg-[linear-gradient(135deg,rgba(217,70,239,0.10),rgba(255,255,255,0.96)_68%,rgba(245,208,254,0.58))] hover:text-fuchsia-800",
      stripe: "from-fuchsia-400 to-fuchsia-600"
    }
  }
]

export default function Sidebar({ mobileOpen, onClose, pipelineSummary, onRunPipeline, user, onSignOut }) {
  const { t } = useLocalization()
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role || "viewer"))

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-30 bg-slate-900/40 transition md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          "fixed left-0 top-0 z-40 flex h-[100dvh] w-60 flex-col overflow-y-auto overscroll-contain border-r border-slate-200/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f6f8ff_45%,#ffffff_100%)] px-4 py-5 shadow-[14px_0_40px_rgba(148,163,184,0.08)] transition-transform md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <ChainPulseLogo
            className="min-w-0"
            markClassName="h-12 w-12"
            nameClassName="text-base"
            metaClassName="text-xs"
            subtitle={t("sidebar.tagline")}
          />
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? item.tone.active
                    : clsx("border-transparent text-slate-600 hover:-translate-y-[1px]", item.tone.hover)
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={clsx(
                      "absolute inset-y-2 left-1 w-1 rounded-full bg-gradient-to-b transition-opacity duration-200",
                      item.tone.stripe,
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-65"
                    )}
                  />
                  <span
                    className={clsx(
                      "relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200",
                      isActive ? clsx(item.tone.icon, "shadow-sm") : clsx(item.tone.icon, "opacity-80 group-hover:scale-[1.03] group-hover:opacity-100")
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{t(item.labelKey)}</span>
                  {isActive ? <span className="h-2 w-2 rounded-full bg-current opacity-70" /> : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.92))] p-4 shadow-[0_12px_30px_rgba(148,163,184,0.10)]">
          {user ? (
            <div className="mb-4 rounded-lg border bg-white px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t("sidebar.signedInAs")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{user.full_name || user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-primary">{t(`roles.${user.role}`)}</p>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{t("sidebar.pipelineStatus")}</p>
              <p className="mt-1 text-xs text-slate-500">
                {pipelineSummary?.completed_at
                  ? t("sidebar.lastRun", { time: formatRelativeTime(pipelineSummary.completed_at) })
                  : t("sidebar.noCompletedRuns")}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <StatusDot status={pipelineSummary?.recent ? "live" : "idle"} pulse={pipelineSummary?.recent} />
              {pipelineSummary?.recent ? t("sidebar.healthy") : t("sidebar.idle")}
            </div>
          </div>
          {["admin", "analyst"].includes(user?.role) ? (
            <button
              type="button"
              onClick={onRunPipeline}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              <Play className="h-4 w-4" />
              {t("sidebar.runPipeline")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSignOut}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            {t("sidebar.signOut")}
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">v1.0.0</p>
        </div>
      </aside>
    </>
  )
}
