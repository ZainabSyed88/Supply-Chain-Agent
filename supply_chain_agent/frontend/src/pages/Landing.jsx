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
import { useState } from "react"
import { Link } from "react-router-dom"
import ProductDemo from "../components/ProductDemo"
import { useAuth } from "../hooks/useAuth"

const navItems = [
  { label: "About", href: "#about" },
  { label: "Tour", href: "#tour" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" }
]

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

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const [openFaq, setOpenFaq] = useState(0)

  const appHref = isAuthenticated ? "/dashboard" : "/auth?redirect=%2Fdashboard"
  const chatHref = isAuthenticated ? "/chat" : "/auth?redirect=%2Fchat"
  const authCta = isAuthenticated ? "Open App" : "Sign In"

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050816] text-white">
      <div className="landing-orb landing-orb-cyan" />
      <div className="landing-orb landing-orb-blue" />
      <div className="landing-orb landing-orb-purple" />
      <div className="landing-grid absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(54,162,255,0.18),_transparent_28%),linear-gradient(180deg,_rgba(5,8,22,0.32),_#050816_34%,_#050816)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sticky top-4 z-40 rounded-[28px] border border-white/12 bg-white/[0.08] px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-[30px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-[0_12px_30px_rgba(59,130,246,0.45)]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">ChainPulse</p>
                <p className="text-sm text-slate-300">Supply Chain Disruption Agent</p>
              </div>
            </div>

            <nav className="hidden items-center gap-6 lg:flex">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="text-sm text-slate-300 transition hover:text-white">
                  {item.label}
                </a>
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

        <section className="grid gap-12 pb-14 pt-12 lg:grid-cols-[1.02fr,0.98fr] lg:items-center" id="about">
          <motion.div initial="hidden" animate="visible" variants={sectionReveal}>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
              <Sparkles className="h-4 w-4" />
              Fortune 500 disruption intelligence, reimagined
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">
              Predict Supply Chain Disruptions Before They Cost Millions
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              An AI-powered multi-agent intelligence platform that monitors suppliers, analyzes global events,
              forecasts risks, and recommends mitigation strategies in real time.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={appHref}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(59,130,246,0.35)] transition hover:scale-[1.02]"
              >
                Request Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#explainer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.11]"
              >
                <Play className="h-4 w-4" />
                Watch 60s Explainer
              </a>
              <Link
                to={chatHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <MessageSquareText className="h-4 w-4" />
                Ask AI Copilot
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-400">
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

          <motion.div initial="hidden" animate="visible" variants={sectionReveal} className="relative">
            <GlassCard className="relative overflow-hidden p-4 md:p-5">
              <div className="absolute inset-x-8 top-0 h-28 rounded-full bg-cyan-400/15 blur-3xl" />
              <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-4">
                  <GlassCard className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Command Center</p>
                        <h3 className="mt-2 text-2xl font-semibold">Global Risk Map</h3>
                      </div>
                      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                        Live
                      </div>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-white/10 bg-[#0b1229]/80 p-4">
                      <div className="relative h-56 overflow-hidden rounded-[20px] bg-[radial-gradient(circle_at_25%_35%,_rgba(34,211,238,0.2),_transparent_18%),radial-gradient(circle_at_65%_55%,_rgba(168,85,247,0.2),_transparent_20%),linear-gradient(135deg,_rgba(15,23,42,0.85),_rgba(30,41,59,0.55))]">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.04)_1px,_transparent_1px),linear-gradient(0deg,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:32px_32px]" />
                        {[
                          "top-[26%] left-[22%] bg-emerald-400/70",
                          "top-[48%] left-[62%] bg-rose-400/75",
                          "top-[62%] left-[36%] bg-amber-300/70"
                        ].map((item) => (
                          <span key={item} className={`absolute h-4 w-4 rounded-full blur-[1px] ${item}`} />
                        ))}
                        <svg viewBox="0 0 420 200" className="absolute inset-0 h-full w-full opacity-80">
                          <path d="M20 130 C80 120, 110 70, 160 88 S245 150, 300 96 S360 70, 400 102" fill="none" stroke="url(#pulseLine)" strokeWidth="4" strokeLinecap="round" />
                          <defs>
                            <linearGradient id="pulseLine" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#22d3ee" />
                              <stop offset="55%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {[
                          { label: "Active disruptions", value: "18" },
                          { label: "Revenue at risk", value: "$4.8M" },
                          { label: "Suppliers impacted", value: "27" }
                        ].map((item) => (
                          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                            <p className="text-xs text-slate-400">{item.label}</p>
                            <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>

                  <div className="grid gap-4 md:grid-cols-2">
                    <GlassCard className="p-5">
                      <p className="text-sm text-slate-400">Revenue impact meter</p>
                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "68%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, delay: 0.2 }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                        />
                      </div>
                      <p className="mt-4 text-3xl font-semibold">$12.6M</p>
                      <p className="mt-2 text-sm text-slate-400">Modeled exposure if no mitigation actions are taken.</p>
                    </GlassCard>

                    <GlassCard className="p-5">
                      <p className="text-sm text-slate-400">Multi-agent workflow</p>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        {[Truck, Radar, Workflow, ShieldCheck].map((Icon, index) => (
                          <div key={index} className="flex flex-1 items-center gap-2">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
                              <Icon className="h-5 w-5 text-cyan-200" />
                            </div>
                            {index < 3 ? <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/60 to-violet-400/30" /> : null}
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-slate-400">Supplier monitor → event intelligence → mitigation planner → stakeholder alerting</p>
                    </GlassCard>
                  </div>
                </div>

                <div className="space-y-4">
                  <GlassCard className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Risk heatmap</p>
                        <p className="mt-2 text-xl font-semibold">Regional stress signals</p>
                      </div>
                      <LineChart className="h-5 w-5 text-violet-300" />
                    </div>
                    <div className="mt-5 grid grid-cols-4 gap-2">
                      {Array.from({ length: 16 }).map((_, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0.4, scale: 0.94 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.03, duration: 0.35 }}
                          className={`aspect-square rounded-2xl ${
                            index % 5 === 0
                              ? "bg-rose-400/55"
                              : index % 3 === 0
                                ? "bg-amber-300/45"
                                : "bg-cyan-400/25"
                          }`}
                        />
                      ))}
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-violet-500/30">
                        <Bot className="h-5 w-5 text-cyan-100" />
                      </div>
                      <div>
                        <p className="font-medium text-white">AI Copilot</p>
                        <p className="text-sm text-slate-400">Decision-ready guidance</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
                        Which suppliers are most exposed to Red Sea route delays this week?
                      </div>
                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.08] p-3 text-sm text-cyan-50">
                        3 tier-1 suppliers show elevated risk. Recommended actions: reroute 2 shipments, pull forward inventory, and engage alternate source in Malaysia.
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5">
                    <p className="text-sm text-slate-400">Mitigation queue</p>
                    <div className="mt-4 space-y-3">
                      {["Activate alternate supplier", "Re-sequence inventory allocation", "Notify commercial leadership"].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                          <span className="text-sm text-slate-200">{item}</span>
                          <ArrowRight className="h-4 w-4 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>
            </GlassCard>
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
          className="pb-14"
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
            description="Every surface is designed to feel like a command system, not a generic marketing site — from multi-agent orchestration to board-ready financial visibility."
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
                      {[45, 70, 52, 82, 63].map((height) => (
                        <span key={height} className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-500/20 to-cyan-300/55" style={{ height: `${height}%` }} />
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
          className="py-14"
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
                  <p className="text-base leading-8 text-slate-200">“{item.quote}”</p>
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
                        {item.title} · {item.company}
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
          className="py-14"
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
          className="py-14"
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
          className="py-14"
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
                {[
                  { icon: Mail, label: "Email", value: "enterprise@chainpulse.ai" },
                  { icon: Phone, label: "Phone", value: "+1 (555) 014-2026" },
                  { icon: Globe2, label: "Coverage", value: "Global supplier and logistics networks" }
                ].map((item) => (
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
            <div>
              <p className="font-semibold text-white">ChainPulse</p>
              <p className="mt-1 text-sm text-slate-500">Supply Chain Disruption Agent for enterprise resilience teams.</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
