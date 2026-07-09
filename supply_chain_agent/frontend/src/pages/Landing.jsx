import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  ArrowRight,
  BellRing,
  Bot,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Globe2,
  Layers3,
  LineChart,
  Mail,
  Map,
  MessageSquareText,
  Phone,
  Play,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Workflow,
  Zap
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import ChainPulseLogo from "../components/branding/ChainPulseLogo"
import ProductDemo from "../components/ProductDemo"
import { useAuth } from "../hooks/useAuth"

const navItems = [
  { label: "About", targetId: "about", previewAlign: "start" },
  { label: "Tour", targetId: "tour", previewAlign: "center" },
  { label: "Capabilities", targetId: "capabilities", previewAlign: "center" },
  { label: "Pricing", targetId: "pricing", previewAlign: "center" },
  { label: "FAQ", targetId: "faq", previewAlign: "center" },
  { label: "Contact", targetId: "contact", previewAlign: "end" }
]

const aboutSummary =
  "An AI-powered multi-agent intelligence platform that monitors suppliers, analyzes global events, forecasts risks, and recommends mitigation strategies in real time."

const tourSummary =
  "A quick snapshot of specialized AI agents, disruption accuracy, risk forecasting, cost reduction, and live shipments monitored."

const stats = [
  { label: "Specialized AI Agents", value: "16" },
  { label: "Disruption Detection Accuracy", value: "92%" },
  { label: "Risk Forecast Accuracy", value: "88%" },
  { label: "Cost Reduction", value: "45%" },
  { label: "Shipments Monitored", value: "1000+" }
]

const features = [
  {
    icon: Radar,
    title: "Real-Time Disruption Intelligence",
    description:
      "Weather, strikes, traffic, geopolitical events, and supplier failures are detected automatically across your network.",
    className: "md:col-span-2"
  },
  {
    icon: Workflow,
    title: "16-Agent Orchestration System",
    description:
      "Specialized AI agents collaborate to monitor, predict, escalate, and resolve disruptions before teams feel the impact.",
    className: "md:row-span-2"
  },
  {
    icon: TrendingUp,
    title: "Predictive Risk Analytics",
    description:
      "Forecast supplier health and disruption probability up to 30 days ahead with continuously updated intelligence.",
    className: ""
  },
  {
    icon: Layers3,
    title: "Digital Twin Simulator",
    description:
      "Run what-if scenarios, test mitigation options, and compare business impact before making decisions.",
    className: ""
  },
  {
    icon: CircleDollarSign,
    title: "Financial Impact Forecasting",
    description:
      "Quantify revenue loss, mitigation costs, service-level exposure, and expected ROI for each intervention strategy.",
    className: ""
  },
  {
    icon: Bot,
    title: "Executive AI Copilot",
    description:
      "Ask natural language questions and receive instant operational intelligence, summaries, and recommendations.",
    className: "md:col-span-2"
  }
]

const showcaseCards = [
  { title: "Command Center", description: "Unified control surface for live disruptions, risk scoring, and financial exposure.", icon: Activity },
  { title: "Mission Control", description: "Monitor every supplier, lane, warehouse, and inventory flow from one premium workspace.", icon: Globe2 },
  { title: "War Room", description: "Coordinate mitigation actions with real-time alerts, owners, and automated stakeholder updates.", icon: BellRing },
  { title: "Executive Copilot", description: "Summarize risk posture, answer board-level questions, and generate next actions instantly.", icon: MessageSquareText },
  { title: "News Intelligence", description: "Continuously scan global events, local incidents, and market signals that affect supply continuity.", icon: Sparkles },
  { title: "Digital Twin", description: "Simulate alternate suppliers, route shifts, and inventory policies before revenue is impacted.", icon: Map }
]

const showcaseBarGradients = [
  "linear-gradient(180deg, rgba(103, 232, 249, 0.82) 0%, rgba(59, 130, 246, 0.34) 100%)",
  "linear-gradient(180deg, rgba(147, 197, 253, 0.85) 0%, rgba(79, 70, 229, 0.34) 100%)",
  "linear-gradient(180deg, rgba(110, 231, 183, 0.82) 0%, rgba(16, 185, 129, 0.32) 100%)",
  "linear-gradient(180deg, rgba(253, 186, 116, 0.84) 0%, rgba(249, 115, 22, 0.32) 100%)",
  "linear-gradient(180deg, rgba(196, 181, 253, 0.84) 0%, rgba(139, 92, 246, 0.32) 100%)"
]

const steps = [
  "Monitor suppliers, logistics, inventory, and global events continuously.",
  "AI agents analyze disruptions, dependencies, and financial exposure.",
  "The platform recommends mitigation strategies and notifies stakeholders.",
  "Executives use AI Copilot to make informed operational decisions fast."
]

const capabilities = [
  { icon: Sparkles, label: "News Intelligence Agent" },
  { icon: ShieldCheck, label: "ESG Sustainability Tracking" },
  { icon: Bot, label: "Voice Assistant" },
  { icon: LineChart, label: "Auto-Generated Executive Reports" },
  { icon: Building2, label: "Alternative Supplier Discovery" },
  { icon: Route, label: "Route Optimization" },
  { icon: BellRing, label: "Stakeholder Notifications" }
]

const testimonials = [
  {
    quote:
      "ChainPulse gives our team the same clarity during disruption weeks that we normally only get in quarterly reviews. That speed changed how we operate.",
    name: "Priya Raman",
    title: "Supply Chain Director",
    company: "Global electronics manufacturer"
  },
  {
    quote:
      "The digital twin and financial impact modeling help us make executive decisions with confidence instead of guesswork. It feels built for the boardroom.",
    name: "Daniel Brooks",
    title: "COO",
    company: "North American industrial distributor"
  },
  {
    quote:
      "Our logistics managers now get ranked mitigation actions instead of disconnected alerts. Response time dropped dramatically in the first month.",
    name: "Mariana Costa",
    title: "Logistics Manager",
    company: "Consumer goods network"
  }
]

const contactMethods = [
  { icon: Mail, label: "Email", value: "enterprise@chainpulse.ai" },
  { icon: Phone, label: "Phone", value: "+1 (555) 014-2026" },
  { icon: Globe2, label: "Coverage", value: "Global supplier and logistics networks" }
]

const pricing = [
  {
    name: "Starter",
    price: "$6k",
    subtitle: "per month",
    description: "For focused regional teams building a modern disruption-response layer.",
    features: ["4 agent workflows", "Live disruption monitoring", "Core dashboards", "Email notifications"]
  },
  {
    name: "Professional",
    price: "$18k",
    subtitle: "per month",
    description: "For multi-site operations teams that need predictive insights and simulations.",
    features: ["16-agent orchestration", "Risk forecasting", "Digital twin scenarios", "Executive AI Copilot"],
    featured: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    subtitle: "global deployment",
    description: "For Fortune 500 supply networks needing advanced controls, integrations, and governance.",
    features: ["Private deployment options", "Custom data connectors", "Role-based command centers", "Dedicated success team"]
  }
]

const faqs = [
  {
    question: "How quickly can Supply Chain Disruption Agent be deployed?",
    answer:
      "Most enterprise pilots go live in weeks, starting with priority suppliers, lanes, and disruption sources before expanding across the broader network."
  },
  {
    question: "How do customers raise an incident or support ticket?",
    answer:
      "Inside ChainPulse, customers can open the Support page, submit a ticket with severity, category, and affected area, and then track updates from the operations team in one place."
  },
  {
    question: "Does the platform work with existing ERP and TMS systems?",
    answer:
      "Yes. The platform is designed to sit above existing systems and ingest operational, supplier, logistics, and event data through APIs and connectors."
  },
  {
    question: "Can executives use it without operational training?",
    answer:
      "Yes. Executive AI Copilot provides a simplified interface for board-level summaries, risk digests, mitigation tradeoffs, and decision-ready recommendations."
  },
  {
    question: "How is ROI measured?",
    answer:
      "Teams typically measure avoided revenue loss, reduced expedite costs, faster response cycles, improved service levels, and planner productivity gains."
  },
  {
    question: "Can customer-reported issues be linked to shipments, warehouses, or suppliers?",
    answer:
      "Yes. Tickets can include the affected area so teams can tie reports directly to shipment IDs, supplier IDs, warehouse operations, or broader platform issues."
  }
]

const navPreviewContent = {
  about: {
    eyebrow: "Overview",
    title: "What ChainPulse covers",
    summary: aboutSummary
  },
  tour: {
    eyebrow: "Quick tour",
    title: "What the metrics section shows",
    summary: tourSummary
  },
  capabilities: {
    eyebrow: "Capabilities",
    title: "Included intelligence modules",
    items: capabilities.map((capability) => ({
      label: capability.label
    }))
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Current plan structure",
    items: pricing.map((tier) => ({
      label: tier.name,
      detail: tier.features[0],
      badge: tier.featured ? "Popular" : null
    }))
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions teams usually ask",
    items: faqs.slice(0, 2).map((item) => ({
      label: item.question
    }))
  },
  contact: {
    eyebrow: "Contact",
    title: "Ways to reach the team",
    items: contactMethods.map((method) => ({
      label: method.label,
      detail: method.value
    }))
  }
}

const sectionReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
  }
}

const cardReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
}

function SectionHeading({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/90">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-300 md:text-lg">{description}</p> : null}
    </div>
  )
}

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`glass-surface rounded-[28px] border border-white/12 bg-white/[0.08] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-[30px] ${className}`}
    >
      {children}
    </div>
  )
}

function HeroDashboardMockup() {
  const kpis = [
    { label: "Active Suppliers", value: "25", valueClass: "text-cyan-300" },
    { label: "Revenue at Risk", value: "$4.8M", valueClass: "text-rose-300" },
    { label: "Disruptions", value: "27", valueClass: "text-amber-300" }
  ]

  const regions = [
    {
      region: "Asia Pacific",
      risk: "Critical",
      panel: "border-rose-400/30 bg-rose-400/12",
      swatch: "bg-rose-400/70",
      label: "text-rose-200"
    },
    {
      region: "Europe",
      risk: "Medium",
      panel: "border-teal-400/30 bg-teal-400/12",
      swatch: "bg-teal-400/70",
      label: "text-teal-200"
    },
    {
      region: "Americas",
      risk: "Low",
      panel: "border-sky-400/30 bg-sky-400/12",
      swatch: "bg-sky-400/70",
      label: "text-sky-200"
    },
    {
      region: "Middle East",
      risk: "High",
      panel: "border-amber-400/30 bg-amber-400/12",
      swatch: "bg-amber-400/70",
      label: "text-amber-200"
    }
  ]

  return (
    <GlassCard className="mx-auto w-full max-w-2xl overflow-hidden rounded-[32px] border-white/14 bg-[linear-gradient(145deg,rgba(15,23,42,0.94),rgba(9,15,31,0.92))] p-4 sm:p-5 lg:ml-auto">
      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{kpi.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${kpi.valueClass}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Command Center</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Global Risk Map</h3>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                Live
              </span>
            </div>

            <div className="relative mt-5 h-52 overflow-hidden rounded-[20px] border border-white/8 bg-[radial-gradient(circle_at_24%_26%,rgba(34,211,238,0.22),transparent_18%),radial-gradient(circle_at_72%_58%,rgba(59,130,246,0.2),transparent_20%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.7))]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
              {[
                "top-[26%] left-[20%] bg-emerald-400/75",
                "top-[44%] left-[60%] bg-rose-400/80",
                "top-[68%] left-[34%] bg-amber-300/75"
              ].map((item) => (
                <span key={item} className={`absolute h-4 w-4 rounded-full blur-[1px] ${item}`} />
              ))}
              <svg viewBox="0 0 420 200" className="absolute inset-0 h-full w-full opacity-85">
                <path
                  d="M28 138 C92 128, 138 72, 184 88 S266 150, 316 102 S374 76, 408 110"
                  fill="none"
                  stroke="url(#heroPulseLine)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="heroPulseLine" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="55%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Revenue Impact Meter</p>
                  <p className="mt-2 text-3xl font-semibold text-white">$12.6M</p>
                </div>
                <CircleDollarSign className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-400">
                Modeled exposure if no mitigation actions are taken.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Multi-Agent Workflow</p>
                  <p className="mt-2 text-lg font-semibold text-white">From signal to mitigation</p>
                </div>
                <Workflow className="h-5 w-5 text-violet-200" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                {[Truck, Radar, Workflow, ShieldCheck].map((Icon, index) => (
                  <div key={index} className="flex flex-1 items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <Icon className="h-4 w-4 text-cyan-100" />
                    </div>
                    {index < 3 ? <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/60 to-violet-400/20" /> : null}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-400">
                Supplier monitor {"->"} event intelligence {"->"} mitigation planner {"->"} stakeholder alerting
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Risk Heatmap</p>
              <p className="mt-2 text-lg font-semibold text-white">Regional stress signals</p>
            </div>
            <LineChart className="h-5 w-5 text-violet-200" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {regions.map((region) => (
              <div key={region.region} className={`rounded-[18px] border p-3 ${region.panel}`}>
                <div className={`h-12 rounded-xl ${region.swatch}`} />
                <p className="mt-3 text-xs text-slate-300">{region.region}</p>
                <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.14em] ${region.label}`}>{region.risk}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

function SectionNavButton({
  label,
  targetId,
  previewKey,
  preview,
  previewAlign = "center",
  previewId,
  isOpen,
  onOpenPreview,
  onClosePreview,
  onInteract,
  className = ""
}) {
  const alignmentClass =
    previewAlign === "start"
      ? "left-0 origin-top-left"
      : previewAlign === "end"
        ? "right-0 origin-top-right"
        : "left-1/2 -translate-x-1/2 origin-top"

  return (
    <div
      className="relative"
      data-nav-preview-root="true"
      onMouseEnter={() => onOpenPreview?.(previewKey, targetId)}
      onMouseLeave={() => onClosePreview?.(previewKey)}
    >
      <button
        type="button"
        title={label}
        aria-label={`Go to ${label} section`}
        aria-haspopup={preview ? "dialog" : undefined}
        aria-expanded={preview ? isOpen : undefined}
        aria-describedby={isOpen ? previewId : undefined}
        onFocus={() => onOpenPreview?.(previewKey, targetId, true)}
        onBlur={() => onClosePreview?.(previewKey)}
        onClick={() => onInteract?.(targetId, previewKey, Boolean(preview))}
        className={className}
      >
        {label}
      </button>
      <AnimatePresence>
        {preview && isOpen ? (
          <motion.div
            id={previewId}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute top-full z-30 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-[26px] border border-white/20 bg-[rgba(7,16,31,0.94)] p-4 shadow-[0_28px_90px_rgba(2,6,23,0.62)] backdrop-blur-xl ${alignmentClass}`}
          >
            <div className="rounded-[22px] border border-white/12 bg-[rgba(15,23,42,0.88)] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
                {preview.eyebrow}
              </p>
              <h3 className="mt-3 text-base font-semibold text-white">{preview.title}</h3>
              {preview.summary ? (
                <p className="mt-3 text-sm leading-6 text-slate-200">{preview.summary}</p>
              ) : null}
              {preview.items?.length ? (
                <div className="mt-4 space-y-2">
                  {preview.items.map((item) => (
                    <div
                      key={`${preview.title}-${item.label}`}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2.5 shadow-[0_10px_30px_rgba(2,6,23,0.28)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          {item.detail ? (
                            <p className="mt-1 text-xs leading-5 text-slate-300">{item.detail}</p>
                          ) : null}
                        </div>
                        {item.badge ? (
                          <span className="shrink-0 rounded-full border border-cyan-300/30 bg-cyan-300/14 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-50">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const [openFaq, setOpenFaq] = useState(0)
  const [activePreviewKey, setActivePreviewKey] = useState(null)
  const [touchPreviewEnabled, setTouchPreviewEnabled] = useState(false)
  const headerRef = useRef(null)
  const previewTimerRef = useRef(null)

  const appHref = isAuthenticated ? "/dashboard" : "/auth?redirect=%2Fdashboard"
  const chatHref = isAuthenticated ? "/chat" : "/auth?redirect=%2Fchat"
  const authCta = isAuthenticated ? "Open App" : "Sign In"

  const clearPreviewTimer = useCallback(() => {
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current)
      previewTimerRef.current = null
    }
  }, [])

  const scrollToSection = useCallback((targetId, { behavior = "smooth" } = {}) => {
    if (typeof window === "undefined" || !targetId) return

    const target = document.getElementById(targetId)
    if (!target) return

    if (targetId === "about") {
      window.scrollTo({ top: 0, behavior })
      return
    }

    target.scrollIntoView({
      behavior,
      block: "start"
    })
  }, [])

  const openPreview = useCallback((previewKey, targetId, immediate = false) => {
    if (!navPreviewContent[targetId]) return

    clearPreviewTimer()

    if (immediate || touchPreviewEnabled) {
      setActivePreviewKey(previewKey)
      return
    }

    previewTimerRef.current = window.setTimeout(() => {
      setActivePreviewKey(previewKey)
      previewTimerRef.current = null
    }, 150)
  }, [clearPreviewTimer, touchPreviewEnabled])

  const closePreview = useCallback((previewKey) => {
    clearPreviewTimer()
    setActivePreviewKey((current) => (current === previewKey ? null : current))
  }, [clearPreviewTimer])

  const handleNavInteraction = useCallback((targetId, previewKey, hasPreview) => {
    if (touchPreviewEnabled && hasPreview && activePreviewKey !== previewKey) {
      setActivePreviewKey(previewKey)
      return
    }

    clearPreviewTimer()
    setActivePreviewKey(null)
    scrollToSection(targetId)
  }, [activePreviewKey, clearPreviewTimer, scrollToSection, touchPreviewEnabled])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)")
    const updatePreviewMode = () => {
      setTouchPreviewEnabled(mediaQuery.matches)
    }

    updatePreviewMode()

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreviewMode)
      return () => {
        mediaQuery.removeEventListener("change", updatePreviewMode)
      }
    }

    mediaQuery.addListener(updatePreviewMode)

    return () => {
      mediaQuery.removeListener(updatePreviewMode)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !headerRef.current) return undefined

    const rootStyle = document.documentElement.style
    const stickyOffset = 16
    const updateAnchorOffset = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 0
      rootStyle.setProperty("--landing-anchor-offset", `${headerHeight + stickyOffset}px`)
    }

    updateAnchorOffset()

    const resizeObserver = new ResizeObserver(() => {
      updateAnchorOffset()
    })

    resizeObserver.observe(headerRef.current)
    window.addEventListener("resize", updateAnchorOffset)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateAnchorOffset)
      rootStyle.removeProperty("--landing-anchor-offset")
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`
    )
  }, [])

  useEffect(() => {
    if (!activePreviewKey || typeof window === "undefined") return undefined

    const dismissPreview = (event) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-nav-preview-root='true']")) {
        setActivePreviewKey(null)
      }
    }

    const dismissOnEscape = (event) => {
      if (event.key === "Escape") {
        setActivePreviewKey(null)
      }
    }

    window.addEventListener("pointerdown", dismissPreview)
    window.addEventListener("keydown", dismissOnEscape)

    return () => {
      window.removeEventListener("pointerdown", dismissPreview)
      window.removeEventListener("keydown", dismissOnEscape)
    }
  }, [activePreviewKey])

  useEffect(() => () => {
    clearPreviewTimer()
  }, [clearPreviewTimer])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050816] text-white">
      <div className="landing-orb landing-orb-cyan" />
      <div className="landing-orb landing-orb-blue" />
      <div className="landing-orb landing-orb-purple" />
      <div className="landing-grid absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(54,162,255,0.18),_transparent_28%),linear-gradient(180deg,_rgba(5,8,22,0.32),_#050816_34%,_#050816)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-6 lg:px-8">
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sticky top-4 z-40 rounded-[28px] border border-white/12 bg-white/[0.08] px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-[30px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <ChainPulseLogo theme="dark" subtitle="Supply Chain Disruption Agent" />

            <nav className="hidden items-center gap-6 lg:flex">
              {navItems.map((item) => (
                <SectionNavButton
                  key={item.label}
                  label={item.label}
                  targetId={item.targetId}
                  previewKey={`header-${item.targetId}`}
                  preview={navPreviewContent[item.targetId]}
                  previewAlign={item.previewAlign}
                  previewId={`header-preview-${item.targetId}`}
                  isOpen={activePreviewKey === `header-${item.targetId}`}
                  onOpenPreview={openPreview}
                  onClosePreview={closePreview}
                  onInteract={handleNavInteraction}
                  className="text-sm text-slate-300 transition hover:text-white"
                />
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                to={chatHref}
                className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 md:inline-flex"
              >
                Ask AI Copilot
              </Link>
              <Link
                to={appHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                {authCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.header>

        <section
          className="landing-anchor-section grid gap-10 pb-12 pt-10 lg:min-h-[calc(100vh-7.5rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-12 xl:gap-16"
          id="about"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionReveal}
            className="flex min-w-0 flex-col gap-6 pt-2"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              HCLTech-OpenAI Hackathon 2026
            </div>

            <div className="max-w-3xl">
              <ChainPulseLogo
                theme="dark"
                layout="stacked"
                showTagline
                className="items-start text-left"
                markClassName="h-20 w-20 sm:h-24 sm:w-24"
                nameClassName="text-4xl sm:text-5xl"
                metaClassName="text-cyan-100/75"
              />
              <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">
                <span className="sr-only">ChainPulse</span>
                <span className="mt-8 block">Supply Chain Intelligence</span>
                <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Powered by AI Agents
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                ChainPulse monitors global suppliers, detects disruptions from live news and weather data, and recommends mitigation strategies in real time through an orchestrated AI command layer.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
              {[
                { value: "7", label: "AI Agents" },
                { value: "<20s", label: "Analysis Time" },
                { value: "$1M+", label: "Revenue Protected" }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4 shadow-[0_12px_40px_rgba(2,6,23,0.18)]"
                >
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={appHref}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(59,130,246,0.35)] transition hover:scale-[1.02]"
              >
                Request Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection("explainer")}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.11]"
              >
                <Play className="h-4 w-4" />
                Watch 60s Explainer
              </button>
              <Link
                to={chatHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <MessageSquareText className="h-4 w-4" />
                Ask AI Copilot
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Secure enterprise access
              </div>
              <div className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-cyan-300" />
                Live decision support
              </div>
              {!isAuthenticated ? <div className="text-slate-500">Sign in is required before entering the dashboard.</div> : null}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={sectionReveal} className="relative min-w-0">
            <div className="absolute inset-x-10 top-4 h-28 rounded-full bg-cyan-400/12 blur-3xl" />
            <HeroDashboardMockup />
          </motion.div>
        </section>

        <motion.section
          id="explainer"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="py-14"
        >
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                <Play className="h-4 w-4" />
                Product Demo
              </div>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                See ChainPulse in action
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                Watch how ChainPulse detects disruptions, activates 16 AI agents, and turns risk signals into revenue-protecting action in one animated flow.
              </p>
            </div>

            <div className="mt-10">
              <ProductDemo ctaHref={appHref} />
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { value: "16", label: "AI Agents", icon: Bot },
                { value: "<5 min", label: "Response Time", icon: Zap },
                { value: "$1M+", label: "Revenue Protected", icon: ShieldCheck },
                { value: "92%", label: "Detection Accuracy", icon: Radar }
              ].map((item, index) => (
                <motion.div key={item.label} custom={index} variants={cardReveal}>
                  <GlassCard className="h-full rounded-[26px] p-5 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20">
                      <item.icon className="h-6 w-6 text-cyan-100" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.label}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="tour"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="landing-anchor-section pb-14"
        >
          <GlassCard className="rounded-[32px] p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-5">
              {stats.map((stat, index) => (
                <motion.div key={stat.label} custom={index} variants={cardReveal} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white md:text-4xl">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.section>

        <motion.section
          id="features"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="py-14"
        >
          <SectionHeading
            eyebrow="Platform intelligence"
            title="An enterprise-grade control tower built for disruption response"
            description="Every surface is designed to feel like a command system, not a generic marketing site - from multi-agent orchestration to board-ready financial visibility."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div key={feature.title} custom={index} variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                <GlassCard className={`h-full ${feature.className}`}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-500/20">
                    <feature.icon className="h-6 w-6 text-cyan-100" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="showcase"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-14"
        >
          <SectionHeading
            eyebrow="Platform showcase"
            title="Six premium surfaces for operators, planners, and executives"
            description="Each workspace is purpose-built for a different decision context, while still connected through one shared intelligence layer."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {showcaseCards.map((card, index) => (
              <motion.div key={card.title} custom={index} variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                <GlassCard className="group h-full transition duration-300 hover:-translate-y-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <card.icon className="h-6 w-6 text-cyan-100" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{card.description}</p>
                  <div className="mt-6 h-32 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-4">
                    <div className="flex h-full items-end gap-3">
                      {[45, 70, 52, 82, 63].map((height, barIndex) => (
                        <span
                          key={`${card.title}-${height}-${barIndex}`}
                          className="flex-1 rounded-t-2xl"
                          style={{
                            height: `${height}%`,
                            background: showcaseBarGradients[barIndex % showcaseBarGradients.length]
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="workflow"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-14"
        >
          <GlassCard className="rounded-[36px] p-7 md:p-10">
            <SectionHeading
              eyebrow="How it works"
              title="From live monitoring to confident executive action"
              description="The platform turns fragmented operational signals into orchestrated actions across teams, suppliers, and stakeholders."
            />

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step, index) => (
                <motion.div key={step} custom={index} variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                  <div className="h-full rounded-[28px] border border-white/10 bg-white/[0.05] p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.08] text-lg font-semibold text-cyan-100">
                      0{index + 1}
                    </div>
                    <p className="mt-5 text-base leading-7 text-slate-200">{step}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.section>

        <motion.section
          id="capabilities"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="landing-anchor-section py-14"
        >
          <SectionHeading
            eyebrow="Advanced capabilities"
            title="A modular intelligence layer ready for enterprise operations"
            description="Scale the platform beyond visibility with AI-driven capabilities that extend into planning, sustainability, communication, and decision automation."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((capability, index) => (
              <motion.div key={capability.label} custom={index} variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                <GlassCard className="flex h-full items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20">
                    <capability.icon className="h-5 w-5 text-cyan-100" />
                  </div>
                  <p className="text-sm font-medium text-slate-200">{capability.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="testimonials"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-14"
        >
          <SectionHeading
            eyebrow="Testimonials"
            title="Built to earn trust from operations leaders"
            description="The experience is designed for directors, COOs, and logistics leaders who need faster answers, better recommendations, and cleaner executive visibility."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <motion.div key={item.name} custom={index} variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                <GlassCard className="h-full">
                  <p className="text-base leading-8 text-slate-200">"{item.quote}"</p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-sm font-semibold text-white">
                      {item.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-sm text-slate-400">
                        {item.title} - {item.company}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="pricing"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="landing-anchor-section py-14"
        >
          <SectionHeading
            eyebrow="Pricing"
            title="Enterprise packaging for serious supply networks"
            description="Start with a pilot, scale into a regional command center, or deploy globally with deeper controls and integrations."
            align="center"
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {pricing.map((tier, index) => (
              <motion.div key={tier.name} custom={index} variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                <GlassCard className={`h-full ${tier.featured ? "border-cyan-300/30 bg-white/[0.11]" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">{tier.name}</p>
                      <p className="mt-4 text-4xl font-semibold text-white">{tier.price}</p>
                      <p className="mt-2 text-sm text-slate-400">{tier.subtitle}</p>
                    </div>
                    {tier.featured ? (
                      <div className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        Most Popular
                      </div>
                    ) : null}
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-300">{tier.description}</p>

                  <div className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm text-slate-200">
                        <Check className="h-4 w-4 text-cyan-200" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Link
                    to={appHref}
                    className={`mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                      tier.featured
                        ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white"
                        : "border border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                    }`}
                  >
                    Book a Demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="faq"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="landing-anchor-section py-14"
        >
          <SectionHeading
            eyebrow="Most asked questions"
            title="Answers teams ask most before and after rollout"
            description="A quick overview of deployment, integrations, executive usage, ROI, and how customers can report issues through the platform."
          />

          <div className="mt-10 space-y-4">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index
              return (
                <GlassCard key={item.question} className="p-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-lg font-medium text-white">{item.question}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-sm leading-7 text-slate-300">{item.answer}</div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </GlassCard>
              )
            })}
          </div>
        </motion.section>

        <motion.section
          id="contact"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="landing-anchor-section py-14"
        >
          <GlassCard className="relative overflow-hidden rounded-[36px] p-8 md:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/90">Final CTA</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                  Turn Supply Chain Chaos Into Competitive Advantage
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Deploy AI agents that monitor, predict, and mitigate disruptions before they impact revenue.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to={appHref}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
                  >
                    Book a Demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={chatHref}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                  >
                    <Bot className="h-4 w-4" />
                    Ask AI Copilot
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                {contactMethods.map((item) => (
                  <div key={item.label} className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20">
                        <item.icon className="h-5 w-5 text-cyan-100" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">{item.label}</p>
                        <p className="mt-1 font-medium text-white">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.section>

        <footer className="pb-6 pt-10">
          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
            <ChainPulseLogo
              theme="dark"
              subtitle="Supply Chain Disruption Agent for enterprise resilience teams."
              metaClassName="text-slate-400"
            />

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              {navItems.map((item) => (
                <SectionNavButton
                  key={item.label}
                  label={item.label}
                  targetId={item.targetId}
                  previewKey={`footer-${item.targetId}`}
                  preview={navPreviewContent[item.targetId]}
                  previewAlign={item.previewAlign}
                  previewId={`footer-preview-${item.targetId}`}
                  isOpen={activePreviewKey === `footer-${item.targetId}`}
                  onOpenPreview={openPreview}
                  onClosePreview={closePreview}
                  onInteract={handleNavInteraction}
                  className="transition hover:text-white"
                />
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
