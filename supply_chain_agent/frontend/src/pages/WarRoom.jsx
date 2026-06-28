import { useEffect, useMemo, useRef } from "react"
import { useLocation, useOutletContext } from "react-router-dom"
import {
  AlertTriangle,
  ArrowDown,
  Banknote,
  Bot,
  Factory,
  FileText,
  Leaf,
  Network,
  ScanSearch,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import clsx from "clsx"
import { usePipeline } from "../hooks/usePipeline"
import { useWebSocket } from "../hooks/useWebSocket"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import Spinner from "../components/ui/Spinner"
import { AGENT_TIERS } from "../utils/constants"

const iconMap = {
  factory: Factory,
  zap: Zap,
  scan: ScanSearch,
  shield: ShieldCheck,
  sparkles: Sparkles,
  banknote: Banknote,
  leaf: Leaf,
  network: Network,
  "line-chart": TrendingUp,
  "file-text": FileText,
  send: Send
}

const backendAgents = new Set([
  "supplier_monitor",
  "disruption_detector",
  "risk_assessor",
  "mitigation",
  "stakeholder_notification"
])

function AgentNode({ agent, state }) {
  const Icon = iconMap[agent.icon] || Bot
  const status = state?.status || (backendAgents.has(agent.id) ? "idle" : "idle")
  return (
    <div
      className={clsx(
        "rounded-xl border bg-white p-4 shadow-card transition",
        status === "running" && "border-primary text-primary shadow-md animate-pulseRing",
        status === "completed" && "border-emerald-200 text-emerald-700",
        status === "failed" && "border-red-200 text-red-700",
        status === "idle" && "text-slate-500"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={clsx("rounded-lg p-3", status === "completed" ? "bg-emerald-50" : status === "failed" ? "bg-red-50" : status === "running" ? "bg-blue-50" : "bg-slate-100")}>
          <Icon className="h-5 w-5" />
        </div>
        <Badge
          label={status === "completed" ? "Complete" : status === "failed" ? "Failed" : status === "running" ? "Running" : backendAgents.has(agent.id) ? "Idle" : "Standby"}
          variant={status === "completed" ? "success" : status === "failed" ? "critical" : status === "running" ? "low" : "info"}
        />
      </div>
      <h3 className="mt-4 font-semibold">{agent.label}</h3>
      {state?.durationMs ? <p className="mt-2 text-sm">{(state.durationMs / 1000).toFixed(1)}s</p> : <p className="mt-2 text-sm">Awaiting execution</p>}
      {state?.confidence ? <p className="mt-1 text-xs text-slate-500">Confidence {state.confidence}%</p> : null}
    </div>
  )
}

export default function WarRoom() {
  const location = useLocation()
  const { refreshLatestRun } = useOutletContext()
  const triggeredRef = useRef(null)
  const pipeline = usePipeline()

  useWebSocket(
    pipeline.runId ? `/pipeline/${pipeline.runId}` : null,
    (payload) => {
      if (payload.event !== "ping" && payload.event !== "pong") {
        pipeline.updateFromEvent(payload)
        if (payload.event === "pipeline_complete" && (!payload.agent_times || !Object.keys(payload.agent_times).length) && payload.run_id) {
          pipeline.hydrateRunId(payload.run_id)
        }
        if (payload.event === "pipeline_complete") {
          refreshLatestRun?.()
        }
      }
    },
    Boolean(pipeline.runId)
  )

  useEffect(() => {
    const triggerKey = location.state?.triggerPipeline
    if (!triggerKey || triggeredRef.current === triggerKey) return
    triggeredRef.current = triggerKey
    pipeline.trigger()
  }, [location.state, pipeline])

  useEffect(() => {
    if (pipeline.runId) return
    pipeline.hydrateLatest()
  }, [pipeline.hydrateLatest, pipeline.runId])

  const chartData = useMemo(
    () =>
      pipeline.performanceData.map((entry) => ({
        ...entry,
        fill: entry.duration < 10000 ? "#10b981" : entry.duration < 30000 ? "#f59e0b" : "#ef4444"
      })),
    [pipeline.performanceData]
  )

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => pipeline.trigger()}
                className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Run Pipeline
              </button>
              <Badge label={pipeline.status === "idle" ? "Idle" : pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)} variant={pipeline.status === "completed" ? "success" : pipeline.status === "failed" ? "critical" : pipeline.status === "running" || pipeline.status === "starting" ? "low" : "info"} />
              {pipeline.currentAgent ? <p className="text-sm text-slate-500">Current agent: {pipeline.currentAgent}</p> : null}
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${pipeline.progress}%` }} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total duration</p>
            <p className="text-2xl font-semibold text-slate-900">
              {pipeline.durationMs ? `${(pipeline.durationMs / 1000).toFixed(2)}s` : pipeline.status === "running" ? "Running..." : "--"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-card">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Agent Tier Visualizer</h2>
          <p className="text-sm text-slate-500">Execution flow across monitoring, risk, mitigation, and reporting layers.</p>
        </div>
        <div className="space-y-5">
          {AGENT_TIERS.map((tier, index) => (
            <div key={index}>
              <div className={clsx("grid gap-4", tier.length === 4 ? "md:grid-cols-4" : tier.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
                {tier.map((agent) => (
                  <AgentNode key={agent.id} agent={agent} state={pipeline.agentStates[agent.id]} />
                ))}
              </div>
              {index < AGENT_TIERS.length - 1 ? (
                <div className="flex justify-center py-2 text-slate-300">
                  <ArrowDown className="h-5 w-5" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-lg border bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Execution Log</h2>
              <p className="text-sm text-slate-500">Newest entries appear first, capped at 50 events.</p>
            </div>
          </div>
          {!pipeline.logs.length ? (
            <EmptyState
              icon={Bot}
              title="Pipeline log is empty"
              description="Start a run to watch every agent report progress in real time."
            />
          ) : (
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
              {pipeline.logs.map((entry) => (
                <div key={entry.id} className="rounded-lg border bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Badge label={entry.type} variant={entry.type === "error" ? "critical" : entry.type === "success" ? "success" : "info"} />
                    <span className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{entry.message}</p>
                </div>
              ))}
            </div>
          )}
          {pipeline.error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {pipeline.error}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-card">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Agent Performance</h2>
            <p className="text-sm text-slate-500">Bars turn green under 10s, amber under 30s, red beyond that.</p>
          </div>
          {!chartData.length ? (
            <div className="flex min-h-[320px] items-center justify-center">
              {pipeline.status === "running" ? <Spinner size="lg" /> : <EmptyState icon={TrendingUp} title="No timing data yet" description="Completed agents will appear here as the run progresses." />}
            </div>
          ) : (
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis type="category" dataKey="agent" width={130} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(0)} ms`} />
                  <Bar dataKey="duration" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.agent} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
