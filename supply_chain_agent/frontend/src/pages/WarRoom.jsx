import { useEffect, useMemo, useRef } from "react"
import { useLocation, useOutletContext } from "react-router-dom"
import {
  AlertTriangle,
  ArrowDown,
  Bot,
  CheckCircle2,
  Clock3,
  Factory,
  LoaderCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react"
import { TrendingUp } from "lucide-react"
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
  shield: ShieldCheck,
  sparkles: Sparkles,
  send: Send
}

const backendAgents = new Set([
  "supplier_monitor",
  "disruption_detector",
  "risk_assessor",
  "mitigation",
  "stakeholder_notification"
])

function formatAgentName(value) {
  if (!value) return ""
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

function tierGridClass(length) {
  if (length >= 4) return "sm:grid-cols-2 2xl:grid-cols-4"
  if (length === 3) return "sm:grid-cols-2 xl:grid-cols-3"
  if (length === 2) return "lg:grid-cols-2"
  return ""
}

function formatDuration(ms) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "--"
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${Math.round(ms)}ms`
}

function getConfidenceStyles(confidence) {
  if (typeof confidence !== "number") {
    return {
      pill: "border-slate-200 bg-slate-50 text-slate-500",
      bar: "bg-slate-300",
      label: "Confidence pending"
    }
  }
  if (confidence >= 90) {
    return {
      pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
      bar: "bg-emerald-500",
      label: `${confidence}% confidence`
    }
  }
  if (confidence >= 80) {
    return {
      pill: "border-amber-200 bg-amber-50 text-amber-700",
      bar: "bg-amber-500",
      label: `${confidence}% confidence`
    }
  }
  return {
    pill: "border-rose-200 bg-rose-50 text-rose-700",
    bar: "bg-rose-500",
    label: `${confidence}% confidence`
  }
}

function buildTimelineRows(agentTimes, agentStates) {
  const tierStarts = []
  let elapsed = 0

  AGENT_TIERS.forEach((tier, tierIndex) => {
    tierStarts[tierIndex] = elapsed
    const tierDuration = Math.max(...tier.map((agent) => Number(agentTimes[agent.id] || agentStates[agent.id]?.durationMs || 0)), 0)
    elapsed += tierDuration
  })

  const rows = AGENT_TIERS.flatMap((tier, tierIndex) =>
    tier.map((agent) => {
      const durationMs = Number(agentTimes[agent.id] || agentStates[agent.id]?.durationMs || 0)
      const startMs = tierStarts[tierIndex]
      return {
        ...agent,
        tier: tierIndex + 1,
        startMs,
        durationMs,
        endMs: startMs + durationMs,
        state: agentStates[agent.id] || { status: "idle" }
      }
    })
  )

  const sequentialDurationMs = rows.reduce((sum, row) => sum + row.durationMs, 0)
  const derivedActualDurationMs = rows.length ? Math.max(...rows.map((row) => row.endMs), 0) : 0

  return {
    rows,
    derivedActualDurationMs,
    sequentialDurationMs
  }
}

function AgentNode({ agent, state }) {
  const Icon = iconMap[agent.icon] || Bot
  const status = state?.status || (backendAgents.has(agent.id) ? "idle" : "idle")
  const confidenceStyles = getConfidenceStyles(state?.confidence)
  const statusMeta = {
    idle: {
      card: "border-slate-200 bg-white text-slate-600",
      iconWrap: "bg-slate-100 text-slate-500",
      accent: "bg-slate-300",
      badgeLabel: backendAgents.has(agent.id) ? "Pending" : "Standby",
      badgeVariant: "info",
      helper: "Awaiting execution",
      statusIcon: Clock3,
      statusIconClass: "text-slate-400"
    },
    running: {
      card: "border-blue-200 bg-gradient-to-br from-blue-50/80 to-white text-slate-700 ring-1 ring-blue-100",
      iconWrap: "bg-blue-100 text-blue-700",
      accent: "bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500",
      badgeLabel: "Running",
      badgeVariant: "low",
      helper: "Currently processing",
      statusIcon: LoaderCircle,
      statusIconClass: "animate-spin text-blue-600"
    },
    completed: {
      card: "border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white text-emerald-700",
      iconWrap: "bg-emerald-100 text-emerald-700",
      accent: "bg-emerald-500",
      badgeLabel: "Complete",
      badgeVariant: "success",
      helper: "Execution finished",
      statusIcon: CheckCircle2,
      statusIconClass: "text-emerald-600"
    },
    failed: {
      card: "border-red-200 bg-gradient-to-br from-red-50/80 to-white text-red-700",
      iconWrap: "bg-red-100 text-red-700",
      accent: "bg-red-500",
      badgeLabel: "Failed",
      badgeVariant: "critical",
      helper: "Needs attention",
      statusIcon: AlertTriangle,
      statusIconClass: "text-red-600"
    }
  }[status] || {
    card: "border-slate-200 bg-white text-slate-600",
    iconWrap: "bg-slate-100 text-slate-500",
    accent: "bg-slate-300",
    badgeLabel: "Pending",
    badgeVariant: "info",
    helper: "Awaiting execution",
    statusIcon: Clock3,
    statusIconClass: "text-slate-400"
  }
  const StatusIcon = statusMeta.statusIcon
  const progressWidth = status === "completed" ? "100%" : status === "failed" ? "100%" : status === "running" ? "68%" : "18%"
  const durationLabel = state?.durationMs ? `${(state.durationMs / 1000).toFixed(1)}s` : "Awaiting execution"

  return (
    <div
      className={clsx(
        "group flex h-full min-h-[210px] flex-col rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        statusMeta.card
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={clsx("flex h-12 w-12 items-center justify-center rounded-2xl", statusMeta.iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon className={clsx("h-4 w-4 shrink-0", statusMeta.statusIconClass)} />
          <Badge label={statusMeta.badgeLabel} variant={statusMeta.badgeVariant} />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <h3 className="font-semibold text-slate-900">{agent.label}</h3>
          <p className="mt-1 text-sm text-slate-500">{statusMeta.helper}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
            {durationLabel}
          </span>
          {typeof state?.confidence === "number" ? (
            <span className={clsx("rounded-full border px-2.5 py-1 font-medium", confidenceStyles.pill)}>
              {confidenceStyles.label}
            </span>
          ) : null}
        </div>
        {typeof state?.confidence === "number" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              <span>Execution confidence</span>
              <span>{state.confidence}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={clsx("h-full rounded-full transition-all duration-500", confidenceStyles.bar)} style={{ width: `${state.confidence}%` }} />
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          <span>{status === "running" ? "Live execution" : status === "completed" ? "Finished" : status === "failed" ? "Error state" : "Queued"}</span>
          <span>{status === "running" ? "In progress" : status === "completed" ? "100%" : status === "failed" ? "Blocked" : "Ready"}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500",
              statusMeta.accent,
              status === "running" && "animate-pulse"
            )}
            style={{ width: progressWidth }}
          />
        </div>
      </div>
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
  const timeline = useMemo(
    () => buildTimelineRows(pipeline.agentTimes, pipeline.agentStates),
    [pipeline.agentStates, pipeline.agentTimes]
  )
  const timelineTotalMs = Math.max(pipeline.durationMs || 0, timeline.derivedActualDurationMs || 0, 1)
  const sequentialDurationMs = pipeline.sequentialDurationMs || timeline.sequentialDurationMs
  const parallelGainMs = pipeline.potentialParallelGainMs ?? Math.max(0, sequentialDurationMs - timelineTotalMs)
  const longestAgent = useMemo(
    () => [...timeline.rows].sort((left, right) => right.durationMs - left.durationMs)[0] || null,
    [timeline.rows]
  )

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => pipeline.trigger()}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark hover:shadow-md"
              >
                Run Pipeline
              </button>
              <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Badge
                  label={pipeline.status === "idle" ? "Idle" : pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
                  variant={pipeline.status === "completed" ? "success" : pipeline.status === "failed" ? "critical" : pipeline.status === "running" || pipeline.status === "starting" ? "low" : "info"}
                />
                <span className="text-sm text-slate-500">
                  {pipeline.currentAgent ? `Current agent: ${formatAgentName(pipeline.currentAgent)}` : "Pipeline ready to run"}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Execution progress</p>
                  <p className="mt-1 text-sm text-slate-500">Track the live backend run as each pipeline agent advances to completion.</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-900">{Math.round(pipeline.progress)}%</span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pipeline.progress}%` }} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 xl:min-w-[13rem]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total duration</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {pipeline.durationMs ? `${(pipeline.durationMs / 1000).toFixed(2)}s` : pipeline.status === "running" ? "Running..." : "--"}
            </p>
            <p className="mt-1 text-sm text-slate-500">Updated from the active pipeline stream.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 border-b border-slate-200 pb-5">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Execution map
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-900 sm:text-xl">Agent Tier Visualizer</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Live execution flow for the five backend pipeline agents running in today&apos;s demo.
          </p>
        </div>
        <div className="space-y-6">
          {AGENT_TIERS.map((tier, index) => (
            <div key={index} className="space-y-4">
              <div className={clsx("grid gap-4", tierGridClass(tier.length))}>
                {tier.map((agent) => (
                  <AgentNode key={agent.id} agent={agent} state={pipeline.agentStates[agent.id]} />
                ))}
              </div>
              {index < AGENT_TIERS.length - 1 ? (
                <div className="flex justify-center py-1 text-slate-300">
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

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Execution timeline
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900 sm:text-xl">Gantt-style agent timing</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Each bar shows when an agent ran in the pipeline, including parallel work across tiers 1 and 2.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Actual wall clock</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatDuration(timelineTotalMs)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sequential total</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatDuration(sequentialDurationMs)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Parallel time saved</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatDuration(parallelGainMs)}</p>
            </div>
          </div>
        </div>

        {!timeline.rows.some((row) => row.durationMs > 0 || row.state.status === "running" || row.state.status === "completed" || row.state.status === "failed") ? (
          <div className="mt-6">
            <EmptyState
              icon={Clock3}
              title="No execution timeline yet"
              description="Run the pipeline to populate a timing view for each agent and show how parallel tiers compress the overall wall-clock duration."
            />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {longestAgent ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium">
                  Longest agent: {longestAgent.label} ({formatDuration(longestAgent.durationMs)})
                </span>
              ) : null}
              {pipeline.completedAt ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium">
                  Completed at {new Date(pipeline.completedAt).toLocaleTimeString()}
                </span>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Agent</div>
                <div className="grid grid-cols-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const tickMs = (timelineTotalMs / 4) * index
                    return (
                      <span key={index} className={clsx(index === 4 ? "text-right" : "text-left")}>
                        {formatDuration(tickMs)}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {timeline.rows.map((row) => {
                  const left = `${(row.startMs / timelineTotalMs) * 100}%`
                  const rawWidth = row.durationMs > 0 ? (row.durationMs / timelineTotalMs) * 100 : row.state.status === "running" ? 12 : 0
                  const clampedWidth = Math.max(0, Math.min(100 - (row.startMs / timelineTotalMs) * 100, row.durationMs > 0 ? Math.max(8, rawWidth) : rawWidth))
                  const width = `${clampedWidth}%`
                  const confidenceStyles = getConfidenceStyles(row.state.confidence)
                  const barTone =
                    row.state.status === "failed"
                      ? "from-rose-500 to-red-500"
                      : row.state.status === "completed"
                        ? "from-sky-500 via-blue-500 to-indigo-500"
                        : row.state.status === "running"
                          ? "from-cyan-400 via-sky-500 to-blue-500"
                          : "from-slate-200 to-slate-300"

                  return (
                    <div key={row.id} className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 px-4 py-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{row.label}</p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            Tier {row.tier}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{formatDuration(row.durationMs)}</span>
                          {typeof row.state.confidence === "number" ? (
                            <span className={clsx("rounded-full border px-2 py-0.5 font-medium", confidenceStyles.pill)}>
                              {row.state.confidence}% confidence
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="relative min-h-[56px] overflow-hidden rounded-2xl bg-slate-50">
                        <div className="absolute inset-0 grid grid-cols-5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className={clsx("border-slate-200", index < 4 && "border-r")} />
                          ))}
                        </div>
                        {row.durationMs > 0 || row.state.status === "running" ? (
                          <div
                            className={clsx(
                              "absolute top-1/2 flex h-9 -translate-y-1/2 items-center rounded-xl bg-gradient-to-r px-3 text-xs font-semibold text-white shadow-sm transition-all duration-500",
                              barTone,
                              row.state.status === "running" && "animate-pulse"
                            )}
                            style={{ left, width }}
                          >
                            <span className="truncate">
                              {formatDuration(row.startMs)} {"->"} {formatDuration(row.startMs + row.durationMs)}
                            </span>
                          </div>
                        ) : (
                          <div className="absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">Pending</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
