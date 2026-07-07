import { useCallback, useMemo, useState } from "react"
import { api } from "../utils/api"
import { formatDateTime } from "../utils/formatters"

const PIPELINE_AGENT_ORDER = [
  "supplier_monitor",
  "disruption_detector",
  "risk_assessor",
  "mitigation",
  "stakeholder_notification"
]

function deriveAgentConfidence(agentName, durationMs, success) {
  if (success === false) return 0
  if (!success) return null

  const orderIndex = Math.max(0, PIPELINE_AGENT_ORDER.indexOf(agentName))
  const durationPenalty = Math.min(18, Math.round(Number(durationMs || 0) / 2200))
  const confidence = 97 - orderIndex * 2 - durationPenalty
  return Math.max(74, Math.min(98, confidence))
}

export function usePipeline() {
  const [runId, setRunId] = useState(null)
  const [status, setStatus] = useState("idle")
  const [progress, setProgress] = useState(0)
  const [agentTimes, setAgentTimes] = useState({})
  const [agentStates, setAgentStates] = useState({})
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)
  const [durationMs, setDurationMs] = useState(null)
  const [currentAgent, setCurrentAgent] = useState(null)
  const [startedAt, setStartedAt] = useState(null)
  const [completedAt, setCompletedAt] = useState(null)
  const [sequentialDurationMs, setSequentialDurationMs] = useState(null)
  const [potentialParallelGainMs, setPotentialParallelGainMs] = useState(null)

  const appendLog = useCallback((entry) => {
    setLogs((prev) => [entry, ...prev].slice(0, 50))
  }, [])

  const hydrateRun = useCallback((run) => {
    if (!run?.run_id) return

    const normalizedStatus =
      run.status === "queued" || run.status === "pending"
        ? "starting"
        : run.status === "running"
          ? "running"
          : run.status === "completed"
            ? "completed"
            : run.status === "failed"
              ? "failed"
              : "idle"

    const entries = Object.entries(run.results || {})
    const nextAgentTimes = {}
    const nextAgentStates = {}

    entries.forEach(([agentName, result]) => {
      const durationMs = Number(result?.duration_ms || 0)
      const success = result?.success ?? false
      nextAgentTimes[agentName] = durationMs
      nextAgentStates[agentName] = {
        status: success ? "completed" : "failed",
        durationMs,
        confidence: deriveAgentConfidence(agentName, durationMs, success)
      }
    })

    const computedDuration =
      run.started_at && run.completed_at
        ? new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()
        : null
    const computedSequentialDuration = entries.reduce(
      (sum, [, result]) => sum + Number(result?.duration_ms || 0),
      0
    )
    const computedParallelGain =
      computedDuration === null
        ? null
        : Math.max(0, Number((computedSequentialDuration - computedDuration).toFixed(2)))

    const nextLogs = entries.length
      ? entries
          .map(([agentName, result]) => ({
            id: `${run.run_id}-${agentName}-${result?.success ? "complete" : "error"}`,
            type: result?.success ? "success" : "error",
            message: result?.success
              ? `${agentName} completed in ${Number(result?.duration_ms || 0).toFixed(0)}ms.`
              : `${agentName} failed${result?.error ? `: ${result.error}` : "."}`,
            timestamp: run.completed_at || run.started_at || new Date().toISOString()
          }))
          .reverse()
      : []

    setRunId(run.run_id)
    setStatus(normalizedStatus)
    setProgress(normalizedStatus === "completed" ? 100 : normalizedStatus === "running" ? 15 : 0)
    setAgentTimes(nextAgentTimes)
    setAgentStates(nextAgentStates)
    setLogs(nextLogs)
    setError(run.errors?.[0] || null)
    setCurrentAgent(null)
    setDurationMs(computedDuration)
    setStartedAt(run.started_at || null)
    setCompletedAt(run.completed_at || null)
    setSequentialDurationMs(run.sequential_duration_ms ?? computedSequentialDuration)
    setPotentialParallelGainMs(run.potential_parallel_gain_ms ?? computedParallelGain)
  }, [])

  const trigger = useCallback(async () => {
    try {
      setStatus("starting")
      setProgress(0)
      setError(null)
      setAgentTimes({})
      setAgentStates({})
      setLogs([])
      setDurationMs(null)
      setStartedAt(null)
      setCompletedAt(null)
      setSequentialDurationMs(null)
      setPotentialParallelGainMs(null)
      const result = await api.runPipeline()
      setRunId(result.run_id)
      setStatus("running")
      appendLog({
        id: `${result.run_id}-queued`,
        type: "info",
        message: "Pipeline queued for execution.",
        timestamp: new Date().toISOString()
      })
      return result.run_id
    } catch (err) {
      setError(err.message)
      setStatus("failed")
      return null
    }
  }, [appendLog])

  const hydrateLatest = useCallback(async () => {
    try {
      const latest = await api.getLatestRun()
      hydrateRun(latest)
      return latest
    } catch (err) {
      return null
    }
  }, [hydrateRun])

  const hydrateRunId = useCallback(async (pipelineRunId) => {
    if (!pipelineRunId) return null

    try {
      const run = await api.getPipelineStatus(pipelineRunId)
      hydrateRun(run)
      return run
    } catch (err) {
      return null
    }
  }, [hydrateRun])

  const updateFromEvent = useCallback((event) => {
    if (!event?.event) return
    if (event.run_id) setRunId(event.run_id)

    switch (event.event) {
      case "pipeline_start":
        setStatus("running")
        setProgress(0)
        setStartedAt(event.timestamp || new Date().toISOString())
        setCompletedAt(null)
        appendLog({
          id: `${event.run_id}-start`,
          type: "info",
          message: "Pipeline execution started.",
          timestamp: event.timestamp
        })
        break
      case "agent_start":
        setCurrentAgent(event.agent)
        setAgentStates((prev) => ({ ...prev, [event.agent]: { status: "running" } }))
        appendLog({
          id: `${event.run_id}-${event.agent}-start`,
          type: "info",
          message: `${event.agent} started.`,
          timestamp: event.timestamp
        })
        break
      case "agent_complete":
        setProgress(event.progress || 0)
        setCurrentAgent(event.agent)
        setAgentTimes((prev) => ({ ...prev, [event.agent]: event.duration_ms }))
        setAgentStates((prev) => ({
          ...prev,
          [event.agent]: {
            status: "completed",
            durationMs: event.duration_ms,
            confidence: deriveAgentConfidence(event.agent, event.duration_ms, true)
          }
        }))
        appendLog({
          id: `${event.run_id}-${event.agent}-complete`,
          type: "success",
          message: `${event.agent} completed in ${event.duration_ms.toFixed(0)}ms.`,
          timestamp: event.timestamp
        })
        break
      case "agent_error":
        setAgentStates((prev) => ({
          ...prev,
          [event.agent]: {
            status: "failed",
            durationMs: event.duration_ms,
            confidence: deriveAgentConfidence(event.agent, event.duration_ms, false)
          }
        }))
        setError(event.error)
        appendLog({
          id: `${event.run_id}-${event.agent}-error`,
          type: "error",
          message: `${event.agent} failed: ${event.error}`,
          timestamp: event.timestamp
        })
        break
      case "pipeline_complete":
        setStatus("completed")
        setProgress(100)
        setCurrentAgent(null)
        setDurationMs(event.actual_duration_ms ?? null)
        setAgentTimes(event.agent_times || {})
        setStartedAt((current) => event.started_at || current)
        setCompletedAt(event.completed_at || event.timestamp || null)
        setSequentialDurationMs(event.sequential_duration_ms ?? null)
        setPotentialParallelGainMs(event.potential_parallel_gain_ms ?? null)
        appendLog({
          id: `${event.run_id}-complete`,
          type: "success",
          message: `Pipeline completed at ${formatDateTime(event.timestamp)}.`,
          timestamp: event.timestamp
        })
        break
      case "pipeline_error":
        setStatus("failed")
        setCurrentAgent(null)
        setError(event.error)
        setCompletedAt(event.timestamp || null)
        appendLog({
          id: `${event.run_id}-pipeline-error`,
          type: "error",
          message: event.error,
          timestamp: event.timestamp
        })
        break
      default:
        break
    }
  }, [appendLog])

  const performanceData = useMemo(
    () =>
      Object.entries(agentTimes).map(([agent, duration]) => ({
        agent,
        duration
      })),
    [agentTimes]
  )

  return {
    runId,
    status,
    progress,
    agentTimes,
    agentStates,
    logs,
    error,
    currentAgent,
    durationMs,
    startedAt,
    completedAt,
    sequentialDurationMs,
    potentialParallelGainMs,
    performanceData,
    trigger,
    updateFromEvent,
    hydrateLatest,
    hydrateRunId
  }
}
