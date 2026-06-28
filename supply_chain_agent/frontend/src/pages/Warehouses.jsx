import { useMemo, useState } from "react"
import { Building2, Truck, Users } from "lucide-react"
import DataTable from "../components/shared/DataTable"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
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

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Sites", model.summary.total_warehouses],
          ["Critical", model.summary.critical_warehouses],
          ["Staff Gap", model.summary.staffing_gap],
          ["Picking", `${Math.round(model.summary.average_picking_efficiency * 100)}%`]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-white p-4 shadow-card">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-card">
        <select value={healthFilter} onChange={(event) => setHealthFilter(event.target.value)} className="rounded-md border px-3 py-2.5 text-sm">
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
