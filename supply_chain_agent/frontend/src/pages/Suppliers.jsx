import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { BarChart3, Download, Factory, RefreshCw, ShieldAlert } from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import DataTable from "../components/shared/DataTable"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import Modal from "../components/ui/Modal"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import { SUPPLIER_CATEGORIES } from "../utils/constants"
import {
  formatPercent,
  getCountryFlag,
  riskLevel,
  riskColor,
  statusLabel
} from "../utils/formatters"

function SupplierMetric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function Suppliers() {
  const location = useLocation()
  const navigate = useNavigate()
  const [category, setCategory] = useState("")
  const [riskFilter, setRiskFilter] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [analysis, setAnalysis] = useState("")
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [autoOpenedKey, setAutoOpenedKey] = useState("")
  const affectedSupplierIds = location.state?.affectedSupplierIds || []
  const disruptionLabel = location.state?.disruptionLabel || ""
  const supplierContextLabel = location.state?.contextLabel || ""
  const drilldownKey = `${affectedSupplierIds.join(",")}::${disruptionLabel}`

  useEffect(() => {
    setRiskFilter(location.state?.riskFilter || "")
  }, [location.state])

  useEffect(() => {
    if (!affectedSupplierIds.length) {
      setAutoOpenedKey("")
      return
    }

    if (drilldownKey !== autoOpenedKey) {
      setAutoOpenedKey("")
    }
  }, [affectedSupplierIds.length, autoOpenedKey, drilldownKey])

  const { data, loading, error, refetch } = useApi(
    async () => {
      const [suppliers, shipments, disruptions] = await Promise.all([
        api.getSuppliers(),
        api.getShipments(),
        api.getDisruptions()
      ])
      return { suppliers, shipments, disruptions }
    },
    []
  )

  useEffect(() => {
    if (!selectedSupplier) return

    let cancelled = false
    const loadAnalysis = async () => {
      try {
        setAnalysisLoading(true)
        const response = await api.chat(
          `Provide a concise supply chain risk analysis for supplier ${selectedSupplier.name} in ${selectedSupplier.country}. Risk score ${selectedSupplier.risk_score}, ESG score ${selectedSupplier.esg_score}.`
        )
        if (!cancelled) setAnalysis(response.response)
      } catch {
        if (!cancelled) {
          setAnalysis(
            `${selectedSupplier.name} shows ${selectedSupplier.risk_score > 65 ? "elevated" : "manageable"} exposure driven by ${
              selectedSupplier.on_time_delivery_rate < 0.82 ? "service reliability pressure" : "moderate operational variance"
            }. Prioritize alternate capacity for ${selectedSupplier.category.toLowerCase()} components and tighten SLA monitoring over the next 30 days.`
          )
        }
      } finally {
        if (!cancelled) setAnalysisLoading(false)
      }
    }

    loadAnalysis()
    return () => {
      cancelled = true
    }
  }, [selectedSupplier])

  useEffect(() => {
    if (!data?.suppliers?.length || !affectedSupplierIds.length || selectedSupplier || autoOpenedKey === drilldownKey) return

    const firstAffectedSupplier = data.suppliers.find((supplier) => affectedSupplierIds.includes(supplier.supplier_id))
    if (firstAffectedSupplier) {
      setSelectedSupplier(firstAffectedSupplier)
      setActiveTab("overview")
      setAutoOpenedKey(drilldownKey)
    }
  }, [affectedSupplierIds, autoOpenedKey, data, drilldownKey, selectedSupplier])

  const model = useMemo(() => {
    if (!data) return null
    const enriched = data.suppliers.map((supplier) => ({
      ...supplier,
      disruptionCount: data.disruptions.filter((disruption) => disruption.affected_supplier_ids.includes(supplier.supplier_id)).length,
      shipmentCount: data.shipments.filter((shipment) => shipment.supplier_id === supplier.supplier_id).length
    }))

    const filtered = enriched.filter((supplier) => {
      const categoryMatch = category ? supplier.category === category : true
      const riskMatch =
        riskFilter === ""
          ? true
          : riskFilter === "critical"
            ? supplier.risk_score > 80
            : riskFilter === "high"
              ? supplier.risk_score > 65 && supplier.risk_score <= 80
              : riskFilter === "medium"
                ? supplier.risk_score > 40 && supplier.risk_score <= 65
                : supplier.risk_score <= 40
      const affectedMatch = affectedSupplierIds.length ? affectedSupplierIds.includes(supplier.supplier_id) : true
      return categoryMatch && riskMatch && affectedMatch
    })

    return {
      all: enriched,
      filtered,
      stats: {
        total: enriched.length,
        active: enriched.filter((supplier) => supplier.active).length,
        atRisk: enriched.filter((supplier) => supplier.risk_score > 65).length,
        critical: enriched.filter((supplier) => supplier.risk_score > 80).length
      }
    }
  }, [affectedSupplierIds, category, data, riskFilter])

  const selectedShipments = useMemo(
    () => data?.shipments.filter((shipment) => shipment.supplier_id === selectedSupplier?.supplier_id) || [],
    [data, selectedSupplier]
  )

  const alternateSuppliers = useMemo(() => {
    if (!model || !selectedSupplier) return []
    return model.all
      .filter((supplier) => supplier.supplier_id !== selectedSupplier.supplier_id && supplier.category === selectedSupplier.category && supplier.active)
      .sort((left, right) => left.risk_score - right.risk_score)
      .slice(0, 4)
  }, [model, selectedSupplier])

  const riskTrend = useMemo(() => {
    if (!selectedSupplier) return []
    return Array.from({ length: 30 }, (_, index) => ({
      day: `D-${29 - index}`,
      score: Math.max(
        20,
        Math.min(
          100,
          selectedSupplier.risk_score + Math.sin(index / 4) * 6 + (selectedSupplier.disruptionCount || 0) * 1.5 - 4
        )
      )
    }))
  }, [selectedSupplier])

  const exportCsv = () => {
    if (!model) return
    const headers = ["Supplier ID", "Name", "Country", "Category", "Risk Score", "On Time Delivery", "ESG Score", "Status"]
    const rows = model.filtered.map((supplier) => [
      supplier.supplier_id,
      supplier.name,
      supplier.country,
      supplier.category,
      supplier.risk_score,
      supplier.on_time_delivery_rate,
      supplier.esg_score,
      supplier.active ? "Active" : "Inactive"
    ])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "chainpulse-suppliers.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Suppliers page unavailable"
        description={error}
        action={
          <button type="button" onClick={refetch} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        }
      />
    )
  }

  const columns = [
    {
      key: "name",
      label: "Supplier",
      render: (supplier) => (
        <div>
          <p className="font-medium text-slate-900">
            {getCountryFlag(supplier.country)} {supplier.name}
          </p>
          <p className="text-xs text-slate-500">{supplier.country}</p>
        </div>
      )
    },
    {
      key: "category",
      label: "Category",
      render: (supplier) => <Badge label={supplier.category} variant="info" />
    },
    {
      key: "risk_score",
      label: "Risk Score",
      render: (supplier) => (
        <div>
          <p className={`font-semibold ${riskColor(supplier.risk_score)}`}>{supplier.risk_score.toFixed(1)}</p>
          <div className="mt-2 h-2 w-28 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${supplier.risk_score}%` }} />
          </div>
        </div>
      )
    },
    {
      key: "on_time_delivery_rate",
      label: "On-Time Delivery",
      render: (supplier) => (
        <span className={supplier.on_time_delivery_rate >= 0.85 ? "text-emerald-600" : "text-red-600"}>
          {formatPercent(supplier.on_time_delivery_rate)}
        </span>
      )
    },
    {
      key: "avg_lead_time_days",
      label: "Lead Time",
      render: (supplier) => `${supplier.avg_lead_time_days} days`
    },
    {
      key: "esg_score",
      label: "ESG Score",
      render: (supplier) => <span className={supplier.esg_score >= 75 ? "text-emerald-600" : "text-amber-600"}>{supplier.esg_score}</span>
    },
    {
      key: "active",
      label: "Status",
      render: (supplier) => <Badge label={supplier.active ? "Active" : "Inactive"} variant={supplier.active ? "success" : "info"} />
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: () => (
        <div className="flex gap-3 text-sm font-semibold text-primary">
          <span>View</span>
          <span>Simulate</span>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {affectedSupplierIds.length || supplierContextLabel ? (
        <section className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">{affectedSupplierIds.length ? "Showing affected suppliers" : "Showing dashboard drilldown"}</p>
            <p>
              {affectedSupplierIds.length
                ? `Filtered to ${affectedSupplierIds.length} supplier${affectedSupplierIds.length > 1 ? "s" : ""} from ${disruptionLabel || "the selected disruption"}.`
                : supplierContextLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/suppliers", { replace: true })}
            className="inline-flex cursor-pointer rounded-md border bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear filter
          </button>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {model
          ? [
              ["Total", model.stats.total],
              ["Active", model.stats.active],
              ["At Risk", model.stats.atRisk],
              ["Critical", model.stats.critical]
            ].map(([label, value]) => (
              <SupplierMetric key={label} label={label} value={value} />
            ))
          : Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-lg border bg-white" />)}
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-md border px-3 py-2.5 text-sm">
              <option value="">All categories</option>
              {SUPPLIER_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} className="rounded-md border px-3 py-2.5 text-sm">
              <option value="">All risk levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </section>

      <DataTable
        columns={columns}
        data={model?.filtered || []}
        loading={loading}
        emptyTitle="No suppliers match these filters"
        emptyMessage="Try broadening the category or risk selection."
        searchPlaceholder="Search suppliers..."
        onRowClick={(supplier) => {
          setSelectedSupplier(supplier)
          setActiveTab("overview")
        }}
      />

      <Modal open={Boolean(selectedSupplier)} onClose={() => setSelectedSupplier(null)} title={selectedSupplier ? `${selectedSupplier.name}` : "Supplier Details"}>
        {selectedSupplier ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">
                {getCountryFlag(selectedSupplier.country)} {selectedSupplier.country} · {selectedSupplier.category}
              </p>
              <Badge label={`${selectedSupplier.risk_score.toFixed(1)} risk`} variant={riskLevel(selectedSupplier.risk_score)} />
            </div>

            <div className="flex flex-wrap gap-2 border-b pb-4">
              {["overview", "shipments", "trend", "alternates"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    activeTab === tab ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {statusLabel(tab)}
                </button>
              ))}
            </div>

            {activeTab === "overview" ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <SupplierMetric label="Risk score" value={selectedSupplier.risk_score.toFixed(1)} />
                  <SupplierMetric label="On-time rate" value={formatPercent(selectedSupplier.on_time_delivery_rate)} />
                  <SupplierMetric label="Defect rate" value={formatPercent(selectedSupplier.defect_rate)} />
                  <SupplierMetric label="Lead time" value={`${selectedSupplier.avg_lead_time_days} days`} />
                </div>
                <div className="rounded-lg border bg-slate-50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-slate-900">AI Risk Analysis</h3>
                  </div>
                  {analysisLoading ? <Spinner /> : <p className="text-sm leading-7 text-slate-600">{analysis}</p>}
                </div>
              </div>
            ) : null}

            {activeTab === "shipments" ? (
              <div className="space-y-3">
                {selectedShipments.length ? (
                  selectedShipments.map((shipment) => (
                    <div key={shipment.shipment_id} className="rounded-lg border bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{shipment.shipment_id}</p>
                          <p className="text-sm text-slate-500">
                            {shipment.origin} to {shipment.destination}
                          </p>
                        </div>
                        <Badge label={statusLabel(shipment.status)} variant={shipment.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={Factory} title="No shipments found" description="This supplier has no linked shipments in the current dataset." />
                )}
              </div>
            ) : null}

            {activeTab === "trend" ? (
              <div className="h-80 rounded-lg border bg-white p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" hide />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}

            {activeTab === "alternates" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {alternateSuppliers.map((supplier) => (
                  <div key={supplier.supplier_id} className="rounded-lg border bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{supplier.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{supplier.country}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge label={`Risk ${supplier.risk_score.toFixed(1)}`} variant={riskLevel(supplier.risk_score)} />
                      <Badge label={`ESG ${supplier.esg_score}`} variant="success" />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
