import { ShieldX, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function Forbidden() {
  const { role } = useAuth()

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-xl rounded-3xl border bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldX className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">Access restricted</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Your current role{role ? ` (${role})` : ""} does not have permission to open this area of ChainPulse.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link to="/chat" className="rounded-xl border px-5 py-3 text-sm font-semibold text-slate-700">
            Open Copilot
          </Link>
        </div>
      </div>
    </div>
  )
}
