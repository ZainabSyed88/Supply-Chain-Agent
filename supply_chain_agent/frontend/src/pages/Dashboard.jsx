import {
  AlertTriangle,
  Building2,
  DollarSign,
  Gauge,
  PackageSearch,
  Truck,
  Zap
} from "lucide-react"
import { useMemo } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import AlertsFeed from "../components/shared/AlertsFeed"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import KPICard from "../components/ui/KPICard"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  formatPercent,
  riskLevel,
  statusLabel
} from "../utils/formatters"

const chartColors = {
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#10b981",
  amber: "#f59e0b"
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { alerts: liveAlerts = [] } = useOutletContext()
  const { data, loading, error, refetch } = useApi(
    async () => {
      const [kpis, demand, inventory, suppliers, shipments, disruptions] = await Promise.all([
        api.getKPIs(),
        api.getDemandForecast(),
        api.getInventory(),
        api.getSuppliers(),
        api.getShipments(),
        api.getDisruptions()
      ])
      return { kpis, demand, inventory, suppliers, shipments, disruptions }
    },
    []
  )

  const model = useMemo(() => {
    if (!data) return null

    const shipmentsByStatus = ["in_transit", "delayed", "delivered", "at_risk"].map((status) => ({
      name: statusLabel(status),
      value: data.shipments.filter((shipment) => shipment.status === status).length,
      color:
        status === "in_transit"
          ? chartColors.blue
          : status === "delayed"
            ? chartColors.red
            : status === "delivered"
              ? chartColors.green
              : chartColors.amber
    }))

    const topSuppliers = [...data.suppliers]
      .sort((left, right) => right.risk_score - left.risk_score)
      .slice(0, 5)
      .map((supplier) => ({
        ...supplier,
        disruptionCount: data.disruptions.filter((disruption) => disruption.affected_supplier_ids.includes(supplier.supplier_id)).length
      }))

    const seededAlerts = data.disruptions.slice(0, 4).map((disruption) => ({
      id: disruption.disruption_id,
      title: `${statusLabel(disruption.type)} disruption`,
      severity: disruption.severity,
      message: disruption.description,
      timestamp: disruption.detected_at
    }))

    const demandSeries = data.demand.map((entry) => ({
      month: entry.month,
      historical: entry.forecast ? null : entry.demand,
      forecast: entry.forecast ? entry.demand : null
    }))

    return {
      shipmentsByStatus,
      topSuppliers,
      alerts: [...liveAlerts, ...seededAlerts]
        .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
        .slice(0, 6),
      demandSeries
    }
  }, [data, liveAlerts])

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

  if (loading || !data || !model) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const shipmentTotal = data.shipments.length
  const atRiskSuppliers = data.suppliers.filter((supplier) => supplier.risk_score >= 65)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KPICard title="Total Suppliers" value={formatNumber(data.kpis.total_suppliers)} subtitle="Global partner network" icon={Building2} color="bg-blue-50 text-primary" />
        <KPICard title="At-Risk Suppliers" value={formatNumber(atRiskSuppliers.length)} subtitle="Needs mitigation" icon={AlertTriangle} color="bg-red-50 text-red-700" />
        <KPICard title="Active Disruptions" value={formatNumber(data.kpis.active_disruptions)} subtitle="Open incidents" icon={Zap} color="bg-amber-50 text-amber-700" />
        <KPICard title="Shipments Delayed" value={formatNumber(data.kpis.delayed_shipments)} subtitle={`${formatRelativeTime(new Date())}`} icon={Truck} color="bg-red-50 text-red-700" />
        <KPICard title="Revenue at Risk" value={formatCurrency(data.kpis.total_shipment_value_usd)} subtitle="Protected by visibility" icon={DollarSign} color="bg-red-50 text-red-700" />
        <KPICard title="Avg Risk Score" value={data.kpis.average_supplier_risk} subtitle="Across supplier portfolio" icon={Gauge} color="bg-blue-50 text-primary" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <div className="rounded-lg border bg-white p-5 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Inventory versus reorder point</h2>
              <p className="text-sm text-slate-500">Focus on SKUs closest to replenishment thresholds.</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.inventory.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="sku_id" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock_level" name="Current Stock" radius={[6, 6, 0, 0]}>
                  {data.inventory.slice(0, 10).map((item) => (
                    <Cell key={item.sku_id} fill={item.stock_level < item.threshold ? chartColors.red : chartColors.blue} />
                  ))}
                </Bar>
                <Bar dataKey="threshold" name="Reorder Point" fill="#fda4af" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-slate-900">Shipment Status</h2>
          <p className="text-sm text-slate-500">Real-time distribution across active fulfillment lanes.</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={model.shipmentsByStatus} dataKey="value" nameKey="name" innerRadius={75} outerRadius={105} paddingAngle={3}>
                  {model.shipmentsByStatus.map((segment) => (
                    <Cell key={segment.name} fill={segment.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="-mt-24 text-center">
            <p className="text-3xl font-semibold text-slate-900">{shipmentTotal}</p>
            <p className="text-sm text-slate-500">Total shipments</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <div className="rounded-lg border bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Top at-risk suppliers</h2>
              <p className="text-sm text-slate-500">Prioritize intervention for the highest exposure vendors.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Supplier", "Country", "Risk Score", "Status", "Action"].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {model.topSuppliers.map((supplier) => (
                  <tr key={supplier.supplier_id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{supplier.name}</p>
                      <p className="text-xs text-slate-500">{supplier.supplier_id}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{supplier.country}</td>
                    <td className="px-4 py-4">
                      <Badge label={supplier.risk_score.toFixed(1)} variant={riskLevel(supplier.risk_score)} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {supplier.disruptionCount} disruption(s)
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => navigate("/suppliers")}
                        className="text-sm font-semibold text-primary hover:text-primary-dark"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent alerts</h2>
              <p className="text-sm text-slate-500">Auto-updating signals across disruptions and pipelines.</p>
            </div>
          </div>
          <AlertsFeed
            alerts={model.alerts}
            onAskAi={(alert) =>
              navigate("/chat", {
                state: { prompt: `Summarize the operational impact of this alert: ${alert.title}. ${alert.message || ""}` }
              })
            }
          />
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Demand forecast</h2>
            <p className="text-sm text-slate-500">Historical demand versus forward-looking signal for the next three months.</p>
          </div>
          <p className="text-xs text-slate-400">Hover for absolute month labels</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={model.demandSeries}>
              <defs>
                <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatNumber(value)}
                labelFormatter={(label) => label}
              />
              <Area dataKey="forecast" fill="url(#forecastFill)" stroke="none" />
              <Line type="monotone" dataKey="historical" stroke={chartColors.blue} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="forecast" stroke={chartColors.blue} strokeWidth={3} strokeDasharray="6 6" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
