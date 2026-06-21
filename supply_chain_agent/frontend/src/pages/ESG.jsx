import { Car, Leaf, Star, Trees } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import DataTable from "../components/shared/DataTable"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import KPICard from "../components/ui/KPICard"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import { formatCurrency, formatNumber } from "../utils/formatters"

const pieColors = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981"]

export default function ESG() {
  const { data, loading, error, refetch } = useApi(() => api.getCarbon(), [])

  if (error) {
    return (
      <EmptyState
        icon={Leaf}
        title="ESG dashboard unavailable"
        description={error}
        action={
          <button type="button" onClick={refetch} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        }
      />
    )
  }

  const leaderboardColumns = [
    {
      key: "rank",
      label: "Rank",
      render: (row) => <span>{row.rank <= 3 ? ["🥇", "🥈", "🥉"][row.rank - 1] : row.rank}</span>
    },
    { key: "name", label: "Supplier" },
    { key: "country", label: "Country" },
    { key: "esg_score", label: "ESG Score" },
    {
      key: "grade",
      label: "Grade",
      render: (row) => <Badge label={row.grade} variant={row.grade === "A" ? "success" : row.grade === "B" ? "low" : row.grade === "C" ? "medium" : "critical"} />
    },
    { key: "co2_impact", label: "CO2 Impact", render: (row) => `${formatNumber(row.co2_impact)} kg` }
  ]

  const recommendationsColumns = [
    { key: "shipment_id", label: "Shipment" },
    { key: "recommendation", label: "Recommendation" },
    { key: "estimated_co2_savings", label: "CO2 Savings", render: (row) => `${formatNumber(row.estimated_co2_savings)} kg` },
    { key: "estimated_cost_savings", label: "Cost Savings", render: (row) => formatCurrency(row.estimated_cost_savings) }
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total CO2" value={loading ? "--" : `${formatNumber(data.kpis.total_co2)} t`} subtitle="Fleet-wide emissions" icon={Leaf} color="bg-emerald-50 text-emerald-700" loading={loading} />
        <KPICard title="Car Equivalents" value={loading ? "--" : formatNumber(data.kpis.car_equivalents)} subtitle="Annualized impact" icon={Car} color="bg-blue-50 text-primary" loading={loading} />
        <KPICard title="Trees to Offset" value={loading ? "--" : formatNumber(data.kpis.trees_to_offset)} subtitle="Estimated offsets" icon={Trees} color="bg-emerald-50 text-emerald-700" loading={loading} />
        <KPICard title="Avg ESG Score" value={loading ? "--" : data.kpis.average_esg_score} subtitle="Supplier performance" icon={Star} color="bg-amber-50 text-amber-700" loading={loading} />
      </section>

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-lg border bg-white p-5 shadow-card">
              <h2 className="text-lg font-semibold text-slate-900">CO2 by Transport Mode</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.by_mode} dataKey="value" nameKey="mode" innerRadius={70} outerRadius={108}>
                      {data.by_mode.map((entry, index) => (
                        <Cell key={entry.mode} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg border bg-white p-5 shadow-card">
              <h2 className="text-lg font-semibold text-slate-900">Monthly CO2 Trend</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthly}>
                    <defs>
                      <linearGradient id="co2Fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="co2" stroke="#10b981" fill="url(#co2Fill)" strokeWidth={3} />
                    <Area type="monotone" dataKey="target" stroke="#1e40af" fill="none" strokeDasharray="6 6" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <DataTable
            columns={leaderboardColumns}
            data={data.leaderboard.map((item, index) => ({ ...item, rank: index + 1 }))}
            loading={false}
            emptyTitle="No supplier ESG data"
            emptyMessage="Supplier sustainability metrics will appear here when available."
            searchPlaceholder="Search ESG leaderboard..."
          />

          <DataTable
            columns={recommendationsColumns}
            data={data.recommendations}
            loading={false}
            emptyTitle="No optimization suggestions"
            emptyMessage="High-emission shipment recommendations will appear here when applicable."
            searchPlaceholder="Search route suggestions..."
          />
        </>
      )}
    </div>
  )
}
