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
  X,
  Zap
} from "lucide-react"
import clsx from "clsx"
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
      active: "border-sky-200 bg-sky-50 text-sky-700 shadow-[0_10px_24px_rgba(14,165,233,0.10)]",
      icon: "border-sky-200 bg-sky-50 text-sky-600"
    }
  },
  {
    to: "/map",
    labelKey: "routes.supplyChainMap",
    icon: Globe2,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-cyan-200 bg-cyan-50 text-cyan-700 shadow-[0_10px_24px_rgba(6,182,212,0.10)]",
      icon: "border-cyan-200 bg-cyan-50 text-cyan-600"
    }
  },
  {
    to: "/war-room",
    labelKey: "routes.warRoom",
    icon: Bot,
    roles: ["admin", "analyst"],
    tone: {
      active: "border-rose-200 bg-rose-50 text-rose-700 shadow-[0_10px_24px_rgba(244,63,94,0.10)]",
      icon: "border-rose-200 bg-rose-50 text-rose-600"
    }
  },
  {
    to: "/simulator",
    labelKey: "routes.whatIfSimulator",
    icon: Sparkles,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-violet-200 bg-violet-50 text-violet-700 shadow-[0_10px_24px_rgba(139,92,246,0.10)]",
      icon: "border-violet-200 bg-violet-50 text-violet-600"
    }
  },
  {
    to: "/orders",
    labelKey: "routes.orders",
    icon: ShoppingCart,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-blue-200 bg-blue-50 text-blue-700 shadow-[0_10px_24px_rgba(59,130,246,0.10)]",
      icon: "border-blue-200 bg-blue-50 text-blue-600"
    }
  },
  {
    to: "/suppliers",
    labelKey: "routes.suppliers",
    icon: Factory,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_10px_24px_rgba(16,185,129,0.10)]",
      icon: "border-emerald-200 bg-emerald-50 text-emerald-600"
    }
  },
  {
    to: "/shipments",
    labelKey: "routes.shipments",
    icon: Package,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-amber-200 bg-amber-50 text-amber-700 shadow-[0_10px_24px_rgba(245,158,11,0.10)]",
      icon: "border-amber-200 bg-amber-50 text-amber-600"
    }
  },
  {
    to: "/warehouses",
    labelKey: "routes.warehouses",
    icon: Building2,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-teal-200 bg-teal-50 text-teal-700 shadow-[0_10px_24px_rgba(20,184,166,0.10)]",
      icon: "border-teal-200 bg-teal-50 text-teal-600"
    }
  },
  {
    to: "/chat",
    labelKey: "routes.copilot",
    icon: Bot,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-[0_10px_24px_rgba(99,102,241,0.10)]",
      icon: "border-indigo-200 bg-indigo-50 text-indigo-600"
    }
  },
  {
    to: "/support",
    labelKey: "routes.support",
    icon: Headset,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-orange-200 bg-orange-50 text-orange-700 shadow-[0_10px_24px_rgba(249,115,22,0.10)]",
      icon: "border-orange-200 bg-orange-50 text-orange-600"
    }
  },
  {
    to: "/esg",
    labelKey: "routes.esg",
    icon: ShieldCheck,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-green-200 bg-green-50 text-green-700 shadow-[0_10px_24px_rgba(34,197,94,0.10)]",
      icon: "border-green-200 bg-green-50 text-green-600"
    }
  },
  {
    to: "/reports",
    labelKey: "routes.reports",
    icon: FileText,
    roles: ["admin", "analyst", "viewer"],
    tone: {
      active: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 shadow-[0_10px_24px_rgba(217,70,239,0.10)]",
      icon: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600"
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
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-2.5 text-white shadow-[0_14px_30px_rgba(59,130,246,0.22)]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">ChainPulse</p>
              <p className="text-xs text-slate-500">{t("sidebar.tagline")}</p>
            </div>
          </div>
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
                  "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? item.tone.active
                    : "border-transparent text-slate-600 hover:-translate-y-[1px] hover:border-slate-200 hover:bg-white/90 hover:text-slate-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={clsx(
                      "flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200",
                      isActive ? clsx(item.tone.icon, "shadow-sm") : clsx(item.tone.icon, "opacity-75 group-hover:opacity-100")
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
