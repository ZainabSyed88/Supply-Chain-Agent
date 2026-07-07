import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  DollarSign,
  Package,
  Sparkles,
  TestTube2,
  Truck
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
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
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  statusLabel
} from "../utils/formatters"

const severityWeights = {
  critical: 1,
  high: 0.72,
  medium: 0.46,
  low: 0.24
}

const shipmentStatusPriority = {
  delayed: 0,
  at_risk: 1,
  in_transit: 2,
  delivered: 3
}

const cascadeColors = ["#ef4444", "#f59e0b", "#3b82f6"]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function buildScenarioPrompt(scenario) {
  const inventoryLines = scenario.inventoryHotspots
    .slice(0, 3)
    .map((item) => `- ${item.sku_id}: projected stock ${item.projectedStock}, threshold ${item.threshold}, shortage ${item.shortageUnits}`)
    .join("\n")

  const shipmentLines = scenario.impactedShipments
    .slice(0, 3)
    .map((shipment) => `- ${shipment.shipment_id}: ${statusLabel(shipment.projectedStatus)}, ${shipment.projectedDelayDays} projected delay days, value ${formatCurrency(shipment.value_usd)}`)
    .join("\n")

  return [
    "You are ChainPulse Copilot reviewing a what-if supplier delay simulation.",
    "Use the exact scenario metrics below and do not invent different numbers.",
    "",
    `Supplier: ${scenario.supplier.name} (${scenario.supplier.supplier_id})`,
    `Country: ${scenario.supplier.country}`,
    `Category: ${scenario.supplier.category}`,
    `Supplier risk score: ${Math.round(scenario.supplier.risk_score)}`,
    `On-time delivery rate: ${formatPercent(scenario.supplier.on_time_delivery_rate)}`,
    `Average lead time: ${scenario.supplier.avg_lead_time_days} days`,
    `Injected delay: ${scenario.delayDays} days`,
    `Active disruptions touching supplier: ${scenario.activeDisruptions.length}`,
    `Linked shipments: ${scenario.shipments.length}`,
    `Projected delayed shipments: ${scenario.projectedDelayedShipments}`,
    `Projected at-risk shipments: ${scenario.projectedAtRiskShipments}`,
    `Revenue at risk: ${formatCurrency(scenario.revenueAtRiskUsd)}`,
    `Expedite cost estimate: ${formatCurrency(scenario.expediteCostUsd)}`,
    `Inventory SKUs below threshold after simulation: ${scenario.inventoryBelowThresholdCount}`,
    `Inventory units at risk: ${formatNumber(scenario.inventoryUnitsAtRisk)}`,
    `Service level drop: ${scenario.serviceLevelDropPct.toFixed(1)} percentage points`,
    `Recovery time: ${scenario.recoveryTimeDays} days`,
    "",
    "Inventory hotspots:",
    inventoryLines || "- None",
    "",
    "Shipment hotspots:",
    shipmentLines || "- None",
    "",
    "Respond in this structure:",
    "1. Two-sentence executive takeaway.",
    "2. Three short bullets labeled Revenue, Inventory, and Shipments.",
    "3. Finish with exactly three concrete mitigation actions."
  ].join("\n")
}

function buildFallbackNarrative(scenario) {
  return [
    `${scenario.supplier.name} taking a ${scenario.delayDays}-day hit pushes ${formatCurrency(scenario.revenueAtRiskUsd)} into the risk window across ${scenario.projectedDelayedShipments} delayed and ${scenario.projectedAtRiskShipments} at-risk shipments.`,
    `Inventory tightens quickly: ${scenario.inventoryBelowThresholdCount} SKUs dip below threshold and roughly ${formatNumber(scenario.inventoryUnitsAtRisk)} units lose buffer coverage, which can compress service levels by ${scenario.serviceLevelDropPct.toFixed(1)} points.`,
    `Recovery is likely to take about ${scenario.recoveryTimeDays} days unless the team expedites top-value lanes, reallocates constrained SKUs, and activates an alternate source for ${scenario.supplier.category.toLowerCase()} supply.`
  ].join("\n\n")
}

function getHotspotSeverity(shortageUnits, threshold) {
  if (shortageUnits >= threshold) return "critical"
  if (shortageUnits >= threshold * 0.5) return "high"
  if (shortageUnits > 0) return "medium"
  return "low"
}

function getScenarioModel(data, selectedSupplierId, delayDays) {
  const supplier = data?.suppliers?.find((item) => item.supplier_id === selectedSupplierId)
  if (!supplier) return null

  const shipments = (data.shipments || []).filter((shipment) => shipment.supplier_id === supplier.supplier_id)
  const activeDisruptions = (data.disruptions || []).filter((disruption) =>
    disruption.affected_supplier_ids?.includes(supplier.supplier_id)
  )
  const openShipments = shipments.filter((shipment) => shipment.status !== "delivered")
  const baselineDelayed = shipments.filter((shipment) => shipment.status === "delayed").length
  const baselineAtRisk = shipments.filter((shipment) => shipment.status === "at_risk").length
  const shipmentValueUsd = shipments.reduce((sum, shipment) => sum + shipment.value_usd, 0)
  const openShipmentValueUsd = openShipments.reduce((sum, shipment) => sum + shipment.value_usd, 0)
  const disruptionWeight = activeDisruptions.reduce((sum, disruption) => sum + (severityWeights[disruption.severity] || 0.2), 0)
  const disruptionRevenueUsd = activeDisruptions.reduce((sum, disruption) => sum + disruption.estimated_revenue_impact_usd, 0)
  const impactRate = clamp(0.22 + delayDays / 20 + supplier.risk_score / 180 + disruptionWeight * 0.07, 0.2, 0.94)
  const projectedDelayedShipments = Math.min(
    Math.max(openShipments.length, shipments.length, 1),
    Math.max(baselineDelayed, Math.ceil(Math.max(openShipments.length, 1) * impactRate))
  )
  const projectedAtRiskShipments = Math.min(
    Math.max(shipments.length, 1),
    Math.max(baselineAtRisk, Math.ceil(Math.max(shipments.length, 1) * clamp(impactRate - 0.08, 0.16, 0.86)))
  )
  const revenueAtRiskUsd = Math.round(
    (openShipmentValueUsd || shipmentValueUsd || 0) * impactRate + disruptionRevenueUsd * 0.12 + delayDays * 12000
  )
  const expediteCostUsd = Math.round(revenueAtRiskUsd * clamp(0.08 + delayDays / 90, 0.08, 0.25))
  const serviceLevelDropPct = clamp(
    delayDays * 1.35 + (1 - supplier.on_time_delivery_rate) * 28 + activeDisruptions.length * 2.4,
    4,
    34
  )
  const rerouteSharePct = clamp(18 + delayDays * 2.2 + supplier.risk_score / 6, 20, 86)
  const recoveryTimeDays = Math.max(3, Math.round(delayDays * 0.72 + supplier.avg_lead_time_days * 0.34 + activeDisruptions.length * 2))
  const inventoryPressure = Math.round(
    projectedDelayedShipments * 11 + projectedAtRiskShipments * 7 + delayDays * 9 + supplier.avg_lead_time_days * 0.8
  )

  const inventoryRows = [...(data.inventory || [])]
    .sort((left, right) => (left.stock_level - left.threshold) - (right.stock_level - right.threshold))
    .map((item, index) => {
      const weight = Math.max(0.22, 1 - index * 0.08)
      const projectedConsumption = Math.round(inventoryPressure * weight)
      const projectedStock = Math.max(0, item.stock_level - projectedConsumption)
      const shortageUnits = Math.max(0, item.threshold - projectedStock)

      return {
        ...item,
        projectedConsumption,
        projectedStock,
        shortageUnits,
        severity: getHotspotSeverity(shortageUnits, item.threshold)
      }
    })

  const inventoryHotspots = [...inventoryRows]
    .sort((left, right) => right.shortageUnits - left.shortageUnits || left.projectedStock - right.projectedStock)
    .slice(0, 5)

  const inventoryBelowThresholdCount = inventoryRows.filter((item) => item.projectedStock < item.threshold).length
  const inventoryUnitsAtRisk = inventoryRows.reduce((sum, item) => sum + item.shortageUnits, 0)
  const coverageDaysLost = clamp(Math.round(delayDays * 0.8 + inventoryBelowThresholdCount * 0.9), 2, 30)

  const impactedShipments = [...shipments]
    .sort(
      (left, right) =>
        (shipmentStatusPriority[left.status] || 99) - (shipmentStatusPriority[right.status] || 99) || right.value_usd - left.value_usd
    )
    .slice(0, 5)
    .map((shipment, index) => {
      const projectedDelayDays = shipment.status === "delivered" ? shipment.delay_days : shipment.delay_days + delayDays + index
      const projectedStatus = shipment.status === "delivered"
        ? "delivered"
        : projectedDelayDays >= 6
          ? "delayed"
          : projectedDelayDays >= 2
            ? "at_risk"
            : "in_transit"

      return {
        ...shipment,
        projectedDelayDays,
        projectedStatus,
        projectedEta: new Date(new Date(shipment.eta).getTime() + projectedDelayDays * 24 * 60 * 60 * 1000).toISOString()
      }
    })

  const cascade = [
    {
      name: "Revenue",
      severity: Math.round(impactRate * 100),
      detail: formatCurrency(revenueAtRiskUsd),
      color: cascadeColors[0]
    },
    {
      name: "Inventory",
      severity: clamp(Math.round((inventoryBelowThresholdCount / Math.max(inventoryRows.length, 1)) * 100 + coverageDaysLost), 18, 96),
      detail: `${inventoryBelowThresholdCount} SKUs`,
      color: cascadeColors[1]
    },
    {
      name: "Shipments",
      severity: clamp(Math.round((projectedDelayedShipments / Math.max(openShipments.length || shipments.length, 1)) * 100), 20, 96),
      detail: `${projectedDelayedShipments} delayed`,
      color: cascadeColors[2]
    }
  ]

  const actions = [
    `Expedite the top ${Math.min(projectedDelayedShipments, 3)} high-value shipment lanes tied to ${supplier.name}.`,
    `Reallocate inventory coverage across ${inventoryBelowThresholdCount || 1} constrained SKU${inventoryBelowThresholdCount === 1 ? "" : "s"} before thresholds are breached.`,
    `Trigger alternate-source review for ${supplier.category.toLowerCase()} supply and plan for a ${recoveryTimeDays}-day recovery window.`
  ]

  return {
    supplier,
    delayDays,
    shipments,
    activeDisruptions,
    shipmentValueUsd,
    projectedDelayedShipments,
    projectedAtRiskShipments,
    revenueAtRiskUsd,
    expediteCostUsd,
    serviceLevelDropPct,
    rerouteSharePct,
    recoveryTimeDays,
    coverageDaysLost,
    inventoryBelowThresholdCount,
    inventoryUnitsAtRisk,
    inventoryHotspots,
    impactedShipments,
    cascade,
    actions
  }
}

function KpiCard({ icon: Icon, label, value, helper, tone }) {
  const toneClasses = {
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700"
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
        </div>
        <div className={`rounded-2xl border p-3 ${toneClasses[tone] || toneClasses.blue}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function ScenarioTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-slate-900">{row.name}</p>
      <p className="mt-1 text-slate-600">Severity: {row.severity}%</p>
      <p className="text-slate-500">{row.detail}</p>
    </div>
  )
}

export default function Simulator() {
  const { data, loading, error, refetch } = useApi(
    async () => {
      const [suppliers, shipments, disruptions, inventory] = await Promise.all([
        api.getSuppliers(),
        api.getShipments(),
        api.getDisruptions(),
        api.getInventory()
      ])

      return { suppliers, shipments, disruptions, inventory }
    },
    []
  )

  const [selectedSupplierId, setSelectedSupplierId] = useState("")
  const [delayDays, setDelayDays] = useState(7)
  const [analysis, setAnalysis] = useState("")
  const [analysisError, setAnalysisError] = useState("")
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisModel, setAnalysisModel] = useState("")
  const [lastScenarioKey, setLastScenarioKey] = useState("")
  const [lastSimulatedAt, setLastSimulatedAt] = useState("")

  const suppliers = useMemo(
    () => [...(data?.suppliers || [])].sort((left, right) => right.risk_score - left.risk_score),
    [data]
  )

  useEffect(() => {
    if (!suppliers.length || selectedSupplierId) return
    setSelectedSupplierId(suppliers[0].supplier_id)
  }, [selectedSupplierId, suppliers])

  const scenario = useMemo(
    () => getScenarioModel(data, selectedSupplierId, delayDays),
    [data, delayDays, selectedSupplierId]
  )

  const currentScenarioKey = scenario ? `${scenario.supplier.supplier_id}:${scenario.delayDays}` : ""
  const needsResimulate = Boolean(lastScenarioKey) && currentScenarioKey !== lastScenarioKey
  const hasFreshAnalysis = Boolean(analysis) && currentScenarioKey === lastScenarioKey

  const runSimulation = async () => {
    if (!scenario || analysisLoading) return

    const prompt = buildScenarioPrompt(scenario)
    setAnalysis("")
    setAnalysisError("")
    setAnalysisModel("")
    setAnalysisLoading(true)
    setLastScenarioKey(currentScenarioKey)
    setLastSimulatedAt(new Date().toISOString())

    try {
      const response = await api.chat(prompt, [], `what-if-${currentScenarioKey}`, true, {
        stream: true,
        onEvent: (event) => {
          if (event.type === "start") {
            setAnalysisModel(event.model_used || "")
            return
          }

          if (event.type === "delta") {
            setAnalysis((current) => `${current}${event.delta || ""}`)
            return
          }

          if (event.type === "done") {
            setAnalysis(event.response || "")
            setAnalysisModel(event.model_used || "")
          }
        }
      })

      setAnalysis(response.response || "")
      setAnalysisModel(response.model_used || analysisModel)
    } catch (err) {
      setAnalysisError(err.message || "Unable to generate AI scenario analysis.")
      setAnalysisModel("Local fallback")
      setAnalysis(buildFallbackNarrative(scenario))
    } finally {
      setAnalysisLoading(false)
    }
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Simulator unavailable"
        description={error}
        action={
          <button type="button" onClick={refetch} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        }
      />
    )
  }

  if (loading || !scenario) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border bg-white">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white xl:border-b-0 xl:border-r xl:border-slate-800">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
              <TestTube2 className="h-3.5 w-3.5" />
              What-If Simulator
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Inject a supplier delay and watch the cascade.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Pick a supplier, add delay days, and ChainPulse will model the knock-on effect across revenue exposure, shipment flow, and inventory buffers before you commit to a response.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Linked shipments</p>
                <p className="mt-2 text-2xl font-semibold text-white">{scenario.shipments.length}</p>
                <p className="mt-1 text-sm text-slate-300">{formatCurrency(scenario.shipmentValueUsd)} exposed value</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Supplier health</p>
                <p className="mt-2 text-2xl font-semibold text-white">{Math.round(scenario.supplier.risk_score)}</p>
                <p className="mt-1 text-sm text-slate-300">{formatPercent(scenario.supplier.on_time_delivery_rate)} on-time delivery</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Current disruptions</p>
                <p className="mt-2 text-2xl font-semibold text-white">{scenario.activeDisruptions.length}</p>
                <p className="mt-1 text-sm text-slate-300">{scenario.recoveryTimeDays} day recovery horizon</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Scenario Controls</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Model a supplier slip in seconds</h2>
              </div>
              {hasFreshAnalysis ? <Badge label="AI summary ready" variant="success" /> : <Badge label="Ready to simulate" variant="info" />}
            </div>

            <div className="mt-6 grid gap-5">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Supplier</span>
                <select
                  value={selectedSupplierId}
                  onChange={(event) => setSelectedSupplierId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  {suppliers.map((supplier) => (
                    <option key={supplier.supplier_id} value={supplier.supplier_id}>
                      {supplier.name} - Risk {Math.round(supplier.risk_score)} - {supplier.country}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Injected delay</p>
                    <p className="mt-1 text-sm text-slate-500">Stretch the supplier lead time and re-run the impact model.</p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900">
                    {delayDays} days
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="21"
                  step="1"
                  value={delayDays}
                  onChange={(event) => setDelayDays(Number(event.target.value))}
                  className="mt-4 w-full accent-primary"
                />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>1 day</span>
                  <span>One week</span>
                  <span>Three weeks</span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-900">
                  Scenario preview: {scenario.supplier.name} slips by {delayDays} days.
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  ChainPulse forecasts {scenario.projectedDelayedShipments} delayed shipments, {scenario.inventoryBelowThresholdCount} inventory hotspots, and {formatCurrency(scenario.revenueAtRiskUsd)} at risk.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={runSimulation}
                  disabled={analysisLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {analysisLoading ? "Simulating..." : "Simulate Impact"}
                </button>
                <button
                  type="button"
                  onClick={() => setDelayDays(7)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset to 7 days
                </button>
                {lastSimulatedAt ? (
                  <span className="text-sm text-slate-500">Last simulated on {formatDate(lastSimulatedAt)}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={DollarSign}
          label="Revenue at risk"
          value={formatCurrency(scenario.revenueAtRiskUsd)}
          helper={`${formatCurrency(scenario.expediteCostUsd)} potential expedite cost`}
          tone="red"
        />
        <KpiCard
          icon={Truck}
          label="Shipment disruption"
          value={`${scenario.projectedDelayedShipments} delayed`}
          helper={`${scenario.projectedAtRiskShipments} shipments likely to move into at-risk status`}
          tone="blue"
        />
        <KpiCard
          icon={Package}
          label="Inventory pressure"
          value={`${scenario.inventoryBelowThresholdCount} SKUs`}
          helper={`${formatNumber(scenario.inventoryUnitsAtRisk)} units lose safety stock`}
          tone="amber"
        />
        <KpiCard
          icon={Clock3}
          label="Recovery window"
          value={`${scenario.recoveryTimeDays} days`}
          helper={`${scenario.coverageDaysLost} inventory coverage days eroded`}
          tone="blue"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cascade View</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Where the disruption hits hardest</h2>
            </div>
            <Badge label={`${Math.round(scenario.serviceLevelDropPct)} pt service drop`} variant="high" />
          </div>

          <div className="mt-6 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenario.cascade} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={88} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<ScenarioTooltip />} />
                <Bar dataKey="severity" radius={[0, 10, 10, 0]}>
                  {scenario.cascade.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {scenario.cascade.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{item.name}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{item.detail}</p>
                <p className="mt-1 text-sm text-slate-500">Severity {item.severity}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">AI Readout</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Copilot scenario analysis</h2>
            </div>
            {analysisModel ? <Badge label={analysisModel} variant={analysisModel === "Local fallback" ? "medium" : "info"} /> : null}
          </div>

          {needsResimulate ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Controls changed after the last run. Re-run the simulation to refresh the AI summary.
            </div>
          ) : null}

          {analysisLoading ? (
            <div className="mt-6 flex min-h-[280px] flex-col justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5">
              <div className="flex items-center gap-3 text-slate-600">
                <Spinner size="sm" />
                <span className="text-sm font-medium">Streaming impact analysis from Copilot...</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {analysis || "ChainPulse is connecting revenue exposure, shipment delays, and inventory pressure into one scenario narrative."}
              </p>
            </div>
          ) : hasFreshAnalysis ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{analysis}</p>
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Run the simulation"
              description="ChainPulse will generate an AI summary that explains the cascading impact on revenue, inventory, and shipments for this supplier delay scenario."
            />
          )}

          {analysisError ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Copilot fallback used because the live AI request failed: {analysisError}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3">
            {scenario.actions.map((action) => (
              <div key={action} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-slate-700">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Inventory Hotspots</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Projected SKU pressure after the delay</h2>
            </div>
            <Badge label={`${scenario.inventoryBelowThresholdCount} below threshold`} variant="high" />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1fr,0.8fr,0.8fr,0.8fr,0.7fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>SKU</span>
              <span>Current</span>
              <span>Projected</span>
              <span>Threshold</span>
              <span>Gap</span>
            </div>
            <div className="divide-y divide-slate-100">
              {scenario.inventoryHotspots.map((item) => (
                <div key={item.sku_id} className="grid grid-cols-[1fr,0.8fr,0.8fr,0.8fr,0.7fr] gap-3 px-4 py-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{item.sku_id}</p>
                    <p className="mt-1 text-xs text-slate-500">Projected drawdown {formatNumber(item.projectedConsumption)} units</p>
                  </div>
                  <span className="text-slate-600">{formatNumber(item.stock_level)}</span>
                  <span className={item.projectedStock < item.threshold ? "font-semibold text-red-600" : "text-slate-600"}>
                    {formatNumber(item.projectedStock)}
                  </span>
                  <span className="text-slate-600">{formatNumber(item.threshold)}</span>
                  <div>
                    <Badge label={formatNumber(item.shortageUnits)} variant={item.severity} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Shipment Hotspots</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Highest-value loads exposed by the delay</h2>
            </div>
            <Badge label={`${Math.round(scenario.rerouteSharePct)}% need reroute review`} variant="medium" />
          </div>

          <div className="mt-5 space-y-3">
            {scenario.impactedShipments.length ? (
              scenario.impactedShipments.map((shipment) => (
                <div key={shipment.shipment_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{shipment.shipment_id}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {shipment.origin} {"->"} {shipment.destination} via {shipment.carrier}
                        </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(shipment.value_usd)}</p>
                      <p className="mt-1 text-sm text-slate-500">ETA {formatDate(shipment.projectedEta)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge label={`Current ${statusLabel(shipment.status)}`} variant={shipment.status} />
                    <Badge label={`Projected ${statusLabel(shipment.projectedStatus)}`} variant={shipment.projectedStatus} />
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {shipment.projectedDelayDays} projected delay days
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Truck}
                title="No linked shipments found"
                description="This supplier has no shipments in the current dataset, so the scenario impact is limited."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
