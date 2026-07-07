export function getSupplierRiskThresholds(suppliers = [], kpis = {}) {
  const scores = suppliers
    .map((supplier) => Number(supplier.risk_score || 0))
    .filter((score) => Number.isFinite(score))
    .sort((left, right) => left - right)

  const averageScore = Number(kpis?.average_supplier_risk || 0)
  const atRisk = Number.isFinite(Number(kpis?.risk_alert_threshold))
    ? Number(kpis.risk_alert_threshold)
    : Math.max(15, averageScore || 0)

  if (!scores.length) {
    return {
      atRisk,
      critical: atRisk + 1
    }
  }

  const percentileIndex = Math.max(0, Math.ceil(scores.length * 0.9) - 1)
  const percentileScore = scores[percentileIndex]
  const critical = Number.isFinite(Number(kpis?.risk_critical_threshold))
    ? Number(kpis.risk_critical_threshold)
    : Math.min(scores[scores.length - 1], Math.max(atRisk + 1, percentileScore))

  return {
    atRisk,
    critical
  }
}
