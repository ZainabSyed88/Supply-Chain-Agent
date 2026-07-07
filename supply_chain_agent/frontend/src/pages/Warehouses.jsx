import { useMemo, useState } from "react"
import { AlertTriangle, Building2, Truck, Users } from "lucide-react"
import DataTable from "../components/shared/DataTable"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import KPICard from "../components/ui/KPICard"
import Modal from "../components/ui/Modal"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"

const healthVariant = {
  stable: "success",
  tight: "high",
  critical: "critical"
}

export default function Warehouses() {
  const [healthFilter, setHealthFilter] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)

  const { data, loading, error, refetch } = useApi(
    async () => {
      const [warehouses, summary, orders] = await Promise.all([
        api.getWarehouses(),
        api.getWarehouseSummary(),
        api.getOrders()
      ])
      return { warehouses, summary, orders }
    },
    []
  )

  const model = useMemo(() => {
    if (!data) return null
    const warehouseOrders = new Map()
    data.orders.forEach((order) => {
      const count = warehouseOrders.get(order.warehouse_id) || 0
      warehouseOrders.set(order.warehouse_id, count + 1)
    })
    const enriched = data.warehouses.map((warehouse) => ({
      ...warehouse,
      openOrders: warehouseOrders.get(warehouse.warehouse_id) || 0,
      staffingGap: Math.max(0, warehouse.staff_required - warehouse.staff_scheduled)
    }))
    return {
      warehouses: healthFilter ? enriched.filter((warehouse) => warehouse.storage_health === healthFilter) : enriched,
      summary: data.summary
    }
  }, [data, healthFilter])

  if (error) {
    return (
      <EmptyState
        icon={Building2}
        title="Warehouses page unavailable"
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
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const columns = [
    { key: "name", label: "Warehouse" },
    { key: "region", label: "Region" },
    {
      key: "utilization_rate",
      label: "Utilization",
      render: (warehouse) => `${Math.round(warehouse.utilization_rate * 100)}%`
    },
    {
      key: "staffingGap",
      label: "Staff Gap"
    },
    {
      key: "pending_shipments",
      label: "Pending Shipments"
    },
    {
      key: "openOrders",
      label: "Open Orders"
    },
    {
      key: "storage_health",
      label: "Health",
      render: (warehouse) => <Badge label={warehouse.storage_health} variant={healthVariant[warehouse.storage_health]} />
    }
  ]

  const summaryCards = [
    {
      title: "Sites",
      value: model.summary.total_warehouses,
      subtitle: "Warehouses active in the network",
      icon: Building2,
      color: "bg-sky-100 text-sky-700",
      cardClassName: "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-white",
      valueClassName: "text-sky-950"
    },
    {
      title: "Critical",
      value: model.summary.critical_warehouses,
      subtitle: "Facilities needing immediate attention",
      icon: AlertTriangle,
      color: "bg-rose-100 text-rose-700",
      cardClassName: "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-white",
      valueClassName: "text-rose-950"
    },
    {
      title: "Staff Gap",
      value: model.summary.staffing_gap,
      subtitle: "Total unscheduled staffing demand",
      icon: Users,
      color: "bg-amber-100 text-amber-700",
      cardClassName: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white",
      valueClassName: "text-amber-950"
    },
    {
      title: "Picking",
      value: `${Math.round(model.summary.average_picking_efficiency * 100)}%`,
      subtitle: "Average picking efficiency across sites",
      icon: Truck,
      color: "bg-emerald-100 text-emerald-700",
      cardClassName: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white",
      valueClassName: "text-emerald-950"
    }
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {summaryCards.map((card) => (
          <KPICard key={card.title} {...card} />
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-teal-50/60 p-5 shadow-card">
        <select
          value={healthFilter}
          onChange={(event) => setHealthFilter(event.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
        >
          <option value="">All health states</option>
          <option value="critical">Critical</option>
          <option value="tight">Tight</option>
          <option value="stable">Stable</option>
        </select>
      </section>

      <DataTable
        columns={columns}
        data={model.warehouses}
        loading={loading}
        emptyTitle="No warehouses match this filter"
        emptyMessage="Try another operations health view."
        searchPlaceholder="Search warehouse, region, country..."
        onRowClick={(warehouse) => setSelectedWarehouse(warehouse)}
      />

      <Modal open={Boolean(selectedWarehouse)} onClose={() => setSelectedWarehouse(null)} title={selectedWarehouse?.name || "Warehouse details"}>
        {selectedWarehouse ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-slate-900">Capacity</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {Math.round(selectedWarehouse.utilization_rate * 100)}% utilized across {selectedWarehouse.dock_capacity} docks.
                </p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-slate-900">Staffing</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {selectedWarehouse.staff_scheduled} scheduled against {selectedWarehouse.staff_required} required.
                </p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-slate-900">Flow</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {selectedWarehouse.pending_shipments} pending shipments, {selectedWarehouse.throughput_today} units throughput today.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-white p-5">
              <div className="flex flex-wrap gap-2">
                <Badge label={selectedWarehouse.storage_health} variant={healthVariant[selectedWarehouse.storage_health]} />
                <Badge label={`Picking ${Math.round(selectedWarehouse.picking_efficiency * 100)}%`} variant="info" />
                <Badge label={`${selectedWarehouse.openOrders} open orders`} variant="medium" />
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
