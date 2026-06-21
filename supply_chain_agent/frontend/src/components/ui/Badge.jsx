import clsx from "clsx"
import { SEVERITY_COLORS, STATUS_COLORS } from "../../utils/constants"

export default function Badge({ label, variant = "info", className }) {
  const styles = SEVERITY_COLORS[variant] || STATUS_COLORS[variant] || SEVERITY_COLORS.info
  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", styles, className)}>
      {label}
    </span>
  )
}
