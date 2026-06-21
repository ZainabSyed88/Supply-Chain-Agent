import clsx from "clsx"

const STATUS_CLASSES = {
  online: "bg-emerald-500",
  live: "bg-emerald-500",
  offline: "bg-red-500",
  running: "bg-blue-500",
  completed: "bg-emerald-500",
  failed: "bg-red-500",
  idle: "bg-slate-300"
}

export default function StatusDot({ status = "idle", pulse = false }) {
  return (
    <span
      className={clsx(
        "inline-flex h-2.5 w-2.5 rounded-full",
        STATUS_CLASSES[status] || STATUS_CLASSES.idle,
        pulse && "animate-pulse"
      )}
    />
  )
}
