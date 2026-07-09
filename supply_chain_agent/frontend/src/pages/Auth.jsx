import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound, Users, Zap } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../components/ui/Toast"
import { api } from "../utils/api"

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, signIn, signUp } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetStep, setResetStep] = useState("request")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState("")
  const [resetPreviewCode, setResetPreviewCode] = useState("")
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false)
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [resetForm, setResetForm] = useState({
    identifier: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: ""
  })

  const mode = useMemo(() => (location.pathname === "/register" ? "signup" : "signin"), [location.pathname])

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get("redirect") || "/dashboard"
  }, [location.search])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  useEffect(() => {
    if (mode !== "signin") {
      setResetOpen(false)
    }
    setResetStep("request")
    setResetMessage("")
    setResetPreviewCode("")
    setShowResetPassword(false)
    setShowResetConfirmPassword(false)
    setResetForm((prev) => ({
      ...prev,
      resetCode: "",
      newPassword: "",
      confirmPassword: ""
    }))
  }, [mode])

  const openResetPanel = () => {
    setError("")
    setResetOpen(true)
    setResetStep("request")
    setResetMessage("")
    setResetPreviewCode("")
    setResetForm((prev) => ({
      ...prev,
      identifier: prev.identifier || form.username.trim()
    }))
  }

  const requestResetCode = async () => {
    if (!resetForm.identifier.trim()) {
      setResetMessage("Enter your username or email to request a reset code.")
      return
    }

    try {
      setResetLoading(true)
      setResetMessage("")
      setResetPreviewCode("")
      const response = await api.forgotPassword({ identifier: resetForm.identifier.trim() })
      setResetStep("confirm")
      setResetMessage(
        response.delivery === "preview"
          ? "Reset code generated. Use the preview code below to set a new password."
          : response.message || "If your account exists, check your email for the reset code."
      )
      setResetPreviewCode(response.reset_code || "")
      showToast(response.delivery === "preview" ? "Reset code generated." : "Reset code sent.", "success")
    } catch (err) {
      setResetMessage(err.message || "Could not start password reset.")
    } finally {
      setResetLoading(false)
    }
  }

  const submitPasswordReset = async () => {
    if (!resetForm.identifier.trim() || !resetForm.resetCode.trim() || !resetForm.newPassword.trim()) {
      setResetMessage("Complete all reset fields before continuing.")
      return
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetMessage("New passwords do not match.")
      return
    }

    try {
      setResetLoading(true)
      setResetMessage("")
      await api.resetPassword({
        identifier: resetForm.identifier.trim(),
        reset_code: resetForm.resetCode.trim(),
        new_password: resetForm.newPassword,
        confirm_password: resetForm.confirmPassword
      })
      setForm((prev) => ({
        ...prev,
        username: resetForm.identifier.trim(),
        password: resetForm.newPassword
      }))
      setResetOpen(false)
      setResetStep("request")
      setResetPreviewCode("")
      setResetForm({
        identifier: resetForm.identifier.trim(),
        resetCode: "",
        newPassword: "",
        confirmPassword: ""
      })
      showToast("Password reset successfully. You can sign in now.", "success")
    } catch (err) {
      setResetMessage(err.message || "Could not reset password.")
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetKeyDown = (event) => {
    if (event.key !== "Enter") return
    event.preventDefault()
    if (resetStep === "confirm") {
      submitPasswordReset()
      return
    }
    requestResetCode()
  }

  const submit = async (event) => {
    event.preventDefault()
    setError("")

    if (mode === "signin") {
      if (!form.username.trim() || !form.password.trim()) {
        setError("Enter your username or email and password.")
        return
      }
      try {
        setLoading(true)
        await signIn({ username: form.username, password: form.password })
        showToast("Signed in successfully.", "success")
        navigate(redirectTo, { replace: true })
      } catch (err) {
        setError(err.message || "Sign in failed.")
      } finally {
        setLoading(false)
      }
      return
    }

    if (!form.fullName.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill in all required fields.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      setLoading(true)
      await signUp({
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password
      })
      showToast("Account created successfully.", "success")
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || "Registration failed.")
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
          <section className="rounded-3xl bg-primary p-8 text-white shadow-xl shadow-blue-200/50">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
              <ShieldCheck className="h-4 w-4" />
              Authenticated supply chain workspace
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-tight">Intelligent Supply Chain Management</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-blue-50">
              Sign in to access live dashboards, protected pipeline runs, Copilot assistance, PDF reports, and operational alerts.
            </p>
            <div className="mt-10 space-y-4">
              {[
                "Role-based access for Admin, Analyst, and Viewer teams",
                "Protected supply chain data and pipeline execution",
                "Email notifications for onboarding and pipeline completion"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-4">
                  <div className="mt-1 rounded-lg bg-white/15 p-2">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-blue-50">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-xl shadow-blue-100/40">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
              <Link
                to="/login"
                className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition ${
                  mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition ${
                  mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Register
              </Link>
            </div>

            <div className="mt-6">
              <h2 className="text-3xl font-semibold text-slate-900">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {mode === "signin" ? "Sign in to your account" : "Register for a protected ChainPulse workspace"}
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              {mode === "signup" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                  <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                    <Users className="h-4 w-4 text-slate-400" />
                    <input
                      value={form.fullName}
                      onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="Aarav Singh"
                    />
                  </div>
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  {mode === "signin" ? "Username or email" : "Username"}
                </span>
                <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  <input
                    value={form.username}
                    onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder={mode === "signin" ? "admin or admin@chainpulse.ai" : "aarav"}
                  />
                </div>
              </label>

              {mode === "signup" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                  <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="you@company.com"
                    />
                  </div>
                </label>
              ) : null}

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-medium text-slate-700">Password</span>
                  {mode === "signin" ? (
                    <button
                      type="button"
                      onClick={openResetPanel}
                      className="text-sm font-medium text-primary transition hover:text-primary-dark"
                    >
                      Forgot password?
                    </button>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                  <LockKeyhole className="h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {mode === "signin" && resetOpen ? (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4" onKeyDown={handleResetKeyDown}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Reset your password</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Request a 6-digit reset code, then set a new password without leaving the sign-in screen.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResetOpen(false)}
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Username or email</span>
                      <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-white px-4 py-3">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <input
                          value={resetForm.identifier}
                          onChange={(event) => setResetForm((prev) => ({ ...prev, identifier: event.target.value }))}
                          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="admin or admin@chainpulse.ai"
                        />
                      </div>
                    </label>

                    <button
                      type="button"
                      onClick={requestResetCode}
                      disabled={resetLoading}
                      className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:border-blue-300 hover:bg-blue-100/70 disabled:opacity-70"
                    >
                      {resetLoading && resetStep === "request" ? "Sending Reset Code..." : "Send Reset Code"}
                    </button>

                    {resetMessage ? (
                      <div className="rounded-xl border border-blue-200 bg-white/80 px-4 py-3 text-sm text-slate-700">{resetMessage}</div>
                    ) : null}

                    {resetPreviewCode ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Demo reset code: <span className="font-semibold tracking-[0.24em]">{resetPreviewCode}</span>
                      </div>
                    ) : null}

                    {resetStep === "confirm" ? (
                      <div className="space-y-3 rounded-xl border border-dashed border-blue-200 bg-white/70 p-4">
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-700">Reset code</span>
                          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <ShieldCheck className="h-4 w-4 text-slate-400" />
                            <input
                              value={resetForm.resetCode}
                              onChange={(event) => setResetForm((prev) => ({ ...prev, resetCode: event.target.value }))}
                              className="w-full bg-transparent text-sm uppercase tracking-[0.24em] text-slate-900 outline-none placeholder:text-slate-400"
                              placeholder="123456"
                              maxLength={6}
                            />
                          </div>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
                          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <LockKeyhole className="h-4 w-4 text-slate-400" />
                            <input
                              type={showResetPassword ? "text" : "password"}
                              value={resetForm.newPassword}
                              onChange={(event) => setResetForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                              placeholder="Enter a new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowResetPassword((prev) => !prev)}
                              className="text-slate-400 transition hover:text-slate-600"
                            >
                              {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</span>
                          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <LockKeyhole className="h-4 w-4 text-slate-400" />
                            <input
                              type={showResetConfirmPassword ? "text" : "password"}
                              value={resetForm.confirmPassword}
                              onChange={(event) => setResetForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                              placeholder="Confirm your new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                              className="text-slate-400 transition hover:text-slate-600"
                            >
                              {showResetConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </label>

                        <button
                          type="button"
                          onClick={submitPasswordReset}
                          disabled={resetLoading}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70"
                        >
                          {resetLoading ? "Updating Password..." : "Reset Password"}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {mode === "signup" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
                  <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                    <LockKeyhole className="h-4 w-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="text-slate-400 transition hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
              ) : null}

              {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70"
              >
                {loading ? (mode === "signin" ? "Signing In..." : "Creating Account...") : mode === "signin" ? "Sign In" : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link to={mode === "signin" ? "/register" : "/login"} className="font-semibold text-primary hover:text-primary-dark">
                {mode === "signin" ? "Register" : "Sign in"}
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
