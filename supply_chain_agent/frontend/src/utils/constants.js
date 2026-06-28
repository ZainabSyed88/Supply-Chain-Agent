export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api"
export const WS_BASE = import.meta.env.VITE_WS_BASE || "ws://localhost:5000/ws"

export const SEVERITY_COLORS = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
  low: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-slate-200 bg-slate-100 text-slate-600"
}

export const STATUS_COLORS = {
  in_transit: "border-blue-200 bg-blue-50 text-blue-700",
  delayed: "border-red-200 bg-red-50 text-red-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  at_risk: "border-amber-200 bg-amber-50 text-amber-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
  running: "border-blue-200 bg-blue-50 text-blue-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700"
}

export const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/war-room": "War Room",
  "/map": "Supply Chain Map",
  "/support": "Support Tickets",
  "/orders": "Orders",
  "/suppliers": "Suppliers",
  "/shipments": "Shipments",
  "/warehouses": "Warehouses",
  "/chat": "Copilot",
  "/esg": "ESG Dashboard",
  "/reports": "Reports"
}

export const SUPPLIER_CATEGORIES = [
  "Electronics",
  "Raw Materials",
  "Packaging",
  "Finished Goods"
]

export const COUNTRY_FLAGS = {
  China: "CN",
  India: "IN",
  Germany: "DE",
  Netherlands: "NL",
  "United States": "US",
  Mexico: "MX",
  Vietnam: "VN",
  Poland: "PL",
  Japan: "JP",
  "South Korea": "KR",
  France: "FR",
  Canada: "CA"
}

export const MAP_COLORS = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f59e0b",
  critical: "#ef4444"
}

export const AGENT_TIERS = [
  [
    { id: "supplier_monitor", label: "Supplier Monitor", icon: "factory" },
    { id: "disruption_detector", label: "Disruption Detector", icon: "zap" },
    { id: "anomaly_detection", label: "Anomaly Detection", icon: "scan" }
  ],
  [
    { id: "risk_assessor", label: "Risk Assessor", icon: "shield" },
    { id: "mitigation", label: "Mitigation", icon: "sparkles" },
    { id: "financial_impact", label: "Financial Impact", icon: "banknote" },
    { id: "esg_carbon", label: "ESG Carbon", icon: "leaf" }
  ],
  [
    { id: "alternate_supplier", label: "Alternate Supplier", icon: "network" },
    { id: "predictive_risk", label: "Predictive Risk", icon: "line-chart" }
  ],
  [
    { id: "report_generation", label: "Report Generation", icon: "file-text" },
    { id: "stakeholder_notification", label: "Stakeholder Notification", icon: "send" }
  ]
]

export const FOLLOW_UPS = [
  "Show me the riskiest suppliers by category",
  "Summarize delayed shipments in the next 7 days",
  "Which disruption has the highest revenue impact?"
]
