import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import L from "leaflet"
import { Circle, MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet"
import clsx from "clsx"
import { AlertTriangle, Anchor, Building2, Layers3, RefreshCw, Ship, Truck } from "lucide-react"
import EmptyState from "../components/ui/EmptyState"
import Spinner from "../components/ui/Spinner"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import { formatCurrency, formatDate, formatRelativeTime, formatPercent, statusLabel } from "../utils/formatters"

const routeColors = {
  in_transit: "#3b82f6",
  delayed: "#ef4444",
  delivered: "#10b981",
  at_risk: "#f59e0b"
}

const disruptionColors = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#3b82f6",
  low: "#10b981"
}

function getRiskColor(score) {
  if (score > 75) return "#ef4444"
  if (score > 50) return "#f59e0b"
  if (score > 30) return "#eab308"
  return "#10b981"
}

function createSupplierIcon(score) {
  const color = getRiskColor(score)
  const symbol = score > 75 ? "!" : score > 50 ? "~" : "OK"

  return L.divIcon({
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 3px ${color}40;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
        cursor: pointer;
        position: relative;
      ">
        ${symbol}
      </div>
    `,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  })
}

function createDisruptionIcon(severity, type) {
  const color = disruptionColors[severity] || disruptionColors.medium
  const icons = {
    weather: "WX",
    strike: "ST",
    port_congestion: "PT",
    geopolitical: "GP",
    customs: "CU"
  }

  return L.divIcon({
    html: `
      <div style="
        background: white;
        border: 2px solid ${color};
        border-radius: 8px;
        padding: 4px 6px;
        font-size: 12px;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        white-space: nowrap;
        cursor: pointer;
      ">
        ${icons[type] || "AL"}
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20]
  })
}

function getFilteredSuppliers(filter, suppliers) {
  if (filter === "at_risk") return suppliers.filter((supplier) => supplier.risk_score > 65)
  if (filter === "critical") return suppliers.filter((supplier) => supplier.risk_score > 80)
  return suppliers
}

function MapBridge({ onReady }) {
  const map = useMap()

  useEffect(() => {
    onReady(map)
  }, [map, onReady])

  return null
}

function SupplierPopup({ supplier, navigate }) {
  const riskColor = getRiskColor(supplier.risk_score)

  return (
    <div style={{ fontFamily: "Inter, sans-serif", padding: "4px" }}>
      <div
        style={{
          background: `${riskColor}15`,
          borderLeft: `4px solid ${riskColor}`,
          padding: "8px 12px",
          marginBottom: "10px",
          borderRadius: "4px"
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>{supplier.name}</div>
        <div style={{ fontSize: "12px", color: "#64748b" }}>{supplier.country}</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "10px"
        }}
      >
        <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "6px" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>RISK SCORE</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: riskColor }}>{Math.round(supplier.risk_score)}</div>
        </div>
        <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "6px" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>ON-TIME</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: supplier.on_time_delivery_rate > 0.9 ? "#10b981" : "#f59e0b" }}>
            {formatPercent(supplier.on_time_delivery_rate)}
          </div>
        </div>
        <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "6px" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>CATEGORY</div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>{supplier.category}</div>
        </div>
        <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "6px" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>ESG SCORE</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#10b981" }}>{supplier.esg_score}</div>
        </div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${supplier.risk_score}%`,
              background: riskColor,
              borderRadius: "3px",
              transition: "width 0.5s ease"
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px" }}>
        <button
          type="button"
          style={{
            flex: 1,
            padding: "6px",
            background: "#1e40af",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer"
          }}
          onClick={() =>
            navigate("/suppliers", {
              state: {
                affectedSupplierIds: [supplier.supplier_id],
                disruptionLabel: supplier.name
              }
            })
          }
        >
          View Details
        </button>
        <button
          type="button"
          style={{
            flex: 1,
            padding: "6px",
            background: "#f8fafc",
            color: "#475569",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer"
          }}
          onClick={() =>
            navigate("/chat", {
              state: {
                prompt: `Find an alternate supplier for ${supplier.name} in ${supplier.country}.`
              }
            })
          }
        >
          Find Alternate
        </button>
      </div>
    </div>
  )
}

function CurvedRoute({ shipment, onSelect, layerRef }) {
  const color = routeColors[shipment.status] || routeColors.in_transit
  const midpoint = [
    (shipment.origin_coordinates.lat + shipment.destination_coordinates.lat) / 2
      + (shipment.origin_coordinates.lat > shipment.destination_coordinates.lat ? 6 : -6),
    (shipment.origin_coordinates.lng + shipment.destination_coordinates.lng) / 2
      + (shipment.origin_coordinates.lng > shipment.destination_coordinates.lng ? -10 : 10)
  ]

  return (
    <Polyline
      ref={layerRef}
      positions={[
        [shipment.origin_coordinates.lat, shipment.origin_coordinates.lng],
        midpoint,
        [shipment.destination_coordinates.lat, shipment.destination_coordinates.lng]
      ]}
      pathOptions={{
        color,
        weight: shipment.status === "delayed" ? 3 : 2,
        opacity: 0.82,
        dashArray: shipment.status === "delivered" ? null : "8,6"
      }}
      eventHandlers={{
        click: () => onSelect(shipment)
      }}
    >
      <Popup maxWidth={220}>
        <div style={{ fontFamily: "Inter, sans-serif", padding: "4px" }}>
          <div style={{ fontWeight: 700, marginBottom: "6px" }}>{shipment.shipment_id}</div>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
            {shipment.origin} -&gt; {shipment.destination}
          </div>
          <div
            style={{
              display: "inline-block",
              background: `${color}20`,
              color,
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 600,
              marginBottom: "8px",
              textTransform: "uppercase"
            }}
          >
            {shipment.status.replace("_", " ")}
          </div>
          <div style={{ fontSize: "12px", color: "#475569" }}>Value: {formatCurrency(shipment.value_usd)}</div>
          <div style={{ fontSize: "12px", color: "#475569" }}>ETA: {formatDate(shipment.eta)}</div>
          {shipment.delay_days > 0 ? (
            <div style={{ fontSize: "12px", color: "#ef4444", fontWeight: 600, marginTop: "4px" }}>
              Delayed by {shipment.delay_days} days
            </div>
          ) : null}
        </div>
      </Popup>
    </Polyline>
  )
}

function DisruptionZone({ disruption, onSelect, layerRef }) {
  const color = disruptionColors[disruption.severity] || disruptionColors.medium
  const radius = {
    critical: 120000,
    high: 80000,
    medium: 50000,
    low: 30000
  }[disruption.severity] || 50000

  return (
    <>
      <Circle
        center={[disruption.coordinates.lat, disruption.coordinates.lng]}
        radius={radius * 1.5}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.05,
          weight: 1,
          dashArray: "5,5"
        }}
      />
      <Circle
        ref={layerRef}
        center={[disruption.coordinates.lat, disruption.coordinates.lng]}
        radius={radius}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 2
        }}
        eventHandlers={{
          click: () => onSelect(disruption)
        }}
      >
        <Popup maxWidth={280}>
          <div style={{ fontFamily: "Inter, sans-serif", padding: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span
                style={{
                  background: `${color}20`,
                  color,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase"
                }}
              >
                {disruption.severity}
              </span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>{disruption.type.replace("_", " ")}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", marginBottom: "6px" }}>
              {statusLabel(disruption.type)} Disruption
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", lineHeight: "1.5" }}>
              {disruption.description}
            </div>
            <div style={{ background: "#fef2f2", padding: "8px", borderRadius: "6px", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", color: "#991b1b", fontWeight: 600 }}>
                Revenue Impact: {formatCurrency(disruption.estimated_revenue_impact_usd)}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                {disruption.affected_shipment_ids.length} shipments affected
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Resolution: {formatDate(disruption.estimated_resolution)}
              </div>
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Detected {formatRelativeTime(disruption.detected_at)}</div>
          </div>
        </Popup>
      </Circle>
      <Marker
        position={[disruption.coordinates.lat, disruption.coordinates.lng]}
        icon={createDisruptionIcon(disruption.severity, disruption.type)}
      />
    </>
  )
}

function StatPill({ icon: Icon, label, value, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    red: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700"
  }

  return (
    <div className={`rounded-2xl border border-slate-200 px-3 py-3 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-xs font-medium">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  )
}

function DisruptionCard({ disruption, isSelected, onClick }) {
  const severityColor = disruptionColors[disruption.severity] || disruptionColors.medium

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full rounded-lg border-l-4 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md",
        isSelected ? "ring-2 ring-blue-200" : ""
      )}
      style={{ borderLeftColor: severityColor }}
    >
      <div className="mb-1 flex items-start justify-between">
        <span className="text-xs font-bold uppercase" style={{ color: severityColor }}>
          {disruption.severity}
        </span>
        <span className="text-xs text-slate-400">{formatRelativeTime(disruption.detected_at)}</span>
      </div>
      <div className="mb-1 text-sm font-semibold text-slate-800">{statusLabel(disruption.type)} Disruption</div>
      <div className="mb-2 line-clamp-2 text-xs text-slate-500">{disruption.description}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{formatCurrency(disruption.estimated_revenue_impact_usd)}</span>
        <span className="text-slate-400">{formatDate(disruption.estimated_resolution)}</span>
      </div>
      <div className="mt-1 text-xs text-slate-400">{disruption.affected_shipment_ids.length} shipments affected</div>
    </button>
  )
}

function ShipmentRow({ shipment, onClick }) {
  const statusTone = {
    in_transit: "bg-blue-50 text-blue-700",
    delayed: "bg-rose-50 text-rose-700",
    delivered: "bg-emerald-50 text-emerald-700",
    at_risk: "bg-amber-50 text-amber-700"
  }[shipment.status] || "bg-slate-100 text-slate-600"

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <span>{shipment.shipment_id}</span>
          <span className="text-slate-400">|</span>
          <span className="truncate text-slate-600">
            {shipment.origin} -&gt; {shipment.destination}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusTone}`}>
            {shipment.status.replace("_", " ")}
          </span>
          <span className="text-xs text-slate-500">{formatCurrency(shipment.value_usd)}</span>
        </div>
      </div>
      <span className="text-slate-300">-&gt;</span>
    </button>
  )
}

export default function SupplyChainMap() {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const supplierRefs = useRef({})
  const routeRefs = useRef({})
  const disruptionRefs = useRef({})
  const [selectedDisruptionId, setSelectedDisruptionId] = useState(null)
  const [filter, setFilter] = useState("all")
  const [layers, setLayers] = useState({
    suppliers: true,
    routes: true,
    disruptions: true
  })

  const { data, loading, error, refetch } = useApi(async () => api.getMapData(), [])

  const model = useMemo(() => {
    const suppliers = data?.suppliers || []
    const shipments = data?.shipments || []
    const disruptions = data?.disruptions || []

    return {
      suppliers,
      disruptions,
      shipments,
      filteredSuppliers: getFilteredSuppliers(filter, suppliers),
      delayedCount: shipments.filter((shipment) => shipment.status === "delayed").length
    }
  }, [data, filter])

  function setMapInstance(map) {
    mapRef.current = map
  }

  function flyToLocation(lat, lng, zoom = 8) {
    if (!mapRef.current) return
    mapRef.current.flyTo([lat, lng], zoom, {
      duration: 1.5,
      easeLinearity: 0.25
    })
  }

  function focusSupplier(supplier) {
    flyToLocation(supplier.coordinates.lat, supplier.coordinates.lng, 6)
    supplierRefs.current[supplier.supplier_id]?.openPopup?.()
  }

  function focusRoute(shipment) {
    flyToLocation(shipment.origin_coordinates.lat, shipment.origin_coordinates.lng, 5)
    routeRefs.current[shipment.shipment_id]?.openPopup?.()
  }

  function focusDisruption(disruption) {
    setSelectedDisruptionId(disruption.disruption_id)
    flyToLocation(disruption.coordinates.lat, disruption.coordinates.lng, 7)
    disruptionRefs.current[disruption.disruption_id]?.openPopup?.()
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Supply chain map unavailable"
        description={error}
        action={
          <button
            type="button"
            onClick={refetch}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        }
      />
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-card">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div
      className="flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div className="flex w-80 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <div className="grid grid-cols-2 gap-2">
            <StatPill icon={Building2} label="Suppliers" value={model.suppliers.length} tone="blue" />
            <StatPill icon={AlertTriangle} label="Disruptions" value={model.disruptions.length} tone="red" />
            <StatPill icon={Ship} label="Shipments" value={model.shipments.length} tone="blue" />
            <StatPill icon={Truck} label="Delayed" value={model.delayedCount} tone="amber" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
          {[
            ["all", "All"],
            ["at_risk", "At Risk"],
            ["critical", "Critical"]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                filter === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Active Disruptions
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                {model.disruptions.length}
              </span>
            </h3>
          </div>

          <div className="space-y-2 p-3">
            {model.disruptions.map((disruption) => (
              <DisruptionCard
                key={disruption.disruption_id}
                disruption={disruption}
                isSelected={selectedDisruptionId === disruption.disruption_id}
                onClick={() => focusDisruption(disruption)}
              />
            ))}
          </div>

          <div className="border-y border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">Active Shipments</h3>
          </div>

          <div className="space-y-1 p-3">
            {model.shipments.map((shipment) => (
              <ShipmentRow key={shipment.shipment_id} shipment={shipment} onClick={() => focusRoute(shipment)} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <Layers3 className="h-4 w-4" />
            Toggle layers:
          </span>

          {[
            { key: "suppliers", label: "Suppliers", icon: Building2, count: model.filteredSuppliers.length },
            { key: "routes", label: "Routes", icon: Anchor, count: model.shipments.length },
            { key: "disruptions", label: "Disruptions", icon: AlertTriangle, count: model.disruptions.length }
          ].map((layer) => (
            <button
              key={layer.key}
              type="button"
              onClick={() => setLayers((prev) => ({ ...prev, [layer.key]: !prev[layer.key] }))}
              className={clsx(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                layers[layer.key] ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600"
              )}
            >
              <layer.icon className="h-4 w-4" />
              {layer.label} ({layer.count})
            </button>
          ))}

          <button
            type="button"
            onClick={() => mapRef.current?.setView([25, 30], 3)}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reset view
          </button>
        </div>

        <div className="flex flex-wrap items-start gap-6 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold uppercase tracking-[0.18em] text-slate-500">Supplier Risk</span>
            {[
              { color: "#10b981", label: "Low" },
              { color: "#eab308", label: "Medium" },
              { color: "#f59e0b", label: "High" },
              { color: "#ef4444", label: "Critical" }
            ].map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold uppercase tracking-[0.18em] text-slate-500">Route Status</span>
            {[
              { color: routeColors.in_transit, label: "In Transit" },
              { color: routeColors.delayed, label: "Delayed" },
              { color: routeColors.delivered, label: "Delivered" },
              { color: routeColors.at_risk, label: "At Risk" }
            ].map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <span className="h-0.5 w-5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold uppercase tracking-[0.18em] text-slate-500">Disruption Codes</span>
            {[
              ["ST", "Strike"],
              ["WX", "Weather"],
              ["PT", "Port Congestion"],
              ["GP", "Geopolitical"],
              ["CU", "Customs"]
            ].map(([code, label]) => (
              <span key={code} className="inline-flex items-center gap-2">
                <span className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 font-semibold text-slate-700">
                  {code}
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="map-container flex-1">
          <MapContainer center={[25, 30]} zoom={3} className="h-full w-full">
            <MapBridge onReady={setMapInstance} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
              subdomains="abcd"
              maxZoom={19}
            />

            {layers.suppliers &&
              model.filteredSuppliers.map((supplier) => (
                <Marker
                  key={supplier.supplier_id}
                  ref={(node) => {
                    if (node) supplierRefs.current[supplier.supplier_id] = node
                    else delete supplierRefs.current[supplier.supplier_id]
                  }}
                  position={[supplier.coordinates.lat, supplier.coordinates.lng]}
                  icon={createSupplierIcon(supplier.risk_score)}
                  eventHandlers={{
                    click: () => focusSupplier(supplier)
                  }}
                >
                  <Popup maxWidth={280} className="supplier-popup">
                    <SupplierPopup supplier={supplier} navigate={navigate} />
                  </Popup>
                </Marker>
              ))}

            {layers.routes &&
              model.shipments.map((shipment) => (
                <CurvedRoute
                  key={shipment.shipment_id}
                  shipment={shipment}
                  onSelect={focusRoute}
                  layerRef={(node) => {
                    if (node) routeRefs.current[shipment.shipment_id] = node
                    else delete routeRefs.current[shipment.shipment_id]
                  }}
                />
              ))}

            {layers.disruptions &&
              model.disruptions.map((disruption) => (
                <DisruptionZone
                  key={disruption.disruption_id}
                  disruption={disruption}
                  onSelect={focusDisruption}
                  layerRef={(node) => {
                    if (node) disruptionRefs.current[disruption.disruption_id] = node
                    else delete disruptionRefs.current[disruption.disruption_id]
                  }}
                />
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
