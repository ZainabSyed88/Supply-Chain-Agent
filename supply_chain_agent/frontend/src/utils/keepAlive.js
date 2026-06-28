import { API_BASE } from "./constants"

const BACKEND_URL = API_BASE.replace(/\/api\/?$/, "")
const KEEP_ALIVE_INTERVAL_MS = 14 * 60 * 1000

export function startKeepAlive() {
  if (typeof window === "undefined" || !import.meta.env.PROD) return
  if (!BACKEND_URL || BACKEND_URL.includes("localhost") || BACKEND_URL.includes("127.0.0.1")) return

  window.setInterval(async () => {
    try {
      await fetch(`${BACKEND_URL}/health`)
    } catch {
      return
    }
  }, KEEP_ALIVE_INTERVAL_MS)
}
