import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import L from "leaflet"
import { Circle, MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet"
import clsx from "clsx"
import { AlertTriangle, Anchor, Building2, Layers3, RefreshCw, Ship, Truck } from "lucide-react"
import { formatCurrency } from "../utils/formatters"

const SUPPLIER_LOCATIONS = [
  { id: "SUP-001", name: "Shanghai Electronics Co", country: "China", city: "Shanghai", lat: 31.2304, lng: 121.4737, category: "Electronics", risk: 72, on_time: 0.78, esg: 65 },
  { id: "SUP-002", name: "Tokyo Precision Parts", country: "Japan", city: "Tokyo", lat: 35.6762, lng: 139.6503, category: "Electronics", risk: 28, on_time: 0.96, esg: 88 },
  { id: "SUP-003", name: "Mumbai Textiles Ltd", country: "India", city: "Mumbai", lat: 19.076, lng: 72.8777, category: "Raw Materials", risk: 55, on_time: 0.82, esg: 71 },
  { id: "SUP-004", name: "Seoul Components", country: "South Korea", city: "Seoul", lat: 37.5665, lng: 126.978, category: "Electronics", risk: 35, on_time: 0.93, esg: 82 },
  { id: "SUP-005", name: "Ho Chi Minh Manufacturing", country: "Vietnam", city: "Ho Chi Minh", lat: 10.8231, lng: 106.6297, category: "Finished Goods", risk: 68, on_time: 0.79, esg: 60 },
  { id: "SUP-006", name: "Bangkok Packaging Co", country: "Thailand", city: "Bangkok", lat: 13.7563, lng: 100.5018, category: "Packaging", risk: 42, on_time: 0.88, esg: 74 },
  { id: "SUP-007", name: "Dhaka Garments", country: "Bangladesh", city: "Dhaka", lat: 23.8103, lng: 90.4125, category: "Finished Goods", risk: 78, on_time: 0.71, esg: 52 },
  { id: "SUP-008", name: "Berlin Auto Parts GmbH", country: "Germany", city: "Berlin", lat: 52.52, lng: 13.405, category: "Raw Materials", risk: 22, on_time: 0.97, esg: 91 },
  { id: "SUP-009", name: "Rotterdam Logistics BV", country: "Netherlands", city: "Rotterdam", lat: 51.9244, lng: 4.4777, category: "Packaging", risk: 48, on_time: 0.86, esg: 79 },
  { id: "SUP-010", name: "Milan Fashion Supply", country: "Italy", city: "Milan", lat: 45.4642, lng: 9.19, category: "Finished Goods", risk: 31, on_time: 0.92, esg: 83 },
  { id: "SUP-011", name: "Warsaw Components", country: "Poland", city: "Warsaw", lat: 52.2297, lng: 21.0122, category: "Electronics", risk: 44, on_time: 0.87, esg: 76 },
  { id: "SUP-012", name: "New York Distributors", country: "USA", city: "New York", lat: 40.7128, lng: -74.006, category: "Finished Goods", risk: 18, on_time: 0.98, esg: 85 },
  { id: "SUP-013", name: "Mexico City Assembly", country: "Mexico", city: "Mexico City", lat: 19.4326, lng: -99.1332, category: "Electronics", risk: 61, on_time: 0.8, esg: 63 },
  { id: "SUP-014", name: "Sao Paulo Raw Materials", country: "Brazil", city: "Sao Paulo", lat: -23.5505, lng: -46.6333, category: "Raw Materials", risk: 53, on_time: 0.83, esg: 68 },
  { id: "SUP-015", name: "Dubai Trade Hub", country: "UAE", city: "Dubai", lat: 25.2048, lng: 55.2708, category: "Packaging", risk: 38, on_time: 0.91, esg: 72 }
]

const SHIPMENT_ROUTES = [
  { id: "SHP-001", from: "SUP-001", to: "SUP-012", status: "in_transit", value: 250000, eta: "2026-07-05", delay: 0 },
  { id: "SHP-002", from: "SUP-005", to: "SUP-012", status: "delayed", value: 180000, eta: "2026-06-28", delay: 5 },
  { id: "SHP-003", from: "SUP-007", to: "SUP-009", status: "at_risk", value: 95000, eta: "2026-07-10", delay: 3 },
  { id: "SHP-004", from: "SUP-003", to: "SUP-008", status: "in_transit", value: 320000, eta: "2026-07-08", delay: 0 },
  { id: "SHP-005", from: "SUP-002", to: "SUP-012", status: "delivered", value: 445000, eta: "2026-06-20", delay: 0 },
  { id: "SHP-006", from: "SUP-004", to: "SUP-010", status: "in_transit", value: 167000, eta: "2026-07-15", delay: 0 },
  { id: "SHP-007", from: "SUP-013", to: "SUP-012", status: "delayed", value: 88000, eta: "2026-07-01", delay: 7 },
  { id: "SHP-008", from: "SUP-006", to: "SUP-009", status: "in_transit", value: 210000, eta: "2026-07-12", delay: 0 },
  { id: "SHP-009", from: "SUP-015", to: "SUP-008", status: "at_risk", value: 390000, eta: "2026-07-03", delay: 2 },
  { id: "SHP-010", from: "SUP-001", to: "SUP-010", status: "in_transit", value: 275000, eta: "2026-07-18", delay: 0 }
]

const DISRUPTION_ZONES = [
  {
    id: "DIS-001",
    type: "strike",
    severity: "critical",
    lat: 51.9244,
    lng: 4.4777,
    title: "Port Workers Strike",
    description: "Dock workers strike affecting 200+ vessels. Major shipping delay.",
    affected_suppliers: ["SUP-009"],
    affected_shipments: ["SHP-003", "SHP-008"],
    revenue_impact: 850000,
    detected: "2 hours ago",
    resolution: "3-5 days"
  },
  {
    id: "DIS-002",
    type: "weather",
    severity: "high",
    lat: 10.8231,
    lng: 106.6297,
    title: "Typhoon Warning",
    description: "Category 3 typhoon approaching. Factory shutdowns expected.",
    affected_suppliers: ["SUP-005"],
    affected_shipments: ["SHP-002"],
    revenue_impact: 420000,
    detected: "5 hours ago",
    resolution: "1-2 weeks"
  },
  {
    id: "DIS-003",
    type: "port_congestion",
    severity: "high",
    lat: 31.2304,
    lng: 121.4737,
    title: "Shanghai Port Congestion",
    description: "Record vessel queue of 180+ ships. Average delay 72 hours.",
    affected_suppliers: ["SUP-001"],
    affected_shipments: ["SHP-001", "SHP-010"],
    revenue_impact: 620000,
    detected: "1 day ago",
    resolution: "5-7 days"
  },
  {
    id: "DIS-004",
    type: "geopolitical",
    severity: "medium",
    lat: 25.2048,
    lng: 55.2708,
    title: "Trade Restriction Alert",
    description: "New customs regulations affecting Middle East shipments.",
    affected_suppliers: ["SUP-015"],
    affected_shipments: ["SHP-009"],
    revenue_impact: 180000,
    detected: "3 days ago",
    resolution: "Unknown"
  },
  {
    id: "DIS-005",
    type: "customs",
    severity: "medium",
    lat: 19.4326,
    lng: -99.1332,
    title: "Border Customs Delay",
    description: "Increased inspection times at US-Mexico border crossing.",
    affected_suppliers: ["SUP-013"],
    affected_shipments: ["SHP-007"],
    revenue_impact: 95000,
    detected: "6 hours ago",
    resolution: "2-3 days"
  }
]

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
        <span style="
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: ${color};
          border-radius: 9999px;
          animation: markerPulse 1.5s infinite;
        "></span>
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

function getFilteredSuppliers(filter) {
  if (filter === "at_risk") return SUPPLIER_LOCATIONS.filter((supplier) => supplier.risk > 65)
  if (filter === "critical") return SUPPLIER_LOCATIONS.filter((supplier) => supplier.risk > 80)
  return SUPPLIER_LOCATIONS
}

function MapBridge({ onReady }) {
  const map = useMap()

  useEffect(() => {
    onReady(map)
  }, [map, onReady])

  return null
}

function SupplierPopup({ supplier, navigate }) {
  const riskColor = getRiskColor(supplier.risk)

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
        <div style={{ fontSize: "12px", color: "#64748b" }}>{supplier.city}, {supplier.country}</div>
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
          <div style={{ fontSize: "18px", fontWeight: 700, color: riskColor }}>{supplier.risk}</div>
        </div>
        <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "6px" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>ON-TIME</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: supplier.on_time > 0.9 ? "#10b981" : "#f59e0b" }}>
            {Math.round(supplier.on_time * 100)}%
          </div>
        </div>
        <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "6px" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>CATEGORY</div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>{supplier.category}</div>
        </div>
        <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "6px" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>ESG SCORE</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#10b981" }}>{supplier.esg}</div>
        </div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${supplier.risk}%`,
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
                affectedSupplierIds: [supplier.id],
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
                prompt: `Find an alternate supplier for ${supplier.name} in ${supplier.city}, ${supplier.country}.`
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

function CurvedRoute({ route, fromSupplier, toSupplier, onSelect, layerRef }) {
  const color = routeColors[route.status]
  const midpoint = [
    (fromSupplier.lat + toSupplier.lat) / 2 + (fromSupplier.lat > toSupplier.lat ? 6 : -6),
    (fromSupplier.lng + toSupplier.lng) / 2 + (fromSupplier.lng > toSupplier.lng ? -10 : 10)
  ]

  return (
    <Polyline
      ref={layerRef}
      positions={[
        [fromSupplier.lat, fromSupplier.lng],
        midpoint,
        [toSupplier.lat, toSupplier.lng]
      ]}
      pathOptions={{
        color,
        weight: route.status === "delayed" ? 3 : 2,
        opacity: 0.82,
        dashArray: route.status === "delivered" ? null : "8,6"
      }}
      eventHandlers={{
        click: () => onSelect(route)
      }}
    >
      <Popup maxWidth={220}>
        <div style={{ fontFamily: "Inter, sans-serif", padding: "4px" }}>
          <div style={{ fontWeight: 700, marginBottom: "6px" }}>{route.id}</div>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
            {fromSupplier.city} -&gt; {toSupplier.city}
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
            {route.status.replace("_", " ")}
          </div>
          <div style={{ fontSize: "12px", color: "#475569" }}>Value: {formatCurrency(route.value)}</div>
          <div style={{ fontSize: "12px", color: "#475569" }}>ETA: {route.eta}</div>
          {route.delay > 0 ? (
            <div style={{ fontSize: "12px", color: "#ef4444", fontWeight: 600, marginTop: "4px" }}>
              Delayed by {route.delay} days
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
  }[disruption.severity]

  return (
    <>
      <Circle
        center={[disruption.lat, disruption.lng]}
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
        center={[disruption.lat, disruption.lng]}
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
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", marginBottom: "6px" }}>{disruption.title}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", lineHeight: "1.5" }}>{disruption.description}</div>
            <div style={{ background: "#fef2f2", padding: "8px", borderRadius: "6px", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", color: "#991b1b", fontWeight: 600 }}>Revenue Impact: {formatCurrency(disruption.revenue_impact)}</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{disruption.affected_shipments.length} shipments affected</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Resolution: {disruption.resolution}</div>
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Detected {disruption.detected}</div>
          </div>
        </Popup>
      </Circle>
      <Marker position={[disruption.lat, disruption.lng]} icon={createDisruptionIcon(disruption.severity, disruption.type)} />
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
        <span className="text-xs text-slate-400">{disruption.detected}</span>
      </div>
      <div className="mb-1 text-sm font-semibold text-slate-800">{disruption.title}</div>
      <div className="mb-2 line-clamp-2 text-xs text-slate-500">{disruption.description}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{formatCurrency(disruption.revenue_impact)}</span>
        <span className="text-slate-400">{disruption.resolution}</span>
      </div>
      <div className="mt-1 text-xs text-slate-400">{disruption.affected_shipments.length} shipments affected</div>
    </button>
  )
}

function ShipmentRow({ route, from, to, onClick }) {
  const statusTone = {
    in_transit: "bg-blue-50 text-blue-700",
    delayed: "bg-rose-50 text-rose-700",
    delivered: "bg-emerald-50 text-emerald-700",
    at_risk: "bg-amber-50 text-amber-700"
  }[route.status]

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <span>{route.id}</span>
          <span className="text-slate-400">|</span>
          <span className="truncate text-slate-600">
            {from?.city} -&gt; {to?.city}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusTone}`}>
            {route.status.replace("_", " ")}
          </span>
          <span className="text-xs text-slate-500">{formatCurrency(route.value)}</span>
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

  const filteredSuppliers = useMemo(() => getFilteredSuppliers(filter), [filter])
  const suppliersById = useMemo(
    () => Object.fromEntries(SUPPLIER_LOCATIONS.map((supplier) => [supplier.id, supplier])),
    []
  )
  const delayedCount = SHIPMENT_ROUTES.filter((route) => route.status === "delayed").length

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
    flyToLocation(supplier.lat, supplier.lng, 6)
    supplierRefs.current[supplier.id]?.openPopup?.()
  }

  function focusRoute(route) {
    const from = suppliersById[route.from]
    if (from) flyToLocation(from.lat, from.lng, 5)
    routeRefs.current[route.id]?.openPopup?.()
  }

  function focusDisruption(disruption) {
    setSelectedDisruptionId(disruption.id)
    flyToLocation(disruption.lat, disruption.lng, 7)
    disruptionRefs.current[disruption.id]?.openPopup?.()
  }

  return (
    <div
      className="flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div className="flex w-80 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <div className="grid grid-cols-2 gap-2">
            <StatPill icon={Building2} label="Suppliers" value={SUPPLIER_LOCATIONS.length} tone="blue" />
            <StatPill icon={AlertTriangle} label="Disruptions" value={DISRUPTION_ZONES.length} tone="red" />
            <StatPill icon={Ship} label="Shipments" value={SHIPMENT_ROUTES.length} tone="blue" />
            <StatPill icon={Truck} label="Delayed" value={delayedCount} tone="amber" />
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
                {DISRUPTION_ZONES.length}
              </span>
            </h3>
          </div>

          <div className="space-y-2 p-3">
            {DISRUPTION_ZONES.map((disruption) => (
              <DisruptionCard
                key={disruption.id}
                disruption={disruption}
                isSelected={selectedDisruptionId === disruption.id}
                onClick={() => focusDisruption(disruption)}
              />
            ))}
          </div>

          <div className="border-y border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">Active Shipments</h3>
          </div>

          <div className="space-y-1 p-3">
            {SHIPMENT_ROUTES.map((route) => {
              const from = suppliersById[route.from]
              const to = suppliersById[route.to]
              return <ShipmentRow key={route.id} route={route} from={from} to={to} onClick={() => focusRoute(route)} />
            })}
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
            { key: "suppliers", label: "Suppliers", icon: Building2, count: filteredSuppliers.length },
            { key: "routes", label: "Routes", icon: Anchor, count: SHIPMENT_ROUTES.length },
            { key: "disruptions", label: "Disruptions", icon: AlertTriangle, count: DISRUPTION_ZONES.length }
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
              filteredSuppliers.map((supplier) => (
                <Marker
                  key={supplier.id}
                  ref={(node) => {
                    if (node) supplierRefs.current[supplier.id] = node
                    else delete supplierRefs.current[supplier.id]
                  }}
                  position={[supplier.lat, supplier.lng]}
                  icon={createSupplierIcon(supplier.risk)}
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
              SHIPMENT_ROUTES.map((route) => {
                const fromSupplier = suppliersById[route.from]
                const toSupplier = suppliersById[route.to]
                if (!fromSupplier || !toSupplier) return null

                return (
                  <CurvedRoute
                    key={route.id}
                    route={route}
                    fromSupplier={fromSupplier}
                    toSupplier={toSupplier}
                    onSelect={focusRoute}
                    layerRef={(node) => {
                      if (node) routeRefs.current[route.id] = node
                      else delete routeRefs.current[route.id]
                    }}
                  />
                )
              })}

            {layers.disruptions &&
              DISRUPTION_ZONES.map((disruption) => (
                <DisruptionZone
                  key={disruption.id}
                  disruption={disruption}
                  onSelect={focusDisruption}
                  layerRef={(node) => {
                    if (node) disruptionRefs.current[disruption.id] = node
                    else delete disruptionRefs.current[disruption.id]
                  }}
                />
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
