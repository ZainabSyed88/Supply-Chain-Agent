import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  Factory,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Truck
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import ChainPulseLogo from "./branding/ChainPulseLogo"

const SCENES = [
  {
    id: 1,
    duration: 4000,
    title: "Supply Chains Break Without Warning",
    subtitle: "Every day, disruptions across suppliers, routes, and ports put millions of dollars at risk.",
    themeClass: "from-slate-950 via-slate-900 to-rose-950/80"
  },
  {
    id: 2,
    duration: 4000,
    title: "ChainPulse Detects Disruptions Instantly",
    subtitle: "Real-time news, weather, and supplier signals arrive in one live intelligence stream.",
    themeClass: "from-slate-950 via-slate-900 to-blue-950/80"
  },
  {
    id: 3,
    duration: 5000,
    title: "16 AI Agents Analyze Everything",
    subtitle: "A multi-tier agent network investigates root cause, impact, mitigation, and next-best action.",
    themeClass: "from-slate-950 via-[#081122] to-violet-950/80"
  },
  {
    id: 4,
    duration: 6000,
    title: "Get Instant Recommendations",
    subtitle: "See financial exposure, alternative suppliers, and decision-ready actions in one command surface.",
    themeClass: "from-slate-950 via-[#071726] to-emerald-950/70"
  },
  {
    id: 5,
    duration: 6000,
    title: "Protect Your Supply Chain",
    subtitle: "Resolved disruptions, protected revenue, and a faster path from signal to executive action.",
    themeClass: "from-slate-950 via-[#081a26] to-cyan-950/70"
  }
]

const AGENT_TIERS = [
  { tier: 1, color: "#38bdf8", labels: ["Monitor", "Detect", "Scan", "Forecast"] },
  { tier: 2, color: "#34d399", labels: ["Assess", "Model", "ESG", "Mitigate"] },
  { tier: 3, color: "#a78bfa", labels: ["Source", "Route", "Inventory", "Notify"] },
  { tier: 4, color: "#fb923c", labels: ["Finance", "Policy", "Exec", "Copilot"] }
]

const AGENTS = AGENT_TIERS.flatMap((group, groupIndex) =>
  group.labels.map((label, labelIndex) => {
    const index = groupIndex * group.labels.length + labelIndex
    return {
      id: `${group.tier}-${label}`,
      label,
      tier: group.tier,
      color: group.color,
      angle: -90 + index * 22.5
    }
  })
)

const CONFETTI = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  x: 3 + ((index * 4.3) % 94),
  delay: (index % 6) * 0.22,
  duration: 2.6 + (index % 4) * 0.35,
  size: 4 + (index % 5),
  color: ["#38bdf8", "#34d399", "#fb923c", "#a78bfa", "#f87171"][index % 5]
}))

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function ProductDemoStyles() {
  return (
    <style>{`
      @keyframes demoFadeUp {
        from { opacity: 0; transform: translate3d(0, 18px, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }

      @keyframes demoSlideRight {
        from { opacity: 0; transform: translate3d(42px, 0, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }

      @keyframes demoScaleIn {
        from { opacity: 0; transform: scale(0.82); }
        to { opacity: 1; transform: scale(1); }
      }

      @keyframes demoPulseRing {
        0% { transform: scale(1); opacity: 0.85; }
        100% { transform: scale(1.9); opacity: 0; }
      }

      @keyframes demoSoftPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.08); opacity: 0.78; }
      }

      @keyframes demoGlow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.22); }
        50% { box-shadow: 0 0 0 18px rgba(56, 189, 248, 0); }
      }

      @keyframes demoDash {
        to { stroke-dashoffset: -18; }
      }

      @keyframes demoSweep {
        0% { transform: translateX(-10%); opacity: 0.25; }
        50% { opacity: 0.55; }
        100% { transform: translateX(110%); opacity: 0; }
      }

      @keyframes demoConfetti {
        0% { transform: translate3d(0, -12%, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.9; }
        100% { transform: translate3d(0, 124%, 0) rotate(360deg); opacity: 0; }
      }
    `}</style>
  )
}

function Scene1() {
  const nodes = [
    { cx: 200, cy: 180, label: "Americas", delay: "0s" },
    { cx: 408, cy: 170, label: "Europe", delay: "0.45s" },
    { cx: 620, cy: 160, label: "Asia", delay: "0.9s" }
  ]

  return (
    <div className="flex h-full items-center justify-center px-4 py-4 sm:py-5 md:px-8">
      <svg viewBox="0 0 820 420" className="h-full w-full max-w-4xl">
        <rect width="820" height="420" fill="transparent" />
        <ellipse cx="188" cy="210" rx="96" ry="126" fill="#122033" stroke="#2a3b51" strokeWidth="2" />
        <ellipse cx="408" cy="208" rx="70" ry="136" fill="#122033" stroke="#2a3b51" strokeWidth="2" />
        <ellipse cx="626" cy="185" rx="126" ry="112" fill="#122033" stroke="#2a3b51" strokeWidth="2" />

        <line
          x1="200"
          y1="180"
          x2="408"
          y2="170"
          stroke="#f87171"
          strokeWidth="2.4"
          strokeDasharray="8 8"
          style={{ animation: "demoDash 1.1s linear infinite" }}
        />
        <line
          x1="408"
          y1="170"
          x2="620"
          y2="160"
          stroke="#f87171"
          strokeWidth="2.4"
          strokeDasharray="8 8"
          style={{ animation: "demoDash 1.1s linear infinite" }}
        />

        {nodes.map((node) => (
          <g key={node.label}>
            <circle
              cx={node.cx}
              cy={node.cy}
              r="22"
              fill="none"
              stroke="#f87171"
              strokeWidth="2"
              style={{
                animation: `demoPulseRing 1.8s ${node.delay} infinite`
              }}
            />
            <circle
              cx={node.cx}
              cy={node.cy}
              r="12"
              fill="#ef4444"
              style={{ animation: `demoScaleIn 0.45s ${node.delay} both` }}
            />
            <text x={node.cx} y={node.cy + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="700">
              !
            </text>
            <text x={node.cx} y={node.cy + 34} textAnchor="middle" fill="#94a3b8" fontSize="12">
              {node.label}
            </text>
          </g>
        ))}

        <foreignObject x="270" y="288" width="280" height="88">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="rounded-[26px] border border-rose-500/30 bg-rose-950/80 px-6 py-4 text-center shadow-[0_16px_50px_rgba(248,113,113,0.18)]"
            style={{ animation: "demoFadeUp 0.6s 1.2s both" }}
          >
            <div className="text-xs uppercase tracking-[0.32em] text-rose-200/80">Revenue At Risk</div>
            <div className="mt-2 text-3xl font-semibold text-white">$1.24M</div>
          </div>
        </foreignObject>
      </svg>
    </div>
  )
}

function Scene2() {
  const alerts = [
    { icon: AlertTriangle, text: "Port strike in Rotterdam", level: "CRITICAL", color: "text-rose-300", badge: "bg-rose-500/15 text-rose-200", delay: "0.2s" },
    { icon: Sparkles, text: "Typhoon in Vietnam", level: "HIGH", color: "text-amber-300", badge: "bg-amber-500/15 text-amber-200", delay: "0.45s" },
    { icon: TriangleAlert, text: "Supplier risk spike", level: "MEDIUM", color: "text-cyan-300", badge: "bg-cyan-500/15 text-cyan-200", delay: "0.7s" }
  ]

  return (
    <div className="grid h-full items-center gap-6 px-5 py-5 md:grid-cols-[0.95fr,1.05fr] md:px-8">
      <div className="relative mx-auto flex max-w-sm flex-col items-center text-center" style={{ animation: "demoScaleIn 0.5s both" }}>
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl" />
        <ChainPulseLogo
          theme="dark"
          layout="stacked"
          className="relative gap-3"
          markClassName="drop-shadow-[0_20px_50px_rgba(59,130,246,0.35)]"
          nameClassName="text-2xl sm:text-3xl"
        />
        <div className="relative mt-4 flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs text-cyan-100 sm:mt-5 sm:px-4 sm:py-2 sm:text-sm">
          <BrainCircuit className="h-4 w-4" />
          AI detection engine online
        </div>
        <p className="relative mt-2 max-w-xs text-sm leading-6 text-slate-300">Signals converge from news, weather, carriers, and suppliers in seconds.</p>
      </div>

      <div className="mx-auto w-full max-w-xl space-y-2.5 sm:space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.text}
            className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-slate-900/70 px-3 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] sm:px-4"
            style={{ animation: `demoSlideRight 0.45s ${alert.delay} both` }}
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] ${alert.color}`}>
              <alert.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white">{alert.text}</div>
              <div className="text-xs text-slate-400">Detected by live intelligence feed</div>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.16em] ${alert.badge}`}>
              {alert.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Scene3({ progress }) {
  const activeTier = clamp(Math.ceil(progress / 25), 1, 4)
  const activeAgents = Math.round((progress / 100) * AGENTS.length)
  const radius = 160
  const cx = 400
  const cy = 208

  return (
    <div className="flex h-full items-center justify-center px-4 py-4 sm:py-5 md:px-8">
      <svg viewBox="0 0 800 430" className="h-full w-full max-w-4xl">
        <defs>
          <radialGradient id="agentHub" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r="54" fill="url(#agentHub)" stroke="#60a5fa" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="72" fill="none" stroke="#38bdf8" strokeDasharray="6 10" opacity="0.35" />
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="15" fontWeight="700">
          Pipeline
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="#bfdbfe" fontSize="13">
          Running...
        </text>

        {AGENTS.map((agent, index) => {
          const radians = (agent.angle * Math.PI) / 180
          const x = cx + radius * Math.cos(radians)
          const y = cy + radius * Math.sin(radians)
          const isActive = index < activeAgents
          const isTierActive = agent.tier <= activeTier

          return (
            <g key={agent.id} style={{ animation: `demoScaleIn 0.35s ${index * 0.06}s both` }}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={agent.color}
                strokeWidth="1.4"
                strokeDasharray="4 6"
                opacity={isTierActive ? 0.55 : 0.15}
              />
              <circle cx={x} cy={y} r="20" fill={agent.color} opacity={isTierActive ? 0.2 : 0.08} />
              <circle
                cx={x}
                cy={y}
                r={isActive ? "13" : "10"}
                fill={isActive ? agent.color : "#1e293b"}
                stroke={agent.color}
                strokeWidth="1.6"
              />
              <text x={x} y={y + 34} textAnchor="middle" fill={isTierActive ? "#cbd5e1" : "#64748b"} fontSize="9">
                {agent.label}
              </text>
            </g>
          )
        })}

        <foreignObject x="245" y="348" width="310" height="42">
          <div xmlns="http://www.w3.org/1999/xhtml" className="rounded-full border border-white/10 bg-slate-900/70 px-4 py-3">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-500"
                style={{ width: `${progress}%`, transition: "width 120ms linear" }}
              />
            </div>
          </div>
        </foreignObject>

        <foreignObject x="244" y="392" width="312" height="28">
          <div xmlns="http://www.w3.org/1999/xhtml" className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-400">
            <span>{progress > 92 ? "Analysis Complete" : "Pipeline Running"}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </foreignObject>
      </svg>
    </div>
  )
}

function Scene4({ countUp, progress }) {
  const atRiskSuppliers = Math.round((progress / 100) * 7)
  const disruptions = Math.round((progress / 100) * 12)
  const healthScore = 61 + Math.round((progress / 100) * 12)
  const kpis = [
    { label: "Revenue At Risk", value: `$${(countUp / 1000).toFixed(0)}K`, color: "text-rose-300", icon: CircleDollarSign },
    { label: "Suppliers At Risk", value: `${atRiskSuppliers}`, color: "text-amber-300", icon: Factory },
    { label: "Disruptions", value: `${disruptions}`, color: "text-cyan-300", icon: AlertTriangle },
    { label: "Network Health", value: `${healthScore}/100`, color: "text-emerald-300", icon: ShieldCheck }
  ]

  const actions = [
    { icon: ArrowRight, text: "Switch to alternate supplier - saves $340K", tint: "text-rose-200" },
    { icon: Truck, text: "Expedite 3 shipments - reduces delay by 8 days", tint: "text-amber-200" },
    { icon: CheckCircle2, text: "ESG score improving - 2 greener suppliers added", tint: "text-emerald-200" }
  ]

  return (
    <div className="flex h-full flex-col justify-center px-5 py-5 md:px-8">
      <div className="grid gap-3 md:grid-cols-4">
        {kpis.map((kpi, index) => (
          <div
            key={kpi.label}
            className="rounded-[24px] border border-white/10 bg-slate-900/70 p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
            style={{ animation: `demoFadeUp 0.45s ${index * 0.08}s both` }}
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-400">{kpi.label}</div>
            <div className={`mt-2 text-2xl font-semibold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div
        className="relative mt-4 overflow-hidden rounded-[30px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_22px_50px_rgba(0,0,0,0.24)] sm:p-5"
        style={{ animation: "demoFadeUp 0.5s 0.25s both" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.03)_1px,_transparent_1px),linear-gradient(0deg,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[size:32px_32px] opacity-35" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Revenue At Risk - 6 Month Trend</div>
            <div className="mt-2 text-sm text-slate-300">Financial exposure model updates as disruptions and mitigations change.</div>
          </div>
          <div className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">Live model</div>
        </div>

        <svg viewBox="0 0 640 190" className="relative mt-4 w-full sm:mt-6">
          <defs>
            <linearGradient id="demoLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="demoFillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d="M20 130 C90 118, 138 88, 192 100 S312 165, 374 92 S500 58, 620 78" fill="none" stroke="url(#demoLineGradient)" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 130 C90 118, 138 88, 192 100 S312 165, 374 92 S500 58, 620 78 L620 180 L20 180 Z" fill="url(#demoFillGradient)" />
          <g fill="#cbd5e1">
            {[20, 160, 300, 440, 580].map((x) => (
              <circle key={x} cx={x} cy="140" r="2" opacity="0.35" />
            ))}
          </g>
        </svg>
      </div>

      <div className="mt-4 space-y-2.5 sm:space-y-3">
        {actions.map((action, index) => (
          <div
            key={action.text}
            className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-slate-900/70 px-4 py-3"
            style={{ animation: `demoSlideRight 0.45s ${0.45 + index * 0.18}s both` }}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] ${action.tint}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-200">{action.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Scene5({ ctaHref }) {
  const markers = [
    { cx: 208, cy: 192 },
    { cx: 410, cy: 178 },
    { cx: 614, cy: 166 }
  ]

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden px-5 py-4 sm:py-5 md:px-8">
      <svg viewBox="0 0 840 430" className="absolute inset-0 h-full w-full opacity-85">
        <ellipse cx="194" cy="215" rx="100" ry="130" fill="#102030" stroke="#21445f" strokeWidth="2" />
        <ellipse cx="420" cy="208" rx="74" ry="136" fill="#102030" stroke="#21445f" strokeWidth="2" />
        <ellipse cx="642" cy="190" rx="128" ry="110" fill="#102030" stroke="#21445f" strokeWidth="2" />
        {markers.map((marker, index) => (
          <g key={`${marker.cx}-${marker.cy}`}>
            <circle
              cx={marker.cx}
              cy={marker.cy}
              r="22"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              style={{ animation: `demoPulseRing 1.8s ${index * 0.2}s infinite` }}
            />
            <circle cx={marker.cx} cy={marker.cy} r="13" fill="#16a34a" />
            <path
              d={`M ${marker.cx - 5} ${marker.cy + 1} l 4 4 l 8 -10`}
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {CONFETTI.map((particle) => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy="-8"
            r={particle.size / 2}
            fill={particle.color}
            opacity="0.85"
            style={{
              animation: `demoConfetti ${particle.duration}s ${particle.delay}s infinite linear`
            }}
          />
        ))}
      </svg>

      <div className="relative z-10 mx-auto max-w-xl text-center" style={{ animation: "demoScaleIn 0.6s both" }}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-cyan-300/20 bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_18px_46px_rgba(59,130,246,0.35)] sm:h-[4.5rem] sm:w-[4.5rem]">
          <ShieldCheck className="h-7 w-7 text-white sm:h-8 sm:w-8" />
        </div>
        <h4 className="mt-4 text-[clamp(2rem,4.6vw,3.1rem)] font-semibold leading-tight text-white">
          Supply Chain Protected
        </h4>
        <div
          className="mt-3 text-[clamp(1.9rem,4.2vw,3rem)] font-semibold leading-tight text-emerald-300"
          style={{ animation: "demoSoftPulse 1.2s infinite" }}
        >
          +$847,000 protected
        </div>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base sm:leading-7 md:text-lg">
          ChainPulse detected 12 disruptions, coordinated AI agent analysis, and recommended actions that preserved revenue before the impact hit your network.
        </p>
        <Link
          to={ctaHref}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(59,130,246,0.35)] sm:mt-6 sm:px-6 sm:py-3"
          style={{ animation: "demoSoftPulse 2s infinite" }}
        >
          Open Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default function ProductDemo({ ctaHref = "/dashboard" }) {
  const [currentScene, setCurrentScene] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [countUp, setCountUp] = useState(0)
  const [isInView, setIsInView] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.35 }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isPlaying || !isInView) return undefined

    const scene = SCENES[currentScene]
    let elapsed = 0
    const tick = 80

    const intervalId = window.setInterval(() => {
      elapsed += tick

      if (elapsed >= scene.duration) {
        window.clearInterval(intervalId)
        setProgress(100)
        window.setTimeout(() => {
          setCurrentScene((value) => (value + 1) % SCENES.length)
          setProgress(0)
        }, 80)
        return
      }

      setProgress((elapsed / scene.duration) * 100)
    }, tick)

    return () => window.clearInterval(intervalId)
  }, [currentScene, isInView, isPlaying])

  useEffect(() => {
    if (currentScene !== 3 || !isInView) {
      setCountUp(0)
      return undefined
    }

    let value = 0
    const target = 1240000
    const steps = 60
    const increment = target / steps

    const timer = window.setInterval(() => {
      value = Math.min(value + increment, target)
      setCountUp(Math.round(value))

      if (value >= target) {
        window.clearInterval(timer)
      }
    }, 60)

    return () => window.clearInterval(timer)
  }, [currentScene, isInView])

  const scene = SCENES[currentScene]

  function jumpToScene(index) {
    setCurrentScene(index)
    setProgress(0)
  }

  function goToPrevious() {
    setCurrentScene((value) => (value === 0 ? SCENES.length - 1 : value - 1))
    setProgress(0)
  }

  function goToNext() {
    setCurrentScene((value) => (value + 1) % SCENES.length)
    setProgress(0)
  }

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[40rem] flex-col overflow-hidden rounded-[36px] border border-white/12 bg-slate-950 shadow-[0_32px_90px_rgba(0,0,0,0.35)] lg:min-h-[46rem]"
    >
      <ProductDemoStyles />
      <div className={`absolute inset-0 bg-gradient-to-br ${scene.themeClass}`} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.03)_1px,_transparent_1px),linear-gradient(0deg,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[size:38px_38px] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_24%)]" />

      <div key={scene.id} className="relative min-h-0 flex-1">
        {currentScene === 0 ? <Scene1 /> : null}
        {currentScene === 1 ? <Scene2 /> : null}
        {currentScene === 2 ? <Scene3 progress={progress} /> : null}
        {currentScene === 3 ? <Scene4 countUp={countUp} progress={progress} /> : null}
        {currentScene === 4 ? <Scene5 ctaHref={ctaHref} /> : null}
      </div>

      <div className="relative border-t border-white/10 bg-gradient-to-t from-black/90 via-black/75 to-black/55 px-4 py-3 backdrop-blur-[14px] md:px-5">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
            style={{ width: `${progress}%`, transition: "width 50ms linear" }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {SCENES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => jumpToScene(index)}
              aria-label={`Jump to scene ${item.id}`}
              className={`rounded-full transition-all ${
                index === currentScene ? "h-2 w-10 bg-cyan-300" : "h-2 w-2 bg-white/25 hover:bg-white/45"
              }`}
            />
          ))}
          <div className="ml-auto rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-100">
            Scene {scene.id} / {SCENES.length}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white md:text-2xl">{scene.title}</h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">{scene.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <button
              type="button"
              onClick={() => setIsPlaying((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-2 text-slate-100 transition hover:bg-white/[0.12]"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={goToPrevious}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
