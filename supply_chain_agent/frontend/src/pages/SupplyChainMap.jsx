import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Circle, CircleMarker, MapContainer, Popup, Polyline, TileLayer } from "react-leaflet"
import { Layers3, RotateCcw } from "lucide-react"
import clsx from "clsx"
import EmptyState from "../components/ui/EmptyState"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import { MAP_COLORS } from "../utils/constants"
import { formatCurrency, formatDate, formatPercent, riskLevel, statusLabel } from "../utils/formatters"

export default function SupplyChainMap() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")
  const [mapInstance, setMapInstance] = useState(null)
  const [layers, setLayers] = useState({
    suppliers: true,
    routes: true,
    disruptions: true
  })
  const { data, loading, error, refetch } = useApi(() => api.getMapData(), [])

  const filtered = useMemo(() => {
    if (!data) return null
    const disruptionSupplierIds = new Set(data.disruptions.flatMap((item) => item.affected_supplier_ids))
    const delayedSupplierIds = new Set(
      data.shipments.filter((shipment) => shipment.status === "delayed").map((shipment) => shipment.supplier_id)
    )

    const suppliers = data.suppliers.filter((supplier) => {
      if (filter === "all") return true
      if (filter === "at_risk") return supplier.risk_score > 65
      if (filter === "disrupted") return disruptionSupplierIds.has(supplier.supplier_id)
      if (filter === "delayed") return delayedSupplierIds.has(supplier.supplier_id)
      return true
    })

    return {
      ...data,
      suppliers,
      disruptions: data.disruptions.slice(0, 10)
    }
  }, [data, filter])

  if (error) {
    return (
      <EmptyState
        title="Map data unavailable"
        description={error}
        action={
          <button type="button" onClick={refetch} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        }
      />
    )
  }

  if (loading || !filtered) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[300px,1fr]">
      <aside className="rounded-lg border bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-slate-900">Supply Chain Overview</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["at_risk", "At Risk"],
            ["disrupted", "Disrupted"],
            ["delayed", "Delayed"]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={clsx(
                "rounded-full px-3 py-1.5 text-sm font-medium transition",
                filter === value ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Suppliers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{filtered.suppliers.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Disruptions</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{filtered.disruptions.length}</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Disruption List</h3>
          <div className="mt-3 max-h-[440px] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
            {filtered.disruptions.map((disruption) => (
              <div key={disruption.disruption_id} className="rounded-lg border bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        disruption.severity === "critical"
                          ? MAP_COLORS.critical
                          : disruption.severity === "high"
                            ? MAP_COLORS.high
                            : disruption.severity === "medium"
                              ? MAP_COLORS.medium
                              : MAP_COLORS.low
                    }}
                  />
                  <p className="text-sm font-semibold text-slate-900">{statusLabel(disruption.type)}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{disruption.affected_supplier_ids.length} suppliers affected</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="overflow-hidden rounded-lg border bg-white shadow-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Layers3 className="h-4 w-4" />
            Toggle layers
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(layers).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setLayers((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  layers[key] ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {statusLabel(key)}
              </button>
            ))}
          </div>
        </div>
        <div className="relative h-[calc(100vh-14rem)]">
          <MapContainer center={[25, 15]} zoom={2} scrollWheelZoom className="h-full w-full" whenCreated={setMapInstance}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {layers.suppliers &&
              filtered.suppliers.map((supplier) => {
                const level = riskLevel(supplier.risk_score)
                return (
                  <CircleMarker
                    key={supplier.supplier_id}
                    center={[supplier.coordinates.lat, supplier.coordinates.lng]}
                    radius={8}
                    pathOptions={{ color: MAP_COLORS[level], fillColor: MAP_COLORS[level], fillOpacity: 0.9 }}
                  >
                    <Popup>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold">{supplier.name}</p>
                        <p>{supplier.country}</p>
                        <p>{supplier.category}</p>
                        <p>Risk score: {supplier.risk_score}</p>
                        <p>On-time delivery: {formatPercent(supplier.on_time_delivery_rate)}</p>
                        <button
                          type="button"
                          onClick={() => navigate("/suppliers")}
                          className="rounded-md bg-primary px-3 py-2 text-white"
                        >
                          View Supplier
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}

            {layers.routes &&
              filtered.shipments.map((shipment) => (
                <Polyline
                  key={shipment.shipment_id}
                  positions={[
                    [shipment.origin_coordinates.lat, shipment.origin_coordinates.lng],
                    [shipment.destination_coordinates.lat, shipment.destination_coordinates.lng]
                  ]}
                  pathOptions={{
                    color:
                      shipment.status === "in_transit"
                        ? "#3b82f6"
                        : shipment.status === "delayed"
                          ? "#ef4444"
                          : shipment.status === "delivered"
                            ? "#10b981"
                            : "#f59e0b",
                    dashArray: "10 10",
                    weight: 3
                  }}
                >
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{shipment.shipment_id}</p>
                      <p>Status: {statusLabel(shipment.status)}</p>
                      <p>Value: {formatCurrency(shipment.value_usd)}</p>
                      <p>ETA: {formatDate(shipment.eta)}</p>
                      <p>Carrier: {shipment.carrier}</p>
                    </div>
                  </Popup>
                </Polyline>
              ))}

            {layers.disruptions &&
              filtered.disruptions.map((disruption) => (
                <Circle
                  key={disruption.disruption_id}
                  center={[disruption.coordinates.lat, disruption.coordinates.lng]}
                  radius={
                    disruption.severity === "critical"
                      ? 50000
                      : disruption.severity === "high"
                        ? 30000
                        : disruption.severity === "medium"
                          ? 18000
                          : 12000
                  }
                  pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.18 }}
                >
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{statusLabel(disruption.type)}</p>
                      <p>Severity: {statusLabel(disruption.severity)}</p>
                      <p>Affected suppliers: {disruption.affected_supplier_ids.length}</p>
                      <p>Resolution: {formatDate(disruption.estimated_resolution)}</p>
                    </div>
                  </Popup>
                </Circle>
              ))}
          </MapContainer>

          <div className="pointer-events-none absolute left-4 top-4 right-4 flex items-start justify-between">
            <div className="pointer-events-auto">
              <button
                type="button"
                onClick={() => mapInstance?.setView([25, 15], 2)}
                className="rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-card"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <div className="pointer-events-auto rounded-lg border bg-white px-4 py-3 text-xs text-slate-600 shadow-card">
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Low Risk</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Medium</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> High</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Critical</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
