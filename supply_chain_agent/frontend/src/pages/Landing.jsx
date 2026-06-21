import { ArrowRight, Bot, ShieldCheck, TrendingUp, Zap } from "lucide-react"
import { Link } from "react-router-dom"

const stats = [
  { label: "AI Agents", value: "16" },
  { label: "Accuracy", value: "92%" },
  { label: "Response", value: "<5 min" },
  { label: "Protected", value: "$1M+" }
]

const features = [
  {
    icon: TrendingUp,
    title: "Real-time Monitoring",
    description: "Track supplier health, shipment status, and disruptions as they happen."
  },
  {
    icon: Zap,
    title: "AI-Powered Detection",
    description: "Automatically identify risks before they impact your business."
  },
  {
    icon: ShieldCheck,
    title: "Smart Mitigation",
    description: "Get ranked recommendations with ROI analysis for every disruption."
  }
]

const agents = [
  "Supplier Monitor",
  "Disruption Detector",
  "Risk Assessor",
  "Mitigation Planner",
  "Financial Impact",
  "ESG Carbon",
  "Stakeholder Notifier"
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_34%),linear-gradient(180deg,_#ffffff,_#f8fafc)]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between rounded-2xl border bg-white/80 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary p-2 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">ChainPulse</p>
              <p className="text-sm text-slate-500">Supply chain intelligence platform</p>
            </div>
          </div>
          <Link to="/dashboard" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">
            Open App
          </Link>
        </header>

        <section className="grid gap-14 py-16 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-slate-600">
              <Bot className="h-4 w-4 text-primary" />
              Built for resilient operations teams
            </div>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight text-slate-900 md:text-6xl">
              Intelligent Supply Chain Management
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              AI-powered disruption detection, risk assessment, and mitigation for modern supply chains.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#demo"
                className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Demo
              </a>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-xl shadow-blue-100/40">
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">ChainPulse Command Center</p>
                  <p className="text-2xl font-semibold">Risk Visibility</p>
                </div>
                <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Live
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="h-32 rounded-xl bg-[linear-gradient(180deg,_rgba(59,130,246,0.35),_rgba(59,130,246,0))]">
                    <svg viewBox="0 0 320 120" className="h-full w-full">
                      <path d="M10 95 C60 30, 100 90, 150 55 S230 20, 310 65" fill="none" stroke="#60a5fa" strokeWidth="4" />
                      <path d="M10 100 H310" stroke="#1e293b" strokeDasharray="5 6" />
                      {[40, 120, 200, 280].map((point) => (
                        <circle key={point} cx={point} cy={70 - point / 20} r="5" fill="#93c5fd" />
                      ))}
                    </svg>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {["Suppliers", "Routes", "Alerts"].map((label, index) => (
                      <div key={label} className="rounded-xl bg-white/5 p-3">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="mt-2 text-xl font-semibold">{[25, 30, 10][index]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Global risk map</p>
                    <div className="mt-4 h-40 rounded-xl bg-[radial-gradient(circle_at_40%_40%,_rgba(34,197,94,0.35),_transparent_20%),radial-gradient(circle_at_70%_60%,_rgba(239,68,68,0.4),_transparent_18%),linear-gradient(135deg,_rgba(148,163,184,0.2),_rgba(15,23,42,0.1))]" />
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Mitigation suggestions</p>
                    <div className="mt-3 space-y-2">
                      {["Switch lane to sea freight", "Activate alternate supplier", "Notify regional buyers"].map((item) => (
                        <div key={item} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border bg-white p-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="py-16">
          <div className="mb-8 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Platform Benefits</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Operational confidence for modern supply networks</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border bg-white p-6 shadow-card">
                <div className="inline-flex rounded-xl bg-blue-50 p-3 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border bg-slate-900 px-6 py-10 text-white" id="demo">
          <div className="grid gap-10 lg:grid-cols-[0.8fr,1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">How It Works</p>
              <h2 className="mt-3 text-3xl font-semibold">From data connection to response orchestration</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {["Connect your data", "Agents analyze", "Get recommendations", "Take action"].map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-blue-200">0{index + 1}</p>
                  <p className="mt-3 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Agent Showcase</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">A specialist AI layer for every decision</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent, index) => (
              <div key={agent} className="rounded-2xl border bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-md">
                <div className="inline-flex rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                  Agent {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{agent}</h3>
                <p className="mt-2 text-sm text-slate-500">Continuously monitors changing network conditions and raises action-ready insights.</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t py-8 text-sm text-slate-500">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-900">ChainPulse</p>
              <p>Built for HCLTech-OpenAI Hackathon 2026</p>
            </div>
            <p>Reliable supply chain visibility, from signal to decision.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
