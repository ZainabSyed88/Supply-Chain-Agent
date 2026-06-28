export const inventoryData = [
  { sku: "SKU-001", stock: 45, reorder: 50 },
  { sku: "SKU-002", stock: 120, reorder: 50 },
  { sku: "SKU-003", stock: 30, reorder: 50 },
  { sku: "SKU-004", stock: 85, reorder: 50 },
  { sku: "SKU-005", stock: 15, reorder: 50 },
  { sku: "SKU-006", stock: 200, reorder: 50 },
  { sku: "SKU-007", stock: 67, reorder: 50 },
  { sku: "SKU-008", stock: 180, reorder: 50 },
  { sku: "SKU-009", stock: 42, reorder: 50 },
  { sku: "SKU-010", stock: 190, reorder: 50 }
]

export const shipmentStatusData = [
  { name: "In Transit", value: 15, color: "#3b82f6", status: "in_transit" },
  { name: "Delayed", value: 4, color: "#ef4444", status: "delayed" },
  { name: "Delivered", value: 8, color: "#10b981", status: "delivered" },
  { name: "At Risk", value: 3, color: "#f59e0b", status: "at_risk" }
]

export const demandData = Array.from({ length: 210 }, (_, index) => {
  const date = new Date()
  date.setDate(date.getDate() - (209 - index))

  const base = 500
  const seasonal = Math.sin((index / 30) * Math.PI) * 100
  const noise = Math.sin(index * 1.83) * 34 + Math.cos(index * 0.47) * 18
  const isForecast = index > 180
  const value = Math.round(base + seasonal + noise)

  return {
    date: date.toISOString().split("T")[0],
    historical: isForecast ? null : value,
    forecast: isForecast ? Math.round(base + seasonal + noise * 0.45) : null,
    isForecast
  }
})
