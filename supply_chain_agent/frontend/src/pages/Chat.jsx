import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Copy, FileDown, Mic, MicOff, Plus, Send, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react"
import { useLocation, useOutletContext } from "react-router-dom"
import clsx from "clsx"
import Spinner from "../components/ui/Spinner"
import { api } from "../utils/api"

const STORAGE_KEY = "chainpulse-chat-sessions"
const SUGGESTED_QUESTIONS = [
  "Which suppliers are highest risk right now?",
  "Show me all delayed shipments and their impact",
  "Which disruption has the highest revenue impact?",
  "Draft an email to our riskiest supplier",
  "What is our total revenue at risk?",
  "Give me an executive summary of supply chain health",
  "Which suppliers should I switch away from?",
  "What would happen if our top supplier failed?",
  "Show me suppliers by risk score ranking",
  "Which shipments are delayed in the next 7 days?"
]

const createSession = () => ({
  id: `${Date.now()}`,
  title: "New conversation",
  updatedAt: new Date().toISOString(),
  messages: []
})

const getConfidenceValue = (message) => (typeof message.confidence === "number" ? message.confidence : null)

const getConfidenceLabel = (message) => {
  if (typeof message.confidence === "string") return message.confidence
  if (typeof message.confidence === "number" && message.confidence > 0) {
    return `${Math.round(message.confidence * 100)}% confidence`
  }
  return null
}

const getConfidenceBadgeClass = (confidence) => {
  if (typeof confidence !== "number") return "bg-slate-100 text-slate-500"
  if (confidence > 0.85) return "bg-emerald-100 text-emerald-700"
  if (confidence > 0.7) return "bg-amber-100 text-amber-700"
  return "bg-slate-100 text-slate-500"
}

export default function Chat() {
  const location = useLocation()
  const { refreshLatestRun } = useOutletContext()
  const bottomRef = useRef(null)
  const promptRef = useRef(null)
  const recognitionRef = useRef(null)
  const listeningSeedRef = useRef("")
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : [createSession()]
  })
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : [createSession()]
    return parsed[0]?.id
  })
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [includeLiveData, setIncludeLiveData] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speechMessage, setSpeechMessage] = useState("")
  const [reportLoading, setReportLoading] = useState(false)
  const [reportMessage, setReportMessage] = useState("")

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [sessions, activeSessionId, loading])

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) || sessions[0],
    [activeSessionId, sessions]
  )

  useEffect(() => {
    const prompt = location.state?.prompt
    if (!prompt || promptRef.current === prompt) return
    promptRef.current = prompt
    setDraft(prompt)
  }, [location.state])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
      setSpeechMessage("Voice input is not supported in this browser.")
      return undefined
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setSpeechMessage("Listening...")
    }

    recognition.onresult = (event) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || ""
        if (event.results[index].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const base = listeningSeedRef.current.trim()
      const transcript = `${finalTranscript} ${interimTranscript}`.trim()
      setDraft([base, transcript].filter(Boolean).join(base && transcript ? "\n" : ""))
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      setSpeechMessage(event.error === "not-allowed" ? "Microphone permission was blocked." : "Voice input stopped unexpectedly.")
    }

    recognition.onend = () => {
      setIsListening(false)
      setSpeechMessage((current) => (current === "Listening..." ? "Voice input paused." : current))
    }

    recognitionRef.current = recognition
    setSpeechSupported(true)
    setSpeechMessage("Tap the mic to dictate your prompt.")

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [])

  const updateActiveSession = (updater) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === activeSession.id ? updater(session) : session))
    )
  }

  const createNewChat = () => {
    const next = createSession()
    setSessions((prev) => [next, ...prev])
    setActiveSessionId(next.id)
    setDraft("")
  }

  const toggleVoiceInput = () => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      return
    }

    listeningSeedRef.current = draft
    setSpeechMessage("")
    recognition.start()
  }

  const waitForPipelineCompletion = async (runId) => {
    const startedAt = Date.now()

    while (Date.now() - startedAt < 120000) {
      const run = await api.getPipelineStatus(runId)

      if (run.status === "completed") {
        return run
      }

      if (run.status === "failed") {
        throw new Error(run.errors?.[0] || "Pipeline run failed while generating the PDF report.")
      }

      await new Promise((resolve) => window.setTimeout(resolve, 2000))
    }

    throw new Error("PDF report generation timed out. Please try again from Reports.")
  }

  const downloadReport = async (runId) => {
    const blob = await api.downloadReport(runId)
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `chainpulse-report-${runId}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(link.href)
  }

  const generatePdfReport = async () => {
    if (reportLoading) return

    setReportLoading(true)
    setReportMessage("Starting report pipeline...")

    try {
      const result = await api.runPipeline()
      setReportMessage("Generating PDF report...")
      const run = await waitForPipelineCompletion(result.run_id)
      await downloadReport(run.run_id)
      await refreshLatestRun?.()
      setReportMessage("PDF report is ready and downloading.")
    } catch (err) {
      setReportMessage(err.message || "Unable to generate the PDF report.")
    } finally {
      setReportLoading(false)
    }
  }

  const sendMessage = async (messageText = draft) => {
    const trimmed = messageText.trim()
    if (!trimmed || loading) return
    const sessionId = activeSession.id
    const history = activeSession.messages.slice(-6).map((message) => ({
      role: message.role,
      content: message.content,
      session_id: sessionId
    }))

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString()
    }

    updateActiveSession((session) => ({
      ...session,
      title: session.messages.length ? session.title : trimmed.slice(0, 34),
      updatedAt: new Date().toISOString(),
      messages: [...session.messages, userMessage]
    }))
    setDraft("")
    setLoading(true)

    try {
      const response = await api.chat(trimmed, history, sessionId, includeLiveData)
      const aiMessage = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        content: response.response,
        confidence: response.confidence,
        modelUsed: response.model_used,
        contextUsed: response.context_used,
        feedback: null,
        followUps: response.follow_up_questions || [],
        timestamp: new Date().toISOString()
      }
      updateActiveSession((session) => ({
        ...session,
        updatedAt: new Date().toISOString(),
        messages: [...session.messages, aiMessage]
      }))
    } catch (err) {
      const fallbackMessage = {
        id: `${Date.now()}-fallback`,
        role: "assistant",
        content: "Sorry, I couldn't connect to the backend. Please check the API is running.",
        confidence: 0,
        feedback: null,
        followUps: [],
        timestamp: new Date().toISOString()
      }
      updateActiveSession((session) => ({
        ...session,
        updatedAt: new Date().toISOString(),
        messages: [...session.messages, fallbackMessage]
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid h-[calc(100vh-11rem)] gap-6 xl:grid-cols-[280px,1fr]">
      <aside className="flex h-full flex-col rounded-lg border bg-white p-4 shadow-card">
        <button
          type="button"
          onClick={createNewChat}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Suggested questions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => setDraft(question)}
                className="rounded-full bg-slate-100 px-3 py-2 text-left text-xs text-slate-600 transition hover:bg-slate-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto scrollbar-thin">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent conversations</p>
          <div className="mt-3 space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setActiveSessionId(session.id)}
                className={clsx(
                  "w-full rounded-lg border px-3 py-3 text-left transition",
                  session.id === activeSessionId ? "border-primary bg-blue-50" : "bg-slate-50 hover:bg-slate-100"
                )}
              >
                <p className="line-clamp-1 text-sm font-medium text-slate-900">{session.title}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(session.updatedAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex h-full flex-col rounded-lg border bg-slate-50 shadow-card">
        <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin">
          <div className="space-y-5">
            {activeSession.messages.map((message) => (
              <div
                key={message.id}
                className={clsx("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={clsx(
                    "max-w-3xl rounded-2xl px-4 py-3",
                    message.role === "user" ? "bg-primary text-white" : "border bg-white shadow-card"
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                  {message.role === "assistant" ? (
                    <div className="mt-4 space-y-3 border-t pt-3">
                      {(() => {
                        const confidenceValue = getConfidenceValue(message)
                        const confidenceLabel = getConfidenceLabel(message)
                        const followUps = message.followUps || message.follow_ups || []
                        const modelUsed = message.modelUsed || message.model_used
                        const hasContext = Boolean(message.contextUsed || message.context_used)
                        const sourceText = message.sources

                        return (
                          <>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              {confidenceLabel ? (
                                <span className={clsx("rounded-full px-2.5 py-1 font-medium", getConfidenceBadgeClass(confidenceValue))}>
                                  {confidenceLabel}
                                </span>
                              ) : null}
                              {hasContext ? <span>Based on live dataset and current pipeline context</span> : null}
                              {!hasContext && sourceText ? <span>{sourceText}</span> : null}
                              {modelUsed ? <span className="text-slate-400">{modelUsed}</span> : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  await navigator.clipboard.writeText(message.content)
                                  setCopiedId(message.id)
                                  window.setTimeout(() => setCopiedId(null), 1500)
                                }}
                                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                              >
                                {copiedId === message.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                Copy
                              </button>
                              <button type="button" className="rounded-full border p-2 text-slate-600 hover:bg-slate-50">
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" className="rounded-full border p-2 text-slate-600 hover:bg-slate-50">
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {followUps.length ? (
                              <div className="flex flex-wrap gap-2">
                                {followUps.map((followUp) => (
                                  <button
                                    key={followUp}
                                    type="button"
                                    onClick={() => sendMessage(followUp)}
                                    className="rounded-full bg-slate-100 px-3 py-1.5 text-left text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    {followUp}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </>
                        )
                      })()}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border bg-white px-4 py-3 shadow-card">
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm text-slate-500">Copilot is thinking...</span>
                  </div>
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t bg-white px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={includeLiveData} onChange={(event) => setIncludeLiveData(event.target.checked)} />
              Include live data
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generatePdfReport}
                disabled={reportLoading}
                className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-blue-50 px-3 py-2 text-sm font-semibold text-primary hover:bg-blue-100 disabled:opacity-60"
              >
                <FileDown className="h-4 w-4" />
                {reportLoading ? "Generating PDF..." : "Generate PDF"}
              </button>
              <button
                type="button"
                onClick={() =>
                  updateActiveSession((session) => ({
                    ...session,
                    messages: [],
                    updatedAt: new Date().toISOString(),
                    title: "New conversation"
                  }))
                }
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Trash2 className="h-4 w-4" />
                Clear chat
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{reportMessage || speechMessage}</span>
            {isListening ? <span className="font-medium text-emerald-600">Mic active</span> : null}
          </div>
          <div className="flex gap-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              rows={3}
              placeholder="Ask ChainPulse Copilot anything about suppliers, shipments, risks, or ESG..."
              className="min-h-[88px] flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={!speechSupported}
              className={clsx(
                "inline-flex h-fit items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                isListening ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title={speechSupported ? "Use voice input" : "Voice input is not supported in this browser"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Stop" : "Voice"}
            </button>
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={loading}
              className="inline-flex h-fit items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
