import { Newspaper, RefreshCw, TriangleAlert, CloudRain } from "lucide-react"
import { useEffect, useState } from "react"
import Badge from "../ui/Badge"
import EmptyState from "../ui/EmptyState"
import Spinner from "../ui/Spinner"
import { api } from "../../utils/api"
import { formatRelativeTime } from "../../utils/formatters"

const iconMap = {
  news: Newspaper,
  weather: CloudRain
}

export default function NewsFeed() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [feed, setFeed] = useState([])
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, sources: {} })

  const fetchFeed = async () => {
    try {
      setError("")
      const data = await api.getIntelligenceFeed()
      setFeed(data.feed || [])
      setStats({
        total: data.total || 0,
        critical: data.critical || 0,
        high: data.high || 0,
        sources: data.sources || {}
      })
    } catch (err) {
      setError(err.message || "Unable to load intelligence feed.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
    const timer = window.setInterval(fetchFeed, 5 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span className="text-sm text-slate-500">Loading intelligence feed...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-0 rounded-lg border bg-white shadow-card pointer-events-auto">
      <div className="relative z-10 flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <div>
            <h3 className="font-semibold text-slate-900">Live Intelligence Feed</h3>
            <p className="text-xs text-slate-500">NewsAPI + OpenWeatherMap supply chain signals</p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchFeed}
          className="relative z-10 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="relative z-10 flex flex-wrap gap-2 border-b bg-slate-50 px-5 py-3 text-xs text-slate-500 pointer-events-auto">
        {stats.critical > 0 ? <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-700">{stats.critical} critical</span> : null}
        <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-700">{stats.total} alerts</span>
        <span className="rounded-full bg-slate-200 px-2 py-1 font-medium text-slate-700">{stats.sources.news || 0} news</span>
        <span className="rounded-full bg-cyan-100 px-2 py-1 font-medium text-cyan-700">{stats.sources.weather || 0} weather</span>
      </div>

      {error ? (
        <div className="px-5 py-4 text-sm text-red-700">{error}</div>
      ) : feed.length ? (
        <div className="relative z-0 max-h-96 divide-y overflow-y-auto pr-1 scrollbar-thin pointer-events-auto">
          {feed.map((item) => {
            const Icon = iconMap[item.icon] || TriangleAlert
            return (
              <div key={item.id} className="relative z-10 border-l-4 border-l-slate-200 px-5 py-4 pointer-events-auto">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-500" />
                      <Badge
                        label={item.severity?.toUpperCase() || "INFO"}
                        variant={item.severity || "info"}
                        className="relative z-10"
                      />
                      <span className="text-xs text-slate-400">{item.source}</span>
                      {item.confidence ? <span className="text-xs text-slate-400">{Math.round(item.confidence * 100)}% confidence</span> : null}
                    </div>
                    <p className="mt-2 font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>{formatRelativeTime(item.timestamp)}</span>
                      {item.affected_suppliers ? <span>{item.affected_suppliers} supplier{item.affected_suppliers > 1 ? "s" : ""} affected</span> : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.weather_icon_url ? <img src={item.weather_icon_url} alt="" className="h-8 w-8" /> : null}
                    {item.source_url ? (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative z-10 cursor-pointer text-xs font-medium text-primary hover:text-primary-dark"
                      >
                        Read
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-5">
          <EmptyState
            icon={Newspaper}
            title="No disruptions detected"
            description="Live supply chain news and weather alerts will appear here automatically."
          />
        </div>
      )}
    </div>
  )
}
