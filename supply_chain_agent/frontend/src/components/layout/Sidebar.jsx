import { NavLink } from "react-router-dom"
import {
  Bot,
  Factory,
  FileText,
  Globe2,
  LayoutDashboard,
  Package,
  Play,
  ShieldCheck,
  X,
  Zap
} from "lucide-react"
import clsx from "clsx"
import StatusDot from "../ui/StatusDot"
import { formatRelativeTime } from "../../utils/formatters"

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "Supply Chain Map", icon: Globe2 },
  { to: "/war-room", label: "War Room", icon: Bot },
  { to: "/suppliers", label: "Suppliers", icon: Factory },
  { to: "/shipments", label: "Shipments", icon: Package },
  { to: "/chat", label: "Copilot", icon: Bot },
  { to: "/esg", label: "ESG", icon: ShieldCheck },
  { to: "/reports", label: "Reports", icon: FileText }
]

export default function Sidebar({ mobileOpen, onClose, pipelineSummary, onRunPipeline }) {
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
          "fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r bg-white px-4 py-5 transition-transform md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">ChainPulse</p>
              <p className="text-xs text-slate-500">Supply chain intelligence</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-md border-l-2 px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "border-primary bg-blue-50 text-primary"
                    : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-xl border bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Pipeline status</p>
              <p className="mt-1 text-xs text-slate-500">
                {pipelineSummary?.completed_at ? `Last run ${formatRelativeTime(pipelineSummary.completed_at)}` : "No completed runs yet"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <StatusDot status={pipelineSummary?.recent ? "live" : "idle"} pulse={pipelineSummary?.recent} />
              {pipelineSummary?.recent ? "Healthy" : "Idle"}
            </div>
          </div>
          <button
            type="button"
            onClick={onRunPipeline}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <Play className="h-4 w-4" />
            Run Pipeline
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">v1.0.0</p>
        </div>
      </aside>
    </>
  )
}
