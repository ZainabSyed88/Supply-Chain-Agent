import clsx from "clsx"
import Spinner from "./Spinner"

export default function KPICard({ title, value, subtitle, icon: Icon, trend, color = "bg-blue-50 text-blue-700", loading }) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-card transition hover:shadow-md">
      {loading ? (
        <div className="flex min-h-[126px] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className={clsx("rounded-lg p-3", color)}>
              {Icon ? <Icon className="h-5 w-5" /> : null}
            </div>
            {trend ? (
              <span
                className={clsx(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                  trend.value >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                )}
              >
                {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
      )}
    </div>
  )
}
