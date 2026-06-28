function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  }
}

export default function RiskGauge({ score = 65 }) {
  const size = 180
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  const center = size / 2
  const circumference = Math.PI * radius
  const clampedScore = Math.min(100, Math.max(0, score))
  const progress = (clampedScore / 100) * circumference
  const dashOffset = circumference - progress

  const color = clampedScore > 75 ? "#ef4444" : clampedScore > 50 ? "#f59e0b" : "#10b981"
  const label = clampedScore > 75 ? "HIGH RISK" : clampedScore > 50 ? "MEDIUM RISK" : "LOW RISK"

  const start = polarToCartesian(center, center, radius, 180)
  const end = polarToCartesian(center, center, radius, 0)
  const path = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 26 }}>
        <svg width={size} height={size / 2 + strokeWidth} style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          <path
            d={path}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={path}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1.5s ease-out",
              filter: `drop-shadow(0 0 6px ${color}60)`
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
          <div className="text-4xl font-semibold text-slate-900">{Math.round(clampedScore)}</div>
          <div className="text-xs font-semibold tracking-[0.22em]" style={{ color }}>
            {label}
          </div>
        </div>
      </div>

      <div className="mt-1 flex w-full justify-between px-2 text-xs text-slate-400">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  )
}
