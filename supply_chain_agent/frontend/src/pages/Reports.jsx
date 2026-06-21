import { useEffect, useMemo, useState } from "react"
import { FileDown, FileText, PlayCircle } from "lucide-react"
import { useOutletContext } from "react-router-dom"
import DataTable from "../components/shared/DataTable"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import Modal from "../components/ui/Modal"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { usePipeline } from "../hooks/usePipeline"
import { useWebSocket } from "../hooks/useWebSocket"
import { api } from "../utils/api"
import { compactId, formatDateTime, formatRelativeTime } from "../utils/formatters"

export default function Reports() {
  const { refreshLatestRun } = useOutletContext()
  const [selectedRunId, setSelectedRunId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const pipeline = usePipeline()

  const { data, loading, error, refetch } = useApi(
    async () => {
      const [history, kpis, disruptions] = await Promise.all([
        api.getPipelineHistory(),
        api.getKPIs(),
        api.getDisruptions()
      ])
      return { history, kpis, disruptions }
    },
    []
  )

  useWebSocket(
    pipeline.runId ? `/pipeline/${pipeline.runId}` : null,
    (payload) => {
      if (payload.event !== "ping" && payload.event !== "pong") {
        pipeline.updateFromEvent(payload)
        if (payload.event === "pipeline_complete") {
          refreshLatestRun?.()
          refetch()
        }
      }
    },
    Boolean(pipeline.runId)
  )

  useEffect(() => {
    if (!selectedRunId && data?.history?.length) {
      setSelectedRunId(data.history[0].run_id)
    }
  }, [data, selectedRunId])

  const selectedRun = useMemo(
    () => data?.history?.find((run) => run.run_id === selectedRunId) || null,
    [data, selectedRunId]
  )

  const runSummary = useMemo(() => {
    if (!selectedRun || !data) return null
    const topRisks = data.disruptions.slice(0, 3).map((disruption, index) => ({
      id: index + 1,
      text: `${disruption.type.replaceAll("_", " ")} affecting ${disruption.affected_supplier_ids.length} suppliers`
    }))
    return {
      executiveSummary: `Pipeline run ${selectedRun.run_id} completed with ${Object.keys(selectedRun.results || {}).length} agent results and status ${selectedRun.status}.`,
      topRisks,
      recommendations: [
        "Prioritize at-risk suppliers for mitigation planning.",
        "Escalate delayed shipments with highest revenue impact.",
        "Use alternate sourcing for critical categories."
      ]
    }
  }, [data, selectedRun])

  const columns = [
    {
      key: "run_id",
      label: "Run ID",
      render: (run) => compactId(run.run_id)
    },
    {
      key: "started_at",
      label: "Generated At",
      render: (run) => formatDateTime(run.started_at)
    },
    {
      key: "status",
      label: "Status",
      render: (run) => <Badge label={run.status} variant={run.status === "completed" ? "success" : run.status === "failed" ? "critical" : "low"} />
    },
    {
      key: "duration",
      label: "Duration",
      render: (run) =>
        run.completed_at ? `${((new Date(run.completed_at) - new Date(run.started_at)) / 1000).toFixed(1)}s` : "--"
    },
    {
      key: "agents",
      label: "Agents",
      render: (run) => `${Object.values(run.results || {}).filter((result) => result.success).length}/${Object.keys(run.results || {}).length} succeeded`
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (run) => (
        <div className="flex gap-3 text-sm font-semibold text-primary">
          <a href={api.getReportUrl(run.run_id)} target="_blank" rel="noreferrer">
            Download PDF
          </a>
          <button type="button" onClick={() => setSelectedRunId(run.run_id)}>
            View Summary
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,400px]">
      <div className="space-y-6">
        <section className="rounded-lg border bg-white p-5 shadow-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <button
                type="button"
                onClick={async () => {
                  setModalOpen(true)
                  await pipeline.trigger()
                }}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white"
              >
                <PlayCircle className="h-4 w-4" />
                Generate New Report
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Last report: {data?.history?.[0]?.started_at ? formatRelativeTime(data.history[0].started_at) : "No reports yet"}
            </p>
          </div>
        </section>

        {error ? (
          <EmptyState icon={FileText} title="Reports unavailable" description={error} />
        ) : (
          <DataTable
            columns={columns}
            data={data?.history || []}
            loading={loading}
            emptyTitle="No reports yet"
            emptyMessage="Generate a new report to build a downloadable pipeline summary."
            onRowClick={(run) => setSelectedRunId(run.run_id)}
          />
        )}
      </div>

      <aside className="rounded-lg border bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-slate-900">Report Preview</h2>
        {selectedRun && runSummary ? (
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-900">Executive Summary</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{runSummary.executiveSummary}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">KPI Snapshot</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Total suppliers</span>
                  <span>{data.kpis.total_suppliers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active disruptions</span>
                  <span>{data.kpis.active_disruptions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delayed shipments</span>
                  <span>{data.kpis.delayed_shipments}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Top 3 Risks</p>
              <div className="mt-3 space-y-2">
                {runSummary.topRisks.map((item) => (
                  <div key={item.id} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {item.id}. {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Top Recommendations</p>
              <div className="mt-3 space-y-2">
                {runSummary.recommendations.map((item) => (
                  <div key={item} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <a
              href={api.getReportUrl(selectedRun.run_id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </a>
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState icon={FileText} title="Select a run" description="Choose a pipeline run to preview its executive report summary." />
          </div>
        )}
      </aside>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate Report" size="md">
        <div className="space-y-5">
          <div className="h-3 rounded-full bg-slate-100">
            <div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${pipeline.progress}%` }} />
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Status</p>
            <p className="mt-2 text-sm text-slate-600">{pipeline.currentAgent || pipeline.status}</p>
          </div>
          <div className="max-h-60 space-y-2 overflow-y-auto scrollbar-thin">
            {pipeline.logs.map((entry) => (
              <div key={entry.id} className="rounded-lg border bg-white px-3 py-2 text-sm text-slate-600">
                {entry.message}
              </div>
            ))}
            {!pipeline.logs.length ? <Spinner /> : null}
          </div>
          {pipeline.status === "completed" && pipeline.runId ? (
            <a
              href={api.getReportUrl(pipeline.runId)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              <FileDown className="h-4 w-4" />
              Report Ready! Download PDF
            </a>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
