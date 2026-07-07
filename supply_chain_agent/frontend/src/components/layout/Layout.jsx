import { useCallback, useEffect, useMemo, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"
import { useLocalization } from "../../context/LocalizationContext"
import { api } from "../../utils/api"
import { ROUTE_TITLES } from "../../utils/constants"
import { useToast } from "../ui/Toast"
import { useWebSocket } from "../../hooks/useWebSocket"
import { useAuth } from "../../hooks/useAuth"
import { ROUTE_TRANSLATION_KEYS } from "../../utils/localization"

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLocalization()
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [pipelineSummary, setPipelineSummary] = useState(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date().toISOString())

  const refreshLatestRun = useCallback(async () => {
    try {
      const latest = await api.getLatestRun()
      const completedAt = latest?.completed_at || latest?.started_at
      const recent = completedAt ? Date.now() - new Date(completedAt).getTime() < 30 * 60 * 1000 : false
      setPipelineSummary(latest ? { ...latest, recent } : null)
    } catch {
      setPipelineSummary(null)
    }
  }, [])

  useEffect(() => {
    refreshLatestRun()
  }, [refreshLatestRun, location.pathname])

  const getToastType = useCallback((payload) => {
    if (payload?.type && ["success", "error", "warning", "info"].includes(payload.type)) {
      return payload.type
    }
    if (payload?.severity === "critical") return "error"
    if (payload?.severity === "high") return "warning"
    return "info"
  }, [])

  const handleAlert = useCallback((payload) => {
    if (!payload?.title) return
    setAlerts((prev) => [{ ...payload, id: `${payload.title}-${payload.timestamp}` }, ...prev].slice(0, 12))
    setLastUpdatedAt(payload.timestamp || new Date().toISOString())
    showToast({ title: payload.title, message: payload.message || payload.description || "" }, getToastType(payload))
    refreshLatestRun()
  }, [getToastType, refreshLatestRun, showToast])

  const { connected } = useWebSocket("/alerts", handleAlert, true)

  const handleSignOut = useCallback(async () => {
    const confirmed = window.confirm("Are you sure you want to log out?")
    if (!confirmed) return

    setMobileOpen(false)
    await signOut()
    showToast("Signed out successfully.", "success")
    navigate("/login", { replace: true })
  }, [navigate, showToast, signOut])

  const outletContext = useMemo(
    () => ({
      alerts,
      lastUpdatedAt,
      pipelineSummary,
      refreshLatestRun,
      user
    }),
    [alerts, lastUpdatedAt, pipelineSummary, refreshLatestRun, user]
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pipelineSummary={pipelineSummary}
        onRunPipeline={() => {
          setMobileOpen(false)
          navigate("/war-room", { state: { triggerPipeline: Date.now() } })
        }}
        user={user}
        onSignOut={handleSignOut}
      />
      <div className="min-h-screen md:pl-60">
        <TopBar
          title={ROUTE_TRANSLATION_KEYS[location.pathname] ? t(ROUTE_TRANSLATION_KEYS[location.pathname]) : ROUTE_TITLES[location.pathname] || t("appName")}
          wsConnected={connected}
          lastUpdatedAt={lastUpdatedAt}
          hasAlerts={alerts.length > 0}
          onToggleSidebar={() => setMobileOpen(true)}
          onReportIssue={() => navigate("/support")}
          onSignOut={handleSignOut}
          user={user}
        />
        <main className="page-shell p-6">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  )
}
