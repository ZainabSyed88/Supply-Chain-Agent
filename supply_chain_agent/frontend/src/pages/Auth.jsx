import { useEffect, useMemo, useState } from "react"
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, UserRound, Zap } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../components/ui/Toast"

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, signIn, signUp } = useAuth()
  const { showToast } = useToast()
  const [mode, setMode] = useState("signin")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get("redirect") || "/dashboard"
  }, [location.search])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  const submit = async (event) => {
    event.preventDefault()
    setError("")

    if (!form.email.trim() || !form.password.trim() || (mode === "signup" && !form.name.trim())) {
      setError("Please fill in all required fields.")
      return
    }

    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      setLoading(true)
      if (mode === "signin") {
        await signIn({ email: form.email, password: form.password })
        showToast("Signed in successfully.", "success")
      } else {
        await signUp({ name: form.name, email: form.email, password: form.password })
        showToast("Account created successfully.", "success")
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || "Authentication failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.09),_transparent_30%),linear-gradient(180deg,_#ffffff,_#eff6ff)] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between rounded-2xl border bg-white/90 px-5 py-4 backdrop-blur">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-primary p-2 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">ChainPulse</p>
              <p className="text-sm text-slate-500">Secure access for supply chain teams</p>
            </div>
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Back to website
          </Link>
        </header>

        <div className="grid gap-10 py-12 lg:grid-cols-[1fr,0.95fr] lg:items-center">
          <section>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Access is required before opening the product
            </div>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight text-slate-900 md:text-6xl">
              Sign in to enter the ChainPulse workspace
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Create an account or sign in to access dashboards, Copilot, live supply chain intelligence, and the operational workspace.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                "Protected app routes",
                "Guided access to Dashboard and Copilot",
                "Local demo accounts stored in this browser"
              ].map((item) => (
                <div key={item} className="rounded-2xl border bg-white p-4 shadow-card">
                  <p className="text-sm font-medium text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-xl shadow-blue-100/40">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("signin")
                  setError("")
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup")
                  setError("")
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              {mode === "signup" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                  <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                    <UserRound className="h-4 w-4 text-slate-400" />
                    <input
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="Aarav Singh"
                    />
                  </div>
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="you@company.com"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                  <LockKeyhole className="h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="Enter your password"
                  />
                </div>
              </label>

              {mode === "signup" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
                  <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                    <LockKeyhole className="h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="Confirm your password"
                    />
                  </div>
                </label>
              ) : null}

              {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70"
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              {mode === "signin" ? "Need an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin")
                  setError("")
                }}
                className="font-semibold text-primary hover:text-primary-dark"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
