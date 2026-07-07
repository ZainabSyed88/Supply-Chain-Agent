import { API_BASE } from "./constants"

const AUTH_SESSION_KEY = "chainpulse_auth_session"
const REQUEST_TIMEOUT_MS = 10000
const STREAM_REQUEST_TIMEOUT_MS = 120000
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

async function streamRequest(path, payload, { onEvent } = {}) {
  const response = await fetchWithTimeout(
    `${API_BASE}${path}`,
    {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "text/event-stream"
      }),
      body: JSON.stringify(payload)
    },
    STREAM_REQUEST_TIMEOUT_MS
  )

  if (response.status === 401) {
    localStorage.removeItem(AUTH_SESSION_KEY)
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login"
    }
  }

  if (!response.ok) {
    let message = `API error ${response.status}: ${path}`
    try {
      const errorPayload = await response.json()
      message = errorPayload.detail || errorPayload.error || message
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  if (!response.body) {
    throw new Error("Streaming is not supported by this browser response.")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let finalPayload = null

  while (true) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done })

    let separatorIndex = buffer.indexOf("\n\n")
    while (separatorIndex !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex)
      buffer = buffer.slice(separatorIndex + 2)

      const data = rawEvent
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n")

      if (data) {
        const eventPayload = JSON.parse(data)
        onEvent?.(eventPayload)
        if (eventPayload.type === "error") {
          throw new Error(eventPayload.error || "Streaming request failed.")
        }
        if (eventPayload.type === "done") {
          finalPayload = eventPayload
        }
      }

      separatorIndex = buffer.indexOf("\n\n")
    }

    if (done) break
  }

  if (!finalPayload) {
    throw new Error("Streaming response ended before completion.")
  }

  return finalPayload
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
  chat: (message, history = [], sessionId = null, includeContext = true, options = {}) => {
    const payload = {
      message,
      history,
      session_id: sessionId,
      include_context: includeContext
    }

    if (options.stream) {
      return streamRequest("/chat", { ...payload, stream: true }, { onEvent: options.onEvent })
    }

    return request("/chat", {
      method: "POST",
      body: JSON.stringify(payload)
    })
  },
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
