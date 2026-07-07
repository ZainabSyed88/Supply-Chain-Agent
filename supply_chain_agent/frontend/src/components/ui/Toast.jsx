import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { X } from "lucide-react"
import clsx from "clsx"

const ToastContext = createContext(null)

const TYPE_CLASSES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-slate-200 bg-white text-slate-800"
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((content, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const normalized =
      typeof content === "string"
        ? { id, title: content, message: "" }
        : { id, title: content?.title || "Notification", message: content?.message || "" }
    setToasts((prev) => [...prev, { ...normalized, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }, [])

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "animate-slide-up rounded-lg border px-4 py-3 shadow-md",
              TYPE_CLASSES[toast.type] || TYPE_CLASSES.info
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-sm text-current/80">{toast.message}</p> : null}
              </div>
              <button type="button" onClick={() => dismissToast(toast.id)} className="text-current/70 hover:text-current">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
