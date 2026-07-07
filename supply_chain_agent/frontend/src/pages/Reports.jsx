import { useMemo, useState } from "react"
import { AlertTriangle, Database, FileDown, FileText, Filter, ShieldAlert, Sparkles, Truck } from "lucide-react"
import clsx from "clsx"
import DataTable from "../components/shared/DataTable"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import { formatCurrency, formatDate, formatDateTime, formatNumber, formatPercent, getShipmentDelayDays, statusLabel } from "../utils/formatters"

const SEVERITY_RANK = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
}

const TEMPLATE_CONFIG = {
  delayed_shipments: {
    title: "Delayed Shipment Dump",
    description: "One-click export of delayed and at-risk shipments with lane, ETA, and value context.",
    icon: Truck,
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    accent: "bg-amber-600"
  },
  supplier_risk: {
    title: "Supplier Risk Register",
    description: "Review suppliers above a chosen risk threshold with service and ESG context.",
    icon: ShieldAlert,
    tone: "border-rose-200 bg-rose-50 text-rose-700",
    accent: "bg-rose-600"
  },
  disruption_log: {
    title: "Disruption Impact Log",
    description: "Track disruption severity, exposure, and expected resolution in a shareable report.",
    icon: AlertTriangle,
    tone: "border-blue-200 bg-blue-50 text-blue-700",
    accent: "bg-blue-600"
  },
  network_snapshot: {
    title: "Full Network Snapshot",
    description: "Export one filtered operational snapshot across orders, shipments, suppliers, and disruptions.",
    icon: Database,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    accent: "bg-emerald-600"
  }
}

function isWithinWindow(dateValue, windowDays) {
  if (windowDays === "all" || !dateValue) return true
  const timestamp = new Date(dateValue).getTime()
  if (Number.isNaN(timestamp)) return false
  const diff = Math.abs(Date.now() - timestamp)
  return diff <= Number(windowDays) * 24 * 60 * 60 * 1000
}

function matchesSeverity(value, threshold) {
  if (threshold === "all") return true
  return (SEVERITY_RANK[value] || 0) >= (SEVERITY_RANK[threshold] || 0)
}

function csvValue(value) {
  if (value === null || value === undefined) return ""
  const stringValue = String(value).replaceAll('"', '""')
  return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function buildCsv(columns, rows) {
  const header = columns.map((column) => csvValue(column.label)).join(",")
  const body = rows
    .map((row) =>
      columns
        .map((column) => {
          const value = column.exportValue ? column.exportValue(row) : row[column.key]
          return csvValue(value)
        })
        .join(",")
    )
    .join("\n")
  return `${header}\n${body}`
}

function buildMetric(label, value) {
  return { label, value }
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function Reports() {
  const [templateKey, setTemplateKey] = useState("delayed_shipments")
  const [windowDays, setWindowDays] = useState("30")
  const [shipmentStatus, setShipmentStatus] = useState("delayed")
  const [severityThreshold, setSeverityThreshold] = useState("high")
  const [minimumRisk, setMinimumRisk] = useState("65")
  const [activeOnly, setActiveOnly] = useState(true)

  const { data, loading, error, refetch } = useApi(
    async () => {
      const [orders, shipments, suppliers, disruptions, warehouses, tickets] = await Promise.all([
        api.getOrders(),
        api.getShipments(),
        api.getSuppliers(),
        api.getDisruptions(),
        api.getWarehouses(),
        api.getTickets()
      ])
      return { orders, shipments, suppliers, disruptions, warehouses, tickets }
    },
    []
  )

  const reportModel = useMemo(() => {
    if (!data) return null

    const supplierMap = new Map(data.suppliers.map((supplier) => [supplier.supplier_id, supplier]))
    const warehouseMap = new Map(data.warehouses.map((warehouse) => [warehouse.warehouse_id, warehouse]))

    const shipments = data.shipments.map((shipment) => ({
      ...shipment,
      supplierName: supplierMap.get(shipment.supplier_id)?.name || shipment.supplier_id,
      route: `${shipment.origin} -> ${shipment.destination}`
    }))

    const filteredShipments = shipments.filter((shipment) => {
      const statusMatch =
        shipmentStatus === "all"
          ? ["delayed", "at_risk"].includes(shipment.status)
          : shipment.status === shipmentStatus
      return statusMatch && isWithinWindow(shipment.eta, windowDays)
    })

    const filteredSuppliers = data.suppliers.filter((supplier) => {
      const riskMatch = supplier.risk_score >= Number(minimumRisk)
      const activeMatch = activeOnly ? supplier.active : true
      return riskMatch && activeMatch
    })

    const filteredDisruptions = data.disruptions.filter((disruption) => {
      return matchesSeverity(disruption.severity, severityThreshold) && isWithinWindow(disruption.detected_at, windowDays)
    })

    const filteredOrders = data.orders.filter((order) => {
      const statusMatch = shipmentStatus === "all" ? true : order.status === shipmentStatus
      return statusMatch && isWithinWindow(order.created_at || order.promised_date, windowDays)
    })

    const delayedShipmentValue = filteredShipments.reduce((total, shipment) => total + (shipment.value_usd || 0), 0)
    const delayedShipmentAvgDelay =
      filteredShipments.length > 0
        ? filteredShipments.reduce((total, shipment) => total + getShipmentDelayDays(shipment), 0) / filteredShipments.length
        : 0

    const supplierAverageRisk =
      filteredSuppliers.length > 0
        ? filteredSuppliers.reduce((total, supplier) => total + supplier.risk_score, 0) / filteredSuppliers.length
        : 0

    const disruptionRevenueImpact = filteredDisruptions.reduce(
      (total, disruption) => total + (disruption.estimated_revenue_impact_usd || 0),
      0
    )

    const snapshotRows = [
      ...filteredShipments.map((shipment) => ({
        record_type: "Shipment",
        record_id: shipment.shipment_id,
        state: statusLabel(shipment.status),
        owner: shipment.supplierName,
        focus: shipment.route,
        date: shipment.eta,
        detail: `${getShipmentDelayDays(shipment)} day delay | ${formatCurrency(shipment.value_usd || 0)}`
      })),
      ...filteredSuppliers.map((supplier) => ({
        record_type: "Supplier",
        record_id: supplier.supplier_id,
        state: `Risk ${supplier.risk_score.toFixed(1)}`,
        owner: supplier.name,
        focus: supplier.category,
        date: null,
        detail: `${supplier.country} | ESG ${supplier.esg_score}`
      })),
      ...filteredDisruptions.map((disruption, index) => ({
        record_type: "Disruption",
        record_id: disruption.disruption_id || `DIS-${index + 1}`,
        state: statusLabel(disruption.severity),
        owner: statusLabel(disruption.type),
        focus: `${disruption.affected_supplier_ids.length} suppliers | ${disruption.affected_shipment_ids.length} shipments`,
        date: disruption.detected_at,
        detail: `${formatCurrency(disruption.estimated_revenue_impact_usd || 0)} impact`
      })),
      ...filteredOrders.map((order) => ({
        record_type: "Order",
        record_id: order.order_id,
        state: statusLabel(order.status),
        owner: order.customer_name,
        focus: warehouseMap.get(order.warehouse_id)?.name || order.warehouse_id,
        date: order.created_at || order.promised_date,
        detail: `Priority ${statusLabel(order.priority)} | Risk ${order.fulfillment_risk?.toFixed?.(1) ?? order.fulfillment_risk}`
      }))
    ].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))

    const commonContext = {
      filters: {
        window: windowDays === "all" ? "All dates" : `${windowDays}-day window`,
        shipmentStatus: shipmentStatus === "all" ? "Delayed + at-risk default set" : statusLabel(shipmentStatus),
        severity: severityThreshold === "all" ? "All severities" : `${statusLabel(severityThreshold)} and above`,
        minimumRisk: `${minimumRisk}+ risk score`,
        supplierMode: activeOnly ? "Active suppliers only" : "All suppliers"
      },
      filteredData: {
        shipments: filteredShipments,
        suppliers: filteredSuppliers,
        disruptions: filteredDisruptions,
        orders: filteredOrders,
        tickets: data.tickets
      }
    }

    const models = {
      delayed_shipments: {
        ...commonContext,
        title: TEMPLATE_CONFIG.delayed_shipments.title,
        description: TEMPLATE_CONFIG.delayed_shipments.description,
        rows: filteredShipments,
        columns: [
          { key: "shipment_id", label: "Shipment ID" },
          { key: "supplierName", label: "Supplier" },
          { key: "route", label: "Route" },
          {
            key: "status",
            label: "Status",
            render: (row) => <Badge label={statusLabel(row.status)} variant={row.status} />,
            exportValue: (row) => statusLabel(row.status)
          },
          {
            key: "delay_days",
            label: "Delay (Days)",
            render: (row) => getShipmentDelayDays(row),
            exportValue: (row) => getShipmentDelayDays(row)
          },
          {
            key: "eta",
            label: "ETA",
            render: (row) => formatDate(row.eta),
            exportValue: (row) => formatDate(row.eta)
          },
          {
            key: "value_usd",
            label: "Value",
            render: (row) => formatCurrency(row.value_usd),
            exportValue: (row) => row.value_usd
          }
        ],
        metrics: [
          buildMetric("Delayed loads", formatNumber(filteredShipments.length)),
          buildMetric("Value exposed", formatCurrency(delayedShipmentValue)),
          buildMetric("Avg delay", `${delayedShipmentAvgDelay.toFixed(1)} days`)
        ],
        briefing: [
          "# Delayed Shipment Dump",
          "",
          `Generated: ${formatDateTime(new Date())}`,
          `Window: ${commonContext.filters.window}`,
          `Shipment scope: ${commonContext.filters.shipmentStatus}`,
          "",
          `Total delayed or at-risk shipments: ${filteredShipments.length}`,
          `Total value exposed: ${formatCurrency(delayedShipmentValue)}`,
          `Average delay: ${delayedShipmentAvgDelay.toFixed(1)} days`,
          "",
          "Recommended focus:",
          "- Review highest-value delayed shipments first.",
          "- Escalate lanes with repeat delays and large revenue exposure.",
          "- Share this dump with logistics and customer operations teams."
        ].join("\n"),
        prompt: [
          "You are a supply chain analyst.",
          `Review this delayed shipment dump for the ${commonContext.filters.window.toLowerCase()}.`,
          "Summarize the top delay patterns, highest-risk lanes, largest revenue exposures, and the 5 actions the team should take today."
        ].join(" "),
        filePrefix: "delayed-shipments"
      },
      supplier_risk: {
        ...commonContext,
        title: TEMPLATE_CONFIG.supplier_risk.title,
        description: TEMPLATE_CONFIG.supplier_risk.description,
        rows: filteredSuppliers,
        columns: [
          { key: "supplier_id", label: "Supplier ID" },
          { key: "name", label: "Supplier" },
          { key: "country", label: "Country" },
          { key: "category", label: "Category" },
          { key: "risk_score", label: "Risk Score" },
          {
            key: "on_time_delivery_rate",
            label: "On-Time Delivery",
            render: (row) => formatPercent(row.on_time_delivery_rate),
            exportValue: (row) => row.on_time_delivery_rate
          },
          { key: "esg_score", label: "ESG" },
          {
            key: "active",
            label: "Status",
            render: (row) => <Badge label={row.active ? "Active" : "Inactive"} variant={row.active ? "success" : "info"} />,
            exportValue: (row) => (row.active ? "Active" : "Inactive")
          }
        ],
        metrics: [
          buildMetric("Suppliers in scope", formatNumber(filteredSuppliers.length)),
          buildMetric("Avg risk", supplierAverageRisk.toFixed(1)),
          buildMetric("Critical suppliers", formatNumber(filteredSuppliers.filter((supplier) => supplier.risk_score >= 80).length))
        ],
        briefing: [
          "# Supplier Risk Register",
          "",
          `Generated: ${formatDateTime(new Date())}`,
          `Minimum supplier risk: ${commonContext.filters.minimumRisk}`,
          `Supplier mode: ${commonContext.filters.supplierMode}`,
          "",
          `Suppliers in scope: ${filteredSuppliers.length}`,
          `Average risk score: ${supplierAverageRisk.toFixed(1)}`,
          `Critical suppliers (80+): ${filteredSuppliers.filter((supplier) => supplier.risk_score >= 80).length}`,
          "",
          "Recommended focus:",
          "- Prioritize alternate capacity for the highest-risk categories.",
          "- Review suppliers with high risk and weak on-time delivery together.",
          "- Use this register in weekly supplier review meetings."
        ].join("\n"),
        prompt: [
          "You are supporting a procurement risk review.",
          `Analyze this supplier register for suppliers at ${minimumRisk}+ risk score.`,
          "Highlight the suppliers that need executive escalation, alternate sourcing, SLA review, or ESG follow-up."
        ].join(" "),
        filePrefix: "supplier-risk-register"
      },
      disruption_log: {
        ...commonContext,
        title: TEMPLATE_CONFIG.disruption_log.title,
        description: TEMPLATE_CONFIG.disruption_log.description,
        rows: filteredDisruptions,
        columns: [
          {
            key: "type",
            label: "Disruption",
            render: (row) => statusLabel(row.type),
            exportValue: (row) => statusLabel(row.type)
          },
          {
            key: "severity",
            label: "Severity",
            render: (row) => <Badge label={statusLabel(row.severity)} variant={row.severity} />,
            exportValue: (row) => statusLabel(row.severity)
          },
          {
            key: "detected_at",
            label: "Detected",
            render: (row) => formatDateTime(row.detected_at),
            exportValue: (row) => formatDateTime(row.detected_at)
          },
          {
            key: "estimated_resolution",
            label: "Resolution ETA",
            render: (row) => formatDate(row.estimated_resolution),
            exportValue: (row) => formatDate(row.estimated_resolution)
          },
          {
            key: "affected_supplier_ids",
            label: "Suppliers",
            render: (row) => row.affected_supplier_ids.length,
            exportValue: (row) => row.affected_supplier_ids.length
          },
          {
            key: "affected_shipment_ids",
            label: "Shipments",
            render: (row) => row.affected_shipment_ids.length,
            exportValue: (row) => row.affected_shipment_ids.length
          },
          {
            key: "estimated_revenue_impact_usd",
            label: "Revenue Impact",
            render: (row) => formatCurrency(row.estimated_revenue_impact_usd || 0),
            exportValue: (row) => row.estimated_revenue_impact_usd || 0
          }
        ],
        metrics: [
          buildMetric("Disruptions", formatNumber(filteredDisruptions.length)),
          buildMetric("Revenue impact", formatCurrency(disruptionRevenueImpact)),
          buildMetric("Critical events", formatNumber(filteredDisruptions.filter((disruption) => disruption.severity === "critical").length))
        ],
        briefing: [
          "# Disruption Impact Log",
          "",
          `Generated: ${formatDateTime(new Date())}`,
          `Window: ${commonContext.filters.window}`,
          `Severity threshold: ${commonContext.filters.severity}`,
          "",
          `Disruptions in scope: ${filteredDisruptions.length}`,
          `Total estimated revenue impact: ${formatCurrency(disruptionRevenueImpact)}`,
          `Critical events: ${filteredDisruptions.filter((disruption) => disruption.severity === "critical").length}`,
          "",
          "Recommended focus:",
          "- Review the highest revenue disruptions with cross-functional owners.",
          "- Compare resolution ETA against customer commitments and shipment value.",
          "- Use this log in daily incident or war-room reviews."
        ].join("\n"),
        prompt: [
          "You are preparing an executive disruption briefing.",
          `Summarize the disruptions in the ${commonContext.filters.window.toLowerCase()} at ${commonContext.filters.severity.toLowerCase()}.`,
          "Focus on revenue impact, affected suppliers and shipments, and the actions that should happen in the next 24 hours."
        ].join(" "),
        filePrefix: "disruption-impact-log"
      },
      network_snapshot: {
        ...commonContext,
        title: TEMPLATE_CONFIG.network_snapshot.title,
        description: TEMPLATE_CONFIG.network_snapshot.description,
        rows: snapshotRows,
        columns: [
          { key: "record_type", label: "Record Type" },
          { key: "record_id", label: "Record ID" },
          { key: "state", label: "Status / Score" },
          { key: "owner", label: "Entity" },
          { key: "focus", label: "Route / Category" },
          {
            key: "date",
            label: "Date",
            render: (row) => (row.date ? formatDateTime(row.date) : "--"),
            exportValue: (row) => (row.date ? formatDateTime(row.date) : "")
          },
          { key: "detail", label: "Notes" }
        ],
        metrics: [
          buildMetric("Snapshot rows", formatNumber(snapshotRows.length)),
          buildMetric("Orders included", formatNumber(filteredOrders.length)),
          buildMetric("Shipments included", formatNumber(filteredShipments.length))
        ],
        briefing: [
          "# Full Network Snapshot",
          "",
          `Generated: ${formatDateTime(new Date())}`,
          `Window: ${commonContext.filters.window}`,
          `Shipment scope: ${commonContext.filters.shipmentStatus}`,
          `Severity threshold: ${commonContext.filters.severity}`,
          `Minimum supplier risk: ${commonContext.filters.minimumRisk}`,
          "",
          `Orders included: ${filteredOrders.length}`,
          `Shipments included: ${filteredShipments.length}`,
          `Suppliers included: ${filteredSuppliers.length}`,
          `Disruptions included: ${filteredDisruptions.length}`,
          "",
          "Recommended use:",
          "- Share with leadership for one-page operational context.",
          "- Use as a filtered export for offline review or spreadsheet work.",
          "- Combine with the other focused templates when deeper follow-up is needed."
        ].join("\n"),
        prompt: [
          "You are reviewing a full supply chain snapshot export.",
          "Create a concise leadership summary covering the biggest operational risks, delayed shipments, risky suppliers, and active disruptions.",
          "End with the top 3 decisions leadership should make this week."
        ].join(" "),
        filePrefix: "network-snapshot"
      }
    }

    return models[templateKey]
  }, [activeOnly, data, minimumRisk, severityThreshold, shipmentStatus, templateKey, windowDays])

  function applyTemplate(nextTemplateKey) {
    setTemplateKey(nextTemplateKey)

    if (nextTemplateKey === "delayed_shipments") {
      setWindowDays("30")
      setShipmentStatus("delayed")
    }

    if (nextTemplateKey === "supplier_risk") {
      setMinimumRisk("65")
      setActiveOnly(true)
    }

    if (nextTemplateKey === "disruption_log") {
      setWindowDays("30")
      setSeverityThreshold("high")
    }

    if (nextTemplateKey === "network_snapshot") {
      setWindowDays("30")
      setShipmentStatus("all")
      setSeverityThreshold("medium")
    }
  }

  function handleDownloadCsv() {
    if (!reportModel) return
    const csv = buildCsv(reportModel.columns, reportModel.rows)
    downloadBlob(`${reportModel.filePrefix}.csv`, csv, "text/csv;charset=utf-8;")
  }

  function handleDownloadBrief() {
    if (!reportModel) return
    downloadBlob(`${reportModel.filePrefix}-brief.md`, reportModel.briefing, "text/markdown;charset=utf-8;")
  }

  function handleDownloadPrompt() {
    if (!reportModel) return
    downloadBlob(`${reportModel.filePrefix}-prompt.txt`, reportModel.prompt, "text/plain;charset=utf-8;")
  }

  function handleDownloadJson() {
    if (!reportModel) return
    const payload = {
      generated_at: new Date().toISOString(),
      report: reportModel.title,
      filters: reportModel.filters,
      row_count: reportModel.rows.length,
      data: reportModel.filteredData
    }
    downloadBlob(`${reportModel.filePrefix}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8;")
  }

  if (error) {
    return (
      <EmptyState
        icon={FileText}
        title="Reports unavailable"
        description={error}
        action={
          <button type="button" onClick={refetch} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        }
      />
    )
  }

  if (loading || !reportModel) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <div className="rounded-lg border bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Report Builder</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Useful reports your team can actually use</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Pick a practical report template, apply filters, preview the results, and download the data or a written brief with one click.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {reportModel.rows.length} rows in preview
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Object.entries(TEMPLATE_CONFIG).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyTemplate(key)}
                className={clsx(
                  "rounded-2xl border p-4 text-left transition",
                  templateKey === key ? "border-slate-900 shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx("rounded-xl border px-3 py-3", template.tone)}>
                    <template.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{template.title}</p>
                      {templateKey === key ? <span className={clsx("h-2.5 w-2.5 rounded-full", template.accent)} /> : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{template.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">One-click outputs</h2>
              <p className="text-sm text-slate-500">Download data, a short brief, or an AI-ready prompt from the same filtered report.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              <FileDown className="h-4 w-4" />
              Download CSV
            </button>
            <button
              type="button"
              onClick={handleDownloadBrief}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" />
              Download Brief
            </button>
            <button
              type="button"
              onClick={handleDownloadPrompt}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Sparkles className="h-4 w-4" />
              Download Prompt
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Database className="h-4 w-4" />
              Download Filtered JSON
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{reportModel.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{reportModel.description}</p>
          </div>
        </aside>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <h2 className="text-base font-semibold text-slate-900">Filters</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Window</span>
            <select
              value={windowDays}
              onChange={(event) => setWindowDays(event.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All dates</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Shipment status</span>
            <select
              value={shipmentStatus}
              onChange={(event) => setShipmentStatus(event.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="all">Delayed + At Risk set</option>
              <option value="delayed">Delayed only</option>
              <option value="at_risk">At risk only</option>
              <option value="in_transit">In transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Severity</span>
            <select
              value={severityThreshold}
              onChange={(event) => setSeverityThreshold(event.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="all">All severities</option>
              <option value="medium">Medium and above</option>
              <option value="high">High and above</option>
              <option value="critical">Critical only</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Min supplier risk</span>
            <select
              value={minimumRisk}
              onChange={(event) => setMinimumRisk(event.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="40">40+</option>
              <option value="65">65+</option>
              <option value="80">80+</option>
            </select>
          </label>

          <label className="flex items-end">
            <span className="flex w-full items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
              <input type="checkbox" checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} />
              Active suppliers only
            </span>
          </label>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,360px]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {reportModel.metrics.map((metric) => (
              <SummaryStat key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>

          <DataTable
            columns={reportModel.columns}
            data={reportModel.rows}
            loading={loading}
            emptyTitle="No records match these filters"
            emptyMessage="Try widening the date window, lowering the risk threshold, or changing the template."
            searchPlaceholder={`Search ${reportModel.title.toLowerCase()}...`}
          />
        </div>

        <aside className="rounded-lg border bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-slate-900">Report Brief</h2>
          <p className="mt-2 text-sm text-slate-500">This is the written summary that will be downloaded when you use the brief action.</p>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-slate-900 p-1.5 text-white">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <p className="font-semibold text-slate-900">{reportModel.title}</p>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {reportModel.briefing.split("\n").map((line, index) =>
                line ? (
                  <p key={`${line}-${index}`} className={line.startsWith("#") ? "font-semibold text-slate-900" : ""}>
                    {line.replace(/^#\s*/, "")}
                  </p>
                ) : (
                  <div key={`spacer-${index}`} className="h-1" />
                )
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Prompt preview</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{reportModel.prompt}</p>
          </div>
        </aside>
      </section>
    </div>
  )
}
