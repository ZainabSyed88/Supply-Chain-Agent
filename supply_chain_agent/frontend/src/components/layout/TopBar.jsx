import { useEffect, useState } from "react"
import { Bell, Languages, LogOut, Menu, PlusCircle } from "lucide-react"
import { useLocalization } from "../../context/LocalizationContext"
import StatusDot from "../ui/StatusDot"
import { formatDateTime, formatRelativeTime, formatTime } from "../../utils/formatters"

export default function TopBar({ title, wsConnected, lastUpdatedAt, hasAlerts, onToggleSidebar, onReportIssue, onSignOut, user }) {
  const [now, setNow] = useState(new Date())
  const { language, languages, setLanguage, t } = useLocalization()

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
            <p className="text-sm text-slate-500">{t("topbar.subtitle")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <label className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-slate-700 shadow-sm">
            <Languages className="h-4 w-4 text-slate-500" />
            <span className="sr-only">{t("topbar.language")}</span>
            <select
              value={language.locale}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label={t("topbar.language")}
              className="max-w-[12rem] bg-transparent text-sm font-medium outline-none"
            >
              {languages.map((option) => (
                <option key={option.locale} value={option.locale}>
                  {option.nativeLabel}
                </option>
              ))}
            </select>
          </label>
          {user ? (
            <div className="rounded-md border bg-slate-50 px-3 py-2 text-slate-700">
              <p className="font-medium">{user.full_name || user.name}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">{t(`roles.${user.role}`)}</p>
            </div>
          ) : null}
          {user ? (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow"
            >
              <LogOut className="h-4 w-4" />
              {t("topbar.logout")}
            </button>
          ) : null}
          <span className="rounded-md border bg-slate-50 px-3 py-2 font-medium text-slate-700">
            {formatTime(now)}
          </span>
          <span
            className="inline-flex items-center gap-2 rounded-md border bg-slate-50 px-3 py-2"
            title={wsConnected ? t("topbar.liveConnected") : t("topbar.disconnected")}
          >
            <StatusDot status={wsConnected ? "live" : "offline"} pulse={wsConnected} />
            {wsConnected ? t("topbar.live") : t("topbar.offline")}
          </span>
          <span className="rounded-md border bg-slate-50 px-3 py-2" title={formatDateTime(lastUpdatedAt)}>
            {t("topbar.lastUpdated", { time: formatRelativeTime(lastUpdatedAt) })}
          </span>
          <button
            type="button"
            onClick={onReportIssue}
            className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-slate-700 transition hover:bg-slate-50"
          >
            <PlusCircle className="h-4 w-4" />
            {t("topbar.reportIssue")}
          </button>
          <button type="button" className="relative rounded-md border bg-slate-50 p-2.5 text-slate-600 transition hover:bg-slate-100">
            <Bell className="h-4 w-4" />
            {hasAlerts ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" /> : null}
          </button>
        </div>
      </div>
    </header>
  )
}
