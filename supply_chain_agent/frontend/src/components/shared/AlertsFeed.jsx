import { AlertTriangle, MessageSquareText } from "lucide-react"
import Badge from "../ui/Badge"
import EmptyState from "../ui/EmptyState"
import { formatDateTime, formatRelativeTime, statusLabel } from "../../utils/formatters"

export default function AlertsFeed({ alerts = [], onAskAi }) {
  if (!alerts.length) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No active alerts"
        description="New disruption and pipeline alerts will appear here in real time."
      />
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="relative z-10 rounded-lg border bg-white p-4 shadow-card pointer-events-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  label={statusLabel(alert.severity || "info")}
                  variant={alert.severity || "info"}
                  className="relative z-10"
                />
                <span className="text-xs text-slate-400" title={formatDateTime(alert.timestamp)}>
                  {formatRelativeTime(alert.timestamp)}
                </span>
              </div>
              <h4 className="mt-3 font-semibold text-slate-900">{alert.title}</h4>
              <p className="mt-1 text-sm text-slate-500">{alert.message || alert.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onAskAi?.(alert)}
              className="relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <MessageSquareText className="h-4 w-4" />
              Ask AI
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
