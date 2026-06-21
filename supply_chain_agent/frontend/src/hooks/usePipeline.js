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
    updateFromEvent
  }
}
