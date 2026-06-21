import { useEffect, useState } from "react"
import { Bell, Menu } from "lucide-react"
import StatusDot from "../ui/StatusDot"
import { formatDateTime, formatRelativeTime } from "../../utils/formatters"

export default function TopBar({ title, wsConnected, lastUpdatedAt, hasAlerts, onToggleSidebar }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 px-6 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onToggleSidebar} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">Operational clarity across suppliers, shipments, and risks.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-md border bg-slate-50 px-3 py-2 font-medium text-slate-700">
            {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border bg-slate-50 px-3 py-2" title={wsConnected ? "Live websocket connected" : "Websocket disconnected"}>
            <StatusDot status={wsConnected ? "live" : "offline"} pulse={wsConnected} />
            {wsConnected ? "Live" : "Offline"}
          </span>
          <span className="rounded-md border bg-slate-50 px-3 py-2" title={formatDateTime(lastUpdatedAt)}>
            Last updated {formatRelativeTime(lastUpdatedAt)}
          </span>
          <button type="button" className="relative rounded-md border bg-slate-50 p-2.5 text-slate-600 transition hover:bg-slate-100">
            <Bell className="h-4 w-4" />
            {hasAlerts ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" /> : null}
          </button>
        </div>
      </div>
    </header>
  )
}
