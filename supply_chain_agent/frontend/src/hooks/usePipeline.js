import { useCallback, useMemo, useState } from "react"
import { api } from "../utils/api"
import { formatDateTime } from "../utils/formatters"

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
        confidence: success ? Math.max(72, 96 - Object.keys(nextAgentStates).length * 2) : undefined
      }
    })

    const computedDuration =
      run.started_at && run.completed_at
        ? new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()
        : null

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
            confidence: Math.max(72, 96 - Object.keys(prev).length * 2)
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
          [event.agent]: { status: "failed", durationMs: event.duration_ms }
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
        setDurationMs(event.actual_duration_ms || null)
        setAgentTimes(event.agent_times || {})
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
    performanceData,
    trigger,
    updateFromEvent,
    hydrateLatest,
    hydrateRunId
  }
}
