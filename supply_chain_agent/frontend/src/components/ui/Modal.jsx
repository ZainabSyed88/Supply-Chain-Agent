import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import clsx from "clsx"

export default function Modal({ open, onClose, title, children, size = "lg" }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        className={clsx(
          "max-h-[90vh] w-full overflow-hidden rounded-xl border bg-white shadow-modal",
          size === "lg" && "max-w-5xl",
          size === "md" && "max-w-3xl",
          size === "sm" && "max-w-xl"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(90vh-73px)] overflow-y-auto scrollbar-thin px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}
