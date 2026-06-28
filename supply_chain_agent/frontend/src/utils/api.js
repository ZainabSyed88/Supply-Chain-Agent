import { API_BASE } from "./constants"

const AUTH_SESSION_KEY = "chainpulse_auth_session"
const REQUEST_TIMEOUT_MS = 10000
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, "")

function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null")
  } catch {
    return null
  }
}

function getAuthHeaders(extraHeaders = {}) {
  const session = getStoredSession()
  const token = session?.accessToken || null
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    })
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Backend request timed out. Make sure the API server is running on ${BACKEND_ORIGIN}.`)
    }
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach the backend API. Start the FastAPI server on ${BACKEND_ORIGIN} and try again.`)
    }
    throw error
  } finally {
    window.clearTimeout(timer)
  }
}

async function request(path, options = {}) {
  const session = getStoredSession()
  const token = session?.accessToken || null
  const response = await fetchWithTimeout(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  })

  if (response.status === 401) {
    localStorage.removeItem(AUTH_SESSION_KEY)
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login"
    }
  }

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
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: async (username, password) => {
    const form = new FormData()
    form.append("username", username)
    form.append("password", password)

    const response = await fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: "POST",
      body: form
    })

    if (!response.ok) {
      let message = "Login failed"
      try {
        const payload = await response.json()
        message = payload.detail || message
      } catch {
        const text = await response.text()
        if (text) message = text
      }
      throw new Error(message)
    }

    return response.json()
  },
  refreshToken: (refreshToken) =>
    request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken })
    }),
  signOut: () =>
    request("/auth/signout", {
      method: "POST"
    }),
  getCurrentUser: () => request("/auth/me"),
  updateCurrentUser: (payload) =>
    request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  changePassword: (payload) =>
    request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  listUsers: () => request("/auth/users"),
  updateUserRole: (userId, role) =>
    request(`/auth/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role })
    }),
  getKPIs: () => request("/dashboard/kpis"),
  getDemandForecast: () => request("/dashboard/demand-forecast"),
  getInventory: () => request("/inventory"),
  getInventoryAlerts: () => request("/inventory/alerts"),
  getTickets: (params = {}) => request(`/tickets${query(params)}`),
  getRecentTickets: () => request("/tickets/recent"),
  createTicket: (payload) =>
    request("/tickets", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateTicket: (ticketId, payload) =>
    request(`/tickets/${ticketId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  getOrders: (params = {}) => request(`/orders${query(params)}`),
  getOrderSummary: () => request("/orders/summary"),
  getSuppliers: (params = {}) => request(`/suppliers${query(params)}`),
  getSupplier: (id) => request(`/suppliers/${id}`),
  getShipments: (params = {}) => request(`/shipments${query(params)}`),
  getShipment: (id) => request(`/shipments/${id}`),
  getWarehouses: (params = {}) => request(`/warehouses${query(params)}`),
  getWarehouseSummary: () => request("/warehouses/summary"),
  getDisruptions: (params = {}) => request(`/disruptions${query(params)}`),
  runPipeline: () => request("/pipeline/run", { method: "POST" }),
  getPipelineStatus: (runId) => request(`/pipeline/${runId}`),
  getPipelineRuns: () => request("/pipeline/runs"),
  getLatestRun: () => request("/pipeline/latest"),
  getPipelineHistory: () => request("/pipeline/history"),
  chat: (message, history = [], sessionId = null, includeContext = true) =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        history,
        session_id: sessionId,
        include_context: includeContext
      })
    }),
  getCarbon: () => request("/dashboard/carbon"),
  getAnomalies: () => request("/dashboard/anomalies"),
  getMapData: () => request("/dashboard/map-data"),
  getIntelligenceFeed: () => request("/intelligence/feed"),
  getNewsDisruptions: () => request("/intelligence/news"),
  getWeatherAlerts: () => request("/intelligence/weather"),
  getReportUrl: (runId) => `${API_BASE}/report/download/${runId}`,
  downloadReport: async (runId) => {
    const response = await fetchWithTimeout(`${API_BASE}/report/download/${runId}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem(AUTH_SESSION_KEY)
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login"
        }
      }
      let message = "Unable to download report"
      try {
        const payload = await response.json()
        message = payload.detail || payload.error || message
      } catch {
        const text = await response.text()
        if (text) message = text
      }
      throw new Error(message)
    }

    return response.blob()
  }
}
