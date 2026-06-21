import { COUNTRY_FLAGS } from "./constants"

export const formatCurrency = (val = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: Math.abs(val) > 999999 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(val)

export const formatNumber = (val = 0) =>
  new Intl.NumberFormat("en-US").format(val)

export const formatPercent = (val = 0) =>
  `${(val * 100).toFixed(1)}%`

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })

export const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })

export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "Just now"
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60]
  ]

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  for (const [unit, value] of units) {
    if (Math.abs(seconds) >= value) {
      return formatter.format(Math.round(seconds / value), unit)
    }
  }
  return "Just now"
}

export const riskLevel = (score = 0) =>
  score > 80 ? "critical" : score > 65 ? "high" : score > 40 ? "medium" : "low"

export const riskColor = (score = 0) =>
  score > 80 ? "text-red-600" : score > 65 ? "text-amber-600" : score > 40 ? "text-yellow-600" : "text-emerald-600"

export const statusLabel = (value = "") =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

export const compactId = (value = "") =>
  value.length > 12 ? `${value.slice(0, 8)}...` : value

export const gradeFromScore = (score = 0) =>
  score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "D"

export const getCountryFlag = (country) => {
  const code = COUNTRY_FLAGS[country]
  if (!code) return "🏳️"
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt()))
}
