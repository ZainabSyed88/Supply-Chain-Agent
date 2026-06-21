import { API_BASE } from "./constants"

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  })

  if (!response.ok) {
    let message = `API error ${response.status}: ${path}`
    try {
      const payload = await response.json()
      message = payload.detail || payload.error || message
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

const query = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value)
    }
  })
  const value = search.toString()
  return value ? `?${value}` : ""
}

export const api = {
  getKPIs: () => request("/dashboard/kpis"),
  getDemandForecast: () => request("/dashboard/demand-forecast"),
  getInventory: () => request("/inventory"),
  getInventoryAlerts: () => request("/inventory/alerts"),
  getSuppliers: (params = {}) => request(`/suppliers${query(params)}`),
  getSupplier: (id) => request(`/suppliers/${id}`),
  getShipments: (params = {}) => request(`/shipments${query(params)}`),
  getShipment: (id) => request(`/shipments/${id}`),
  getDisruptions: (params = {}) => request(`/disruptions${query(params)}`),
  runPipeline: () => request("/pipeline/run", { method: "POST" }),
  getPipelineStatus: (runId) => request(`/pipeline/${runId}`),
  getPipelineRuns: () => request("/pipeline/runs"),
  getLatestRun: () => request("/pipeline/latest"),
  getPipelineHistory: () => request("/pipeline/history"),
  chat: (message, history = []) =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history })
    }),
  getCarbon: () => request("/dashboard/carbon"),
  getAnomalies: () => request("/dashboard/anomalies"),
  getMapData: () => request("/dashboard/map-data"),
  getReportUrl: (runId) => `${API_BASE}/report/download/${runId}`
}
