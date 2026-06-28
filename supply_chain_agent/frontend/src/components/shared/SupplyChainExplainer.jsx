import { motion } from "framer-motion"
import {
  Boxes,
  Factory,
  PackageCheck,
  Pause,
  Play,
  Route,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Warehouse
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const TOTAL_DURATION_MS = 60000
const SCENE_DURATION_MS = 12000

const scenes = [
  {
    title: "Source materials from trusted suppliers",
    subtitle: "Suppliers, parts, and upstream risk signals feed the network continuously.",
    accent: "from-cyan-400/30 to-blue-500/20",
    icon: Boxes,
    stats: ["42 suppliers active", "8 countries", "Live risk scoring"],
    dotClass: "left-[10%] top-[42%]",
    dotGlowClass: "bg-cyan-300/30",
    dotIconClass: "text-cyan-100",
    pulseClass: "left-[16%] top-[38%]",
    pulseGlowClass: "bg-cyan-300/70",
    label: "Suppliers"
  },
  {
    title: "Convert supply into production-ready inventory",
    subtitle: "Factories balance throughput, dependencies, and disruption exposure in real time.",
    accent: "from-violet-400/30 to-fuchsia-500/20",
    icon: Factory,
    stats: ["3 factories", "97% line readiness", "Bottlenecks flagged"],
    dotClass: "left-[31%] top-[22%]",
    dotGlowClass: "bg-violet-300/30",
    dotIconClass: "text-violet-100",
    pulseClass: "left-[38%] top-[28%]",
    pulseGlowClass: "bg-violet-300/70",
    label: "Manufacturing"
  },
  {
    title: "Stage inventory inside smart warehouses",
    subtitle: "Warehouses monitor utilization, staffing, and reorder thresholds before service slips.",
    accent: "from-emerald-400/30 to-cyan-500/20",
    icon: Warehouse,
    stats: ["4 warehouses", "86% utilization", "15 SKUs near reorder"],
    dotClass: "left-[50%] top-[48%]",
    dotGlowClass: "bg-emerald-300/30",
    dotIconClass: "text-emerald-100",
    pulseClass: "left-[56%] top-[52%]",
    pulseGlowClass: "bg-emerald-300/70",
    label: "Warehousing"
  },
  {
    title: "Move shipments across routes and carriers",
    subtitle: "Transport lanes are tracked for delays, reroutes, weather, and port congestion.",
    accent: "from-amber-400/30 to-orange-500/20",
    icon: Truck,
    stats: ["128 shipments", "11 at risk", "Dynamic rerouting"],
    dotClass: "left-[69%] top-[28%]",
    dotGlowClass: "bg-amber-300/30",
    dotIconClass: "text-amber-100",
    pulseClass: "left-[74%] top-[34%]",
    pulseGlowClass: "bg-amber-300/70",
    label: "Logistics"
  },
  {
    title: "Deliver to customers and close the feedback loop",
    subtitle: "Orders, service levels, and executive decisions stay connected through one control tower.",
    accent: "from-blue-400/30 to-violet-500/20",
    icon: ShoppingCart,
    stats: ["312 orders", "94% fill rate", "AI recommendations live"],
    dotClass: "left-[84%] top-[50%]",
    dotGlowClass: "bg-blue-300/30",
    dotIconClass: "text-blue-100",
    pulseClass: "left-[86%] top-[56%]",
    pulseGlowClass: "bg-blue-300/70",
    label: "Delivery"
  }
]

function SceneDot({ active, className, glowClass, delay = 0, Icon, iconClass }) {
  return (
    <motion.div
      animate={active ? { scale: [1, 1.12, 1], opacity: [0.72, 1, 0.72] } : { scale: 1, opacity: 0.45 }}
      transition={{ duration: 2.2, repeat: active ? Infinity : 0, delay }}
      className={`absolute ${className}`}
    >
      <div className={`absolute inset-0 rounded-full blur-2xl ${glowClass}`} />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-white/15 bg-slate-950/85">
        <Icon className={`h-7 w-7 ${iconClass}`} />
      </div>
    </motion.div>
  )
}

export default function SupplyChainExplainer() {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return undefined

    const intervalId = window.setInterval(() => {
      setElapsedMs((current) => (current + 100) % TOTAL_DURATION_MS)
    }, 100)

    return () => window.clearInterval(intervalId)
  }, [isPlaying])

  const sceneIndex = Math.floor(elapsedMs / SCENE_DURATION_MS)
  const sceneProgress = (elapsedMs % SCENE_DURATION_MS) / SCENE_DURATION_MS
  const overallProgress = elapsedMs / TOTAL_DURATION_MS
  const currentScene = scenes[sceneIndex]
  const CurrentIcon = currentScene.icon

  const timelineWidth = useMemo(() => `${Math.max(6, overallProgress * 100)}%`, [overallProgress])

  return (
    <section id="explainer" className="py-14">
      <div className="rounded-[36px] border border-white/12 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-[28px] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/90">60-second explainer</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              What is supply chain, in one animated minute
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-300 md:text-lg">
              Watch materials move from supplier to factory to warehouse to customer while ChainPulse monitors every handoff.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start">
            <button
              type="button"
              onClick={() => setIsPlaying((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              {sceneIndex + 1}/5 - {Math.ceil((TOTAL_DURATION_MS - elapsedMs) / 1000)}s left
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_30%),linear-gradient(180deg,_rgba(8,15,33,0.96),_rgba(8,15,33,0.82))]">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <motion.div
                animate={{ width: timelineWidth }}
                transition={{ ease: "linear", duration: 0.1 }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
              />
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="relative min-h-[420px] overflow-hidden p-5 md:p-7">
              <motion.div
                key={sceneIndex}
                initial={{ opacity: 0.35, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute inset-0 bg-gradient-to-br ${currentScene.accent}`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.04)_1px,_transparent_1px),linear-gradient(0deg,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:36px_36px] opacity-40" />

              <svg viewBox="0 0 1000 420" className="absolute inset-0 h-full w-full opacity-80">
                <defs>
                  <linearGradient id="flowLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path d="M120 210 C220 150, 330 150, 420 180 S590 270, 670 220 S810 130, 900 210" fill="none" stroke="url(#flowLine)" strokeWidth="10" strokeLinecap="round" />
              </svg>

              <motion.div
                animate={{
                  offsetDistance: [`${Math.max(0, overallProgress * 100 - 8)}%`, `${Math.min(100, overallProgress * 100)}%`]
                }}
                transition={{ ease: "linear", duration: 0.2 }}
                className="absolute left-0 top-0 h-0 w-0"
                style={{ offsetPath: "path('M120 210 C220 150, 330 150, 420 180 S590 270, 670 220 S810 130, 900 210')" }}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute inset-0 rounded-full bg-cyan-300/40 blur-xl" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-slate-950/90 shadow-[0_0_28px_rgba(34,211,238,0.35)]">
                    <PackageCheck className="h-5 w-5 text-cyan-100" />
                  </div>
                </div>
              </motion.div>

              {scenes.map((scene, index) => (
                <SceneDot
                  key={scene.label}
                  active={sceneIndex === index}
                  className={scene.dotClass}
                  glowClass={scene.dotGlowClass}
                  delay={index * 0.2}
                  Icon={scene.icon}
                  iconClass={scene.dotIconClass}
                />
              ))}

              <motion.div
                key={currentScene.label}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                className={`absolute ${currentScene.pulseClass}`}
              >
                <div className={`absolute inset-0 rounded-full blur-md ${currentScene.pulseGlowClass}`} />
                <div className="relative rounded-full border border-white/15 bg-slate-950/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                  {currentScene.label}
                </div>
              </motion.div>
            </div>

            <div className="border-t border-white/10 p-5 md:p-7 lg:border-l lg:border-t-0">
              <motion.div
                key={currentScene.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm text-slate-200">
                  <CurrentIcon className="h-4 w-4 text-cyan-200" />
                  Scene {sceneIndex + 1}
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white md:text-3xl">{currentScene.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">{currentScene.subtitle}</p>
              </motion.div>

              <div className="mt-6 space-y-3">
                {currentScene.stats.map((stat, index) => (
                  <motion.div
                    key={stat}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    {stat}
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>Supply Chain Flow</span>
                  <span>{Math.round(sceneProgress * 100)}%</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {scenes.map((scene, index) => (
                    <button
                      key={scene.label}
                      type="button"
                      onClick={() => setElapsedMs(index * SCENE_DURATION_MS)}
                      className={`h-2 flex-1 rounded-full transition ${
                        index === sceneIndex ? "bg-gradient-to-r from-cyan-400 to-violet-500" : "bg-white/10 hover:bg-white/20"
                      }`}
                      aria-label={`Jump to ${scene.label}`}
                    />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Suppliers</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Production</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Warehousing</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Logistics</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Customer delivery</span>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-cyan-400/12 bg-cyan-400/[0.05] p-4 text-sm leading-7 text-cyan-50">
                Supply chain is the end-to-end system that moves materials, products, information, and decisions from source to customer.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Route className="h-4 w-4" />
          Built as a web-native animated explainer so it loads fast, loops automatically, and fits directly into the landing page.
        </div>
      </div>
    </section>
  )
}
