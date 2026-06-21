import { useCallback, useEffect, useMemo, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"
import { api } from "../../utils/api"
import { ROUTE_TITLES } from "../../utils/constants"
import { useToast } from "../ui/Toast"
import { useWebSocket } from "../../hooks/useWebSocket"

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
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

  const handleAlert = useCallback((payload) => {
    if (!payload?.title) return
    setAlerts((prev) => [{ ...payload, id: `${payload.title}-${payload.timestamp}` }, ...prev].slice(0, 12))
    setLastUpdatedAt(payload.timestamp || new Date().toISOString())
    showToast(payload.title, payload.type || "info")
    refreshLatestRun()
  }, [refreshLatestRun, showToast])

  const { connected } = useWebSocket("/alerts", handleAlert, true)

  const outletContext = useMemo(
    () => ({
      alerts,
      lastUpdatedAt,
      pipelineSummary,
      refreshLatestRun
    }),
    [alerts, lastUpdatedAt, pipelineSummary, refreshLatestRun]
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
      />
      <div className="min-h-screen md:pl-60">
        <TopBar
          title={ROUTE_TITLES[location.pathname] || "ChainPulse"}
          wsConnected={connected}
          lastUpdatedAt={lastUpdatedAt}
          hasAlerts={alerts.length > 0}
          onToggleSidebar={() => setMobileOpen(true)}
        />
        <main className="page-shell p-6">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  )
}
