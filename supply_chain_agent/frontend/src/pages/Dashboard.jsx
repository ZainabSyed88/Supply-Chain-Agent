import {
  AlertTriangle,
  ArrowRight,
  Building2,
  DollarSign,
  Gauge,
  Truck,
  Zap
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import RiskGauge from "../components/RiskGauge"
import NewsFeed from "../components/shared/NewsFeed"
import EmptyState from "../components/ui/EmptyState"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getCountryFlag,
  riskColor
} from "../utils/formatters"
import { demandData, inventoryData, shipmentStatusData } from "../utils/mockData"

const chartColors = {
  blue: "#3b82f6",
  blueLight: "#93c5fd",
  red: "#ef4444",
  redLight: "#fca5a5",
  green: "#10b981",
  amber: "#f59e0b",
  slate: "#64748b"
}

const trendPillStyles = {
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-rose-50 text-rose-700",
  warning: "bg-amber-50 text-amber-700",
  info: "bg-blue-50 text-blue-700"
}

function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const safeTarget = Number.isFinite(target) ? target : 0
    const step = safeTarget / Math.max(1, duration / 16)
    const timer = window.setInterval(() => {
      start = Math.min(start + step, safeTarget)
      setCount(Math.round(start))
      if (start >= safeTarget) window.clearInterval(timer)
    }, 16)

    return () => window.clearInterval(timer)
  }, [duration, target])

  return count
}

function DashboardCard({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`chart-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function CompactKpiCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  helper,
  value,
  renderValue,
  trend,
  trendTone = "info",
  borderTone = "border-slate-200",
  onClick
}) {
  const count = useCountUp(value)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`kpi-card group flex h-full min-h-[118px] flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${borderTone} border-b-4`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className={`rounded-xl p-2 ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${trendPillStyles[trendTone]}`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{renderValue ? renderValue(count) : formatNumber(count)}</div>
      <div className="mt-0.5 text-xs text-slate-500">{label}</div>
      <div className="mt-auto pt-3 text-xs text-slate-400">{helper}</div>
    </button>
  )
}

function MiniRiskRow({ supplier }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{supplier.name}</p>
          <p className="text-xs text-slate-500">{supplier.country}</p>
        </div>
        <span className={`text-sm font-semibold ${riskColor(supplier.risk_score)}`}>{Math.round(supplier.risk_score)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{
            width: `${supplier.risk_score}%`,
            backgroundColor:
              supplier.risk_score > 80 ? chartColors.red : supplier.risk_score > 65 ? chartColors.amber : chartColors.green
          }}
        />
      </div>
    </div>
  )
}

function InventoryTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const stockValue = payload.find((entry) => entry.dataKey === "stock")?.value
  const reorderValue = payload.find((entry) => entry.dataKey === "reorder")?.value

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-slate-900">{label}</p>
      <p className="mt-1 text-slate-600">Current stock: {formatNumber(stockValue || 0)}</p>
      <p className="text-slate-600">Reorder point: {formatNumber(reorderValue || 0)}</p>
    </div>
  )
}

function ShipmentTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-slate-900">{entry.name}</p>
      <p className="mt-1 text-slate-600">{formatNumber(entry.value)} shipments</p>
    </div>
  )
}

function DemandTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-slate-900">{label}</p>
      {payload
        .filter((entry) => entry.value !== null && entry.value !== undefined)
        .map((entry) => (
          <p key={entry.dataKey} className="mt-1 text-slate-600">
            {entry.name}: {formatNumber(entry.value)}
          </p>
        ))}
    </div>
  )
}

function LoadingDashboard() {
  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.3s ease-out" }}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-[118px] rounded-2xl border border-slate-200" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="skeleton h-[360px] rounded-2xl xl:col-span-5" />
        <div className="skeleton h-[360px] rounded-2xl xl:col-span-4" />
        <div className="skeleton h-[360px] rounded-2xl xl:col-span-3" />
      </div>
      <div className="skeleton h-[280px] rounded-2xl" />
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="skeleton h-[420px] rounded-2xl xl:col-span-7" />
        <div className="skeleton h-[420px] rounded-2xl xl:col-span-5" />
      </div>
    </div>
  )
}

function supplierStatus(score) {
  if (score > 80) return "Critical"
  if (score > 65) return "At Risk"
  return "Monitor"
}

function supplierStatusClass(score) {
  if (score > 80) return "bg-rose-50 text-rose-700"
  if (score > 65) return "bg-amber-50 text-amber-700"
  return "bg-blue-50 text-blue-700"
}

export default function Dashboard() {
  const navigate = useNavigate()

  const { data, loading, error, refetch } = useApi(
    async () => {
      const [kpis, suppliers, shipments, disruptions, inventory, demand] = await Promise.all([
        api.getKPIs(),
        api.getSuppliers(),
        api.getShipments(),
        api.getDisruptions(),
        api.getInventory(),
        api.getDemandForecast()
      ])

      return { kpis, suppliers, shipments, disruptions, inventory, demand }
    },
    []
  )

  const model = useMemo(() => {
    if (!data) return null

    const suppliers = data.suppliers || []
    const shipments = data.shipments || []
    const disruptions = data.disruptions || []
    const inventory = data.inventory || []

    const atRiskSuppliers = suppliers.filter((supplier) => supplier.risk_score > 65)
    const criticalSuppliers = suppliers.filter((supplier) => supplier.risk_score > 80)
    const delayedShipments = shipments.filter((shipment) => shipment.status === "delayed")
    const atRiskShipments = shipments.filter((shipment) => shipment.status === "at_risk")
    const impactedShipments = shipments.filter((shipment) => ["delayed", "at_risk"].includes(shipment.status))
    const revenueAtRisk = impactedShipments.reduce((sum, shipment) => sum + shipment.value_usd, 0)
    const totalShipmentValue = shipments.reduce((sum, shipment) => sum + shipment.value_usd, 0)
    const avgDelayDays = delayedShipments.length
      ? delayedShipments.reduce((sum, shipment) => sum + shipment.delay_days, 0) / delayedShipments.length
      : 0
    const criticalDisruptions = disruptions.filter((item) => item.severity === "critical").length
    const avgRiskScore = Number(data.kpis?.average_supplier_risk || 0)

    const shipmentCounts = {
      in_transit: shipments.filter((shipment) => shipment.status === "in_transit").length,
      delayed: delayedShipments.length,
      delivered: shipments.filter((shipment) => shipment.status === "delivered").length,
      at_risk: atRiskShipments.length
    }

    const shipmentBreakdown = shipmentStatusData.map((entry) => ({
      ...entry,
      value: shipmentCounts[entry.status] ?? entry.value
    }))

    const inventoryChart = (inventory.length ? inventory.slice(0, 10).map((item) => ({
      sku: item.sku_id,
      stock: item.stock_level,
      reorder: item.threshold
    })) : inventoryData)
      .map((item) => ({
        ...item,
        below: item.stock < item.reorder
      }))

    const belowReorderCount = inventoryChart.filter((item) => item.below).length

    const demandSeries = Array.isArray(data.demand) && data.demand.length
      ? data.demand.map((entry) => ({
          date: entry.month,
          historical: entry.forecast ? null : entry.demand,
          forecast: entry.forecast ? entry.demand : null,
          isForecast: Boolean(entry.forecast)
        }))
      : demandData
    const forecastStart = demandSeries.find((entry) => entry.isForecast)?.date

    const topSuppliers = [...suppliers].sort((left, right) => right.risk_score - left.risk_score).slice(0, 5)
    const topRiskList = topSuppliers.slice(0, 3)

    return {
      suppliers,
      atRiskSuppliers,
      criticalSuppliers,
      delayedShipments,
      atRiskShipments,
      revenueAtRisk,
      totalShipmentValue,
      avgDelayDays,
      criticalDisruptions,
      avgRiskScore,
      shipmentBreakdown,
      shipmentTotal: shipmentBreakdown.reduce((sum, item) => sum + item.value, 0),
      inventoryChart,
      belowReorderCount,
      demandSeries,
      forecastStart,
      topSuppliers,
      topRiskList,
      totalSuppliers: Number(data.kpis?.total_suppliers || suppliers.length || 25),
      activeDisruptions: Number(data.kpis?.active_disruptions || disruptions.length || 0),
      delayedShipmentCount: Number(data.kpis?.delayed_shipments || delayedShipments.length || 0)
    }
  }, [data])

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Dashboard unavailable"
        description={error}
        action={
          <button type="button" onClick={refetch} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        }
      />
    )
  }

  if (loading || !model) {
    return <LoadingDashboard />
  }

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.3s ease-out" }}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <CompactKpiCard
          icon={Building2}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Global partners"
          helper="Supplier network"
          value={model.totalSuppliers}
          trend="↑ +2 this month"
          trendTone="success"
          borderTone="border-b-blue-500"
          onClick={() => navigate("/suppliers")}
        />
        <CompactKpiCard
          icon={AlertTriangle}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          label="Need attention"
          helper="High-risk vendors"
          value={model.atRiskSuppliers.length}
          trend={`${model.criticalSuppliers.length} critical`}
          trendTone={model.atRiskSuppliers.length > 0 ? "danger" : "success"}
          borderTone={model.atRiskSuppliers.length > 0 ? "border-b-rose-500" : "border-b-emerald-500"}
          onClick={() => navigate("/suppliers", { state: { riskFilter: "high" } })}
        />
        <CompactKpiCard
          icon={Zap}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Live incidents"
          helper="Open disruptions"
          value={model.activeDisruptions}
          trend={`${model.criticalDisruptions} critical`}
          trendTone={model.criticalDisruptions > 0 ? "danger" : "warning"}
          borderTone="border-b-amber-500"
          onClick={() => navigate("/war-room")}
        />
        <CompactKpiCard
          icon={Truck}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          label="Behind schedule"
          helper="Delay average"
          value={model.delayedShipmentCount}
          trend={`${model.avgDelayDays.toFixed(1)} day avg`}
          trendTone={model.delayedShipmentCount > 0 ? "warning" : "success"}
          borderTone="border-b-orange-500"
          onClick={() => navigate("/shipments", { state: { statusFilter: "delayed" } })}
        />
        <CompactKpiCard
          icon={DollarSign}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          label="Exposure"
          helper="Delayed + at-risk loads"
          value={model.revenueAtRisk}
          renderValue={(count) => formatCurrency(count)}
          trend={`${Math.round((model.revenueAtRisk / Math.max(model.totalShipmentValue, 1)) * 100)}% of total`}
          trendTone="danger"
          borderTone="border-b-rose-500"
          onClick={() => navigate("/shipments", { state: { statusFilter: "at_risk" } })}
        />
        <CompactKpiCard
          icon={Gauge}
          iconBg={model.avgRiskScore > 75 ? "bg-rose-50" : model.avgRiskScore > 50 ? "bg-amber-50" : "bg-emerald-50"}
          iconColor={model.avgRiskScore > 75 ? "text-rose-600" : model.avgRiskScore > 50 ? "text-amber-600" : "text-emerald-600"}
          label="Portfolio health"
          helper="Average supplier risk"
          value={Math.round(model.avgRiskScore)}
          trend={model.avgRiskScore > 75 ? "High risk" : model.avgRiskScore > 50 ? "Medium risk" : "Low risk"}
          trendTone={model.avgRiskScore > 75 ? "danger" : model.avgRiskScore > 50 ? "warning" : "success"}
          borderTone={model.avgRiskScore > 75 ? "border-b-rose-500" : model.avgRiskScore > 50 ? "border-b-amber-500" : "border-b-emerald-500"}
          onClick={() => navigate("/suppliers")}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashboardCard
          title="Inventory vs Reorder Points"
          subtitle="Stock levels across top SKUs"
          action={
            <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
              {model.belowReorderCount} SKUs below reorder point
            </div>
          }
          className="xl:col-span-5"
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={model.inventoryChart}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="sku" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip content={<InventoryTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
                <ReferenceLine y={50} stroke="#f43f5e" strokeDasharray="5 5" label={{ value: "Critical threshold", fill: "#f43f5e", position: "insideTopRight" }} />
                <Bar dataKey="stock" name="Current Stock" radius={[8, 8, 0, 0]} animationDuration={1000}>
                  {model.inventoryChart.map((item) => (
                    <Cell key={item.sku} fill={item.below ? chartColors.red : chartColors.blue} />
                  ))}
                </Bar>
                <Bar dataKey="reorder" name="Reorder Point" fill={chartColors.redLight} radius={[8, 8, 0, 0]} animationDuration={1000} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Shipment Status"
          subtitle={`${model.shipmentTotal} total shipments`}
          className="xl:col-span-4"
        >
          <div className="relative h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={model.shipmentBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={66}
                  outerRadius={102}
                  paddingAngle={3}
                  isAnimationActive
                  animationDuration={800}
                >
                  {model.shipmentBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ShipmentTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-x-0 top-[45%] -translate-y-1/2 text-center">
              <div className="text-4xl font-semibold text-slate-900">{model.shipmentTotal}</div>
              <div className="text-sm text-slate-500">Total</div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
            {model.shipmentBreakdown.map((entry) => (
              <button
                key={entry.name}
                type="button"
                onClick={() => navigate("/shipments", { state: { statusFilter: entry.status } })}
                className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 text-left transition hover:bg-slate-50"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600">{entry.name}</span>
                <span className="ml-auto font-semibold text-slate-900">{entry.value}</span>
              </button>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Portfolio Risk"
          subtitle="Average supplier exposure and the riskiest vendors to watch"
          className="xl:col-span-3"
        >
          <RiskGauge score={model.avgRiskScore || 65} />
          <div className="mt-5 space-y-3">
            {model.topRiskList.map((supplier) => (
              <MiniRiskRow key={supplier.supplier_id} supplier={supplier} />
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard
        title="Demand Forecast"
        subtitle="Historical demand + 30-day AI prediction"
        action={<span className="text-xs text-slate-400">Forecast updates every planning cycle</span>}
      >
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={model.demandSeries}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(value) => value.slice(5)} minTickGap={24} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip content={<DemandTooltip />} />
              <Legend verticalAlign="top" height={30} />
              {model.forecastStart ? (
                <>
                  <ReferenceArea x1={model.forecastStart} x2={model.demandSeries[model.demandSeries.length - 1]?.date} fill="#dbeafe" fillOpacity={0.45} />
                  <ReferenceLine
                    x={model.forecastStart}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{ value: "Forecast ->", fill: "#64748b", position: "insideTopLeft" }}
                  />
                </>
              ) : null}
              <Area
                type="monotone"
                dataKey="forecast"
                name="Predicted Demand"
                fill="#bfdbfe"
                fillOpacity={0.2}
                stroke="none"
                isAnimationActive
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey="historical"
                name="Historical Demand"
                fill="none"
                stroke={chartColors.blue}
                strokeWidth={3}
                isAnimationActive
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                name="Predicted Demand"
                fill="none"
                stroke={chartColors.blueLight}
                strokeWidth={3}
                strokeDasharray="6 6"
                isAnimationActive
                animationDuration={800}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashboardCard
          title="Top At-Risk Suppliers"
          subtitle="Prioritize intervention"
          action={
            <button
              type="button"
              onClick={() => navigate("/suppliers")}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary-dark"
            >
              View all suppliers
              <ArrowRight className="h-4 w-4" />
            </button>
          }
          className="xl:col-span-7"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[2.2fr,1fr,1.5fr,1fr,1fr,0.8fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Supplier</span>
              <span>Country</span>
              <span>Risk</span>
              <span>Delivery</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            <div className="divide-y divide-slate-100">
              {model.topSuppliers.map((supplier) => (
                <div
                  key={supplier.supplier_id}
                  className="grid grid-cols-[2.2fr,1fr,1.5fr,1fr,1fr,0.8fr] gap-3 px-4 py-4 text-sm transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {getCountryFlag(supplier.country)} {supplier.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">{supplier.supplier_id}</p>
                  </div>
                  <div className="text-slate-600">{supplier.country}</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 text-sm font-bold ${riskColor(supplier.risk_score)}`}>
                      {Math.round(supplier.risk_score)}
                    </div>
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-[width] duration-1000 ease-out"
                        style={{
                          width: `${supplier.risk_score}%`,
                          background:
                            supplier.risk_score > 80 ? chartColors.red : supplier.risk_score > 65 ? chartColors.amber : chartColors.green
                        }}
                      />
                    </div>
                  </div>
                  <div className={supplier.on_time_delivery_rate >= 0.85 ? "text-emerald-600" : "text-rose-600"}>
                    {formatPercent(supplier.on_time_delivery_rate)}
                  </div>
                  <div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${supplierStatusClass(supplier.risk_score)}`}>
                      {supplierStatus(supplier.risk_score)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/suppliers", {
                        state: {
                          affectedSupplierIds: [supplier.supplier_id],
                          disruptionLabel: supplier.name
                        }
                      })
                    }
                    className="font-medium text-primary transition hover:text-primary-dark"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>

        <div className="xl:col-span-5">
          <NewsFeed />
        </div>
      </div>
    </div>
  )
}
