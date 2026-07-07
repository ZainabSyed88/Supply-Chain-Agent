import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CircleDot, MapPinned, Package, Truck } from "lucide-react"
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet"
import { useLocation, useNavigate } from "react-router-dom"
import DataTable from "../components/shared/DataTable"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import KPICard from "../components/ui/KPICard"
import Modal from "../components/ui/Modal"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import { formatCurrency, formatDate, getShipmentDelayDays, statusLabel } from "../utils/formatters"

const countryCoordinates = {
  China: [35.8617, 104.1954],
  India: [20.5937, 78.9629],
  Germany: [51.1657, 10.4515],
  Netherlands: [52.1326, 5.2913],
  "United States": [37.0902, -95.7129],
  Mexico: [23.6345, -102.5528],
  Vietnam: [14.0583, 108.2772],
  Poland: [51.9194, 19.1451],
  Japan: [36.2048, 138.2529],
  "South Korea": [35.9078, 127.7669],
  France: [46.2276, 2.2137],
  Canada: [56.1304, -106.3468]
}

export default function Shipments() {
  const location = useLocation()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [analysis, setAnalysis] = useState("")
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const shipmentIds = location.state?.shipmentIds || []
  const shipmentContextLabel = location.state?.contextLabel || ""

  const { data, loading, error, refetch } = useApi(
    async () => {
      const [shipments, suppliers, disruptions] = await Promise.all([
        api.getShipments(),
        api.getSuppliers(),
        api.getDisruptions()
      ])
      return { shipments, suppliers, disruptions }
    },
    []
  )

  useEffect(() => {
    const nextFilter = location.state?.statusFilter || ""
    setStatusFilter(nextFilter)
  }, [location.state])

  useEffect(() => {
    if (!selectedShipment) return
    let cancelled = false
    const loadAnalysis = async () => {
      try {
        setAnalysisLoading(true)
        const response = await api.chat(
          `Assess the risk of shipment ${selectedShipment.shipment_id} from ${selectedShipment.origin} to ${selectedShipment.destination}, status ${selectedShipment.status}, delay ${getShipmentDelayDays(selectedShipment)}.`
        )
        if (!cancelled) setAnalysis(response.response)
      } catch {
        if (!cancelled) {
          setAnalysis(
            `${selectedShipment.shipment_id} is ${
              selectedShipment.status === "delayed" || selectedShipment.status === "at_risk" ? "experiencing elevated execution risk" : "currently stable"
            }. Monitor carrier updates closely and prepare a lane contingency if delay extends beyond ${Math.max(2, getShipmentDelayDays(selectedShipment) + 1)} days.`
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
  }, [selectedShipment])

  const model = useMemo(() => {
    if (!data) return null
    const supplierMap = new Map(data.suppliers.map((supplier) => [supplier.supplier_id, supplier]))
    const shipments = data.shipments.map((shipment) => ({
      ...shipment,
      supplierName: supplierMap.get(shipment.supplier_id)?.name || shipment.supplier_id
    }))
    const scopedShipments = shipmentIds.length
      ? shipments.filter((shipment) => shipmentIds.includes(shipment.shipment_id))
      : shipments
    return {
      shipments: statusFilter ? scopedShipments.filter((shipment) => shipment.status === statusFilter) : scopedShipments,
      stats: {
        total: scopedShipments.length,
        in_transit: scopedShipments.filter((shipment) => shipment.status === "in_transit").length,
        delayed: scopedShipments.filter((shipment) => shipment.status === "delayed").length,
        delivered: scopedShipments.filter((shipment) => shipment.status === "delivered").length,
        at_risk: scopedShipments.filter((shipment) => shipment.status === "at_risk").length
      },
      disruptions: data.disruptions
    }
  }, [data, shipmentIds, statusFilter])

  if (error) {
    return (
      <EmptyState
        icon={Truck}
        title="Shipments page unavailable"
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
    { key: "shipment_id", label: "Shipment ID" },
    { key: "supplierName", label: "Supplier" },
    {
      key: "route",
      label: "Route",
      render: (shipment) => `${shipment.origin} → ${shipment.destination}`
    },
    { key: "carrier", label: "Carrier" },
    {
      key: "status",
      label: "Status",
      render: (shipment) => <Badge label={statusLabel(shipment.status)} variant={shipment.status} />
    },
    {
      key: "value_usd",
      label: "Value",
      render: (shipment) => formatCurrency(shipment.value_usd)
    },
    {
      key: "eta",
      label: "ETA",
      render: (shipment) => <span className={new Date(shipment.eta) < new Date() ? "text-red-600" : ""}>{formatDate(shipment.eta)}</span>
    },
    {
      key: "delay_days",
      label: "Delay",
      render: (shipment) => {
        const delayDays = getShipmentDelayDays(shipment)
        return (
          <span className={delayDays > 0 ? "text-red-600" : "text-emerald-600"}>
            {delayDays > 0 ? `+${delayDays} days` : "On Time"}
          </span>
        )
      }
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: () => <span className="text-sm font-semibold text-primary">Track</span>
    }
  ]

  const timeline = selectedShipment
    ? [
        { label: "Created", date: new Date(new Date(selectedShipment.eta).getTime() - 1000 * 60 * 60 * 24 * 14) },
        { label: "Dispatched", date: new Date(new Date(selectedShipment.eta).getTime() - 1000 * 60 * 60 * 24 * 10) },
        { label: "In Transit", date: new Date(new Date(selectedShipment.eta).getTime() - 1000 * 60 * 60 * 24 * 5) },
        { label: "Delivered", date: selectedShipment.actual_delivery ? new Date(selectedShipment.actual_delivery) : new Date(selectedShipment.eta) }
      ]
    : []

  const impactingDisruptions =
    model?.disruptions.filter((disruption) => disruption.affected_shipment_ids.includes(selectedShipment?.shipment_id)) || []

  const summaryCards = [
    {
      title: "Total",
      value: model?.stats.total ?? 0,
      subtitle: "Tracked shipments in current scope",
      icon: Package,
      color: "bg-sky-100 text-sky-700",
      cardClassName: "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-white",
      valueClassName: "text-sky-950"
    },
    {
      title: "In Transit",
      value: model?.stats.in_transit ?? 0,
      subtitle: "Loads currently moving across lanes",
      icon: Truck,
      color: "bg-blue-100 text-blue-700",
      cardClassName: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white",
      valueClassName: "text-blue-950"
    },
    {
      title: "Delayed",
      value: model?.stats.delayed ?? 0,
      subtitle: "Shipments requiring escalation",
      icon: AlertTriangle,
      color: "bg-rose-100 text-rose-700",
      cardClassName: "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-white",
      valueClassName: "text-rose-950"
    },
    {
      title: "Delivered",
      value: model?.stats.delivered ?? 0,
      subtitle: "Completed deliveries in this view",
      icon: CircleDot,
      color: "bg-emerald-100 text-emerald-700",
      cardClassName: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white",
      valueClassName: "text-emerald-950"
    },
    {
      title: "At Risk",
      value: model?.stats.at_risk ?? 0,
      subtitle: "Shipments with elevated disruption exposure",
      icon: MapPinned,
      color: "bg-amber-100 text-amber-700",
      cardClassName: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white",
      valueClassName: "text-amber-950"
    }
  ]

  const filterStyles = {
    "": "bg-blue-600 text-white shadow-sm shadow-blue-200",
    in_transit: "bg-blue-600 text-white shadow-sm shadow-blue-200",
    delayed: "bg-rose-600 text-white shadow-sm shadow-rose-200",
    delivered: "bg-emerald-600 text-white shadow-sm shadow-emerald-200",
    at_risk: "bg-amber-500 text-white shadow-sm shadow-amber-200"
  }

  return (
    <div className="space-y-6">
      {shipmentIds.length || shipmentContextLabel ? (
        <section className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">Showing dashboard drilldown</p>
            <p>
              {shipmentContextLabel || "Filtered shipment view"}.
              {shipmentIds.length ? ` ${shipmentIds.length} shipment${shipmentIds.length > 1 ? "s" : ""} in scope.` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/shipments", { replace: true })}
            className="inline-flex cursor-pointer rounded-md border bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear filter
          </button>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-5">
        {model
          ? summaryCards.map((card) => <KPICard key={card.title} {...card} />)
          : Array.from({ length: 5 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-lg border bg-white" />)}
      </section>

      <section className="rounded-lg border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-blue-50/60 p-5 shadow-card">
        <div className="flex flex-wrap gap-2">
          {[
            ["", "All"],
            ["in_transit", "In Transit"],
            ["delayed", "Delayed"],
            ["delivered", "Delivered"],
            ["at_risk", "At Risk"]
          ].map(([value, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                statusFilter === value ? filterStyles[value] : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <DataTable
        columns={columns}
        data={model?.shipments || []}
        loading={loading}
        emptyTitle="No shipments match this status"
        emptyMessage="Try switching to a different status filter."
        searchPlaceholder="Search by shipment ID or supplier..."
        onRowClick={(shipment) => setSelectedShipment(shipment)}
      />

      <Modal open={Boolean(selectedShipment)} onClose={() => setSelectedShipment(null)} title={selectedShipment?.shipment_id || "Shipment Details"}>
        {selectedShipment ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="h-72 overflow-hidden rounded-lg border">
                <MapContainer
                  center={countryCoordinates[selectedShipment.origin] || [20, 0]}
                  zoom={2}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <CircleMarker center={countryCoordinates[selectedShipment.origin] || [20, 0]} radius={7} pathOptions={{ color: "#1e40af", fillColor: "#1e40af", fillOpacity: 1 }}>
                    <Popup>{selectedShipment.origin}</Popup>
                  </CircleMarker>
                  <CircleMarker center={countryCoordinates[selectedShipment.destination] || [37, -95]} radius={7} pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 1 }}>
                    <Popup>{selectedShipment.destination}</Popup>
                  </CircleMarker>
                  <Polyline
                    positions={[
                      countryCoordinates[selectedShipment.origin] || [20, 0],
                      countryCoordinates[selectedShipment.destination] || [37, -95]
                    ]}
                    pathOptions={{ color: "#1e40af", dashArray: "10 10" }}
                  />
                </MapContainer>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-slate-900">Timeline</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {timeline.map((entry) => (
                      <div key={entry.label} className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">{entry.label}</p>
                        <p className="text-sm font-medium text-slate-900">{entry.date.toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-slate-900">AI Risk Analysis</p>
                  </div>
                  {analysisLoading ? <Spinner /> : <p className="text-sm leading-7 text-slate-600">{analysis}</p>}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-slate-900">Disruptions affecting this shipment</h3>
              </div>
              {impactingDisruptions.length ? (
                <div className="space-y-3">
                  {impactingDisruptions.map((disruption) => (
                    <div key={disruption.disruption_id} className="rounded-lg border bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900">{statusLabel(disruption.type)}</p>
                        <Badge label={statusLabel(disruption.severity)} variant={disruption.severity} />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{disruption.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Package} title="No linked disruptions" description="No active disruptions currently reference this shipment." />
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
