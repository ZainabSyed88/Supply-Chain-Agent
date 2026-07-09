import { useMemo, useState } from "react"
import { AlertTriangle, PackageCheck, ShoppingCart, Truck } from "lucide-react"
import DataTable from "../components/shared/DataTable"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import KPICard from "../components/ui/KPICard"
import Modal from "../components/ui/Modal"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import { formatDate, formatNumber, riskLevel, statusLabel } from "../utils/formatters"

const priorityVariant = {
  low: "info",
  medium: "medium",
  high: "high",
  critical: "critical"
}

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { data, loading, error, refetch } = useApi(
    async () => {
      const [orders, summary, shipments, warehouses] = await Promise.all([
        api.getOrders(),
        api.getOrderSummary(),
        api.getShipments(),
        api.getWarehouses()
      ])
      return { orders, summary, shipments, warehouses }
    },
    []
  )

  const model = useMemo(() => {
    if (!data) return null
    const shipmentMap = new Map(data.shipments.map((shipment) => [shipment.shipment_id, shipment]))
    const warehouseMap = new Map(data.warehouses.map((warehouse) => [warehouse.warehouse_id, warehouse]))
    const enriched = data.orders.map((order) => ({
      ...order,
      shipmentStatus: order.shipment_id ? shipmentMap.get(order.shipment_id)?.status || "unassigned" : "unassigned",
      warehouseName: warehouseMap.get(order.warehouse_id)?.name || order.warehouse_id
    }))
    const filtered = enriched.filter((order) => {
      const statusMatch = statusFilter ? order.status === statusFilter : true
      const priorityMatch = priorityFilter ? order.priority === priorityFilter : true
      return statusMatch && priorityMatch
    })
    return { orders: filtered, summary: data.summary }
  }, [data, priorityFilter, statusFilter])

  if (error) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Orders page unavailable"
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
    { key: "order_id", label: "Order ID" },
    { key: "sku_id", label: "SKU" },
    { key: "customer_name", label: "Customer" },
    { key: "warehouseName", label: "Warehouse" },
    {
      key: "status",
      label: "Status",
      render: (order) => <Badge label={statusLabel(order.status)} variant={order.status === "delayed" ? "critical" : "info"} />
    },
    {
      key: "priority",
      label: "Priority",
      render: (order) => <Badge label={statusLabel(order.priority)} variant={priorityVariant[order.priority]} />
    },
    { key: "quantity", label: "Qty" },
    {
      key: "fulfillment_risk",
      label: "Risk",
      render: (order) => <Badge label={order.fulfillment_risk.toFixed(1)} variant={riskLevel(order.fulfillment_risk)} />
    },
    {
      key: "promised_date",
      label: "Promised",
      render: (order) => formatDate(order.promised_date)
    }
  ]

  const summaryCards = [
    {
      title: "Backlog",
      value: model.summary.backlog_orders,
      subtitle: "Open orders awaiting completion",
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-700",
      cardClassName: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white",
      valueClassName: "text-blue-950"
    },
    {
      title: "Delayed",
      value: model.summary.delayed_orders,
      subtitle: "Orders impacted by execution delays",
      icon: Truck,
      color: "bg-amber-100 text-amber-700",
      cardClassName: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white",
      valueClassName: "text-amber-950"
    },
    {
      title: "Critical",
      value: model.summary.critical_orders,
      subtitle: "High-risk commitments to review first",
      icon: AlertTriangle,
      color: "bg-rose-100 text-rose-700",
      cardClassName: "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-white",
      valueClassName: "text-rose-950"
    },
    {
      title: "Fill Rate",
      value: `${Math.round(model.summary.average_fill_rate * 100)}%`,
      subtitle: "Current fulfillment performance",
      icon: PackageCheck,
      color: "bg-emerald-100 text-emerald-700",
      cardClassName: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white",
      valueClassName: "text-emerald-950"
    }
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.title}>
            <KPICard {...card} />
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-blue-50/60 p-5 shadow-card">
        <div className="flex flex-wrap gap-3">
          <label className="min-w-[12rem] rounded-2xl border border-sky-200 bg-[linear-gradient(135deg,rgba(224,242,254,0.85),rgba(255,255,255,0.98))] px-3 py-2 shadow-sm">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">Status Filter</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="allocated">Allocated</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delayed">Delayed</option>
            </select>
          </label>
          <label className="min-w-[12rem] rounded-2xl border border-violet-200 bg-[linear-gradient(135deg,rgba(243,232,255,0.88),rgba(255,255,255,0.98))] px-3 py-2 shadow-sm">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">Priority Filter</span>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">All priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>
      </section>

      <DataTable
        columns={columns}
        data={model.orders}
        loading={loading}
        emptyTitle="No orders match these filters"
        emptyMessage="Try a different status or priority filter."
        searchPlaceholder="Search orders, customers, SKUs..."
        onRowClick={(order) => setSelectedOrder(order)}
      />

      <Modal open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} title={selectedOrder?.order_id || "Order details"}>
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-slate-900">Fulfillment</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {formatNumber(selectedOrder.inventory_available)} units available for an order of {formatNumber(selectedOrder.quantity)}.
                </p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-slate-900">Shipment status</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">{statusLabel(selectedOrder.shipmentStatus)}</p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-slate-900">Commitment</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">Promised by {formatDate(selectedOrder.promised_date)} to {selectedOrder.destination_region}.</p>
              </div>
            </div>
            <div className="rounded-lg border bg-white p-5">
              <div className="flex flex-wrap gap-2">
                <Badge label={statusLabel(selectedOrder.status)} variant={selectedOrder.status === "delayed" ? "critical" : "info"} />
                <Badge label={`Priority ${statusLabel(selectedOrder.priority)}`} variant={priorityVariant[selectedOrder.priority]} />
                <Badge label={`Risk ${selectedOrder.fulfillment_risk.toFixed(1)}`} variant={riskLevel(selectedOrder.fulfillment_risk)} />
              </div>
              <dl className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Customer</dt>
                  <dd className="mt-1 text-sm text-slate-700">{selectedOrder.customer_name}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Warehouse</dt>
                  <dd className="mt-1 text-sm text-slate-700">{selectedOrder.warehouseName}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Shipment</dt>
                  <dd className="mt-1 text-sm text-slate-700">{selectedOrder.shipment_id || "Not yet assigned"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Created</dt>
                  <dd className="mt-1 text-sm text-slate-700">{formatDate(selectedOrder.created_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
