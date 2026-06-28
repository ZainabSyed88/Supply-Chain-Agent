import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import Spinner from "../ui/Spinner"

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation()
  const outletContext = useOutletContext()
  const { isAuthenticated, isReady, role } = useAuth()

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet context={outletContext} />
}
