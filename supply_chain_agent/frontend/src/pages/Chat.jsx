import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Copy, MessageSquareText, Plus, Send, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react"
import { useLocation } from "react-router-dom"
import clsx from "clsx"
import Spinner from "../components/ui/Spinner"
import { api } from "../utils/api"
import { FOLLOW_UPS } from "../utils/constants"

const STORAGE_KEY = "chainpulse-chat-sessions"

const createSession = () => ({
  id: `${Date.now()}`,
  title: "New conversation",
  updatedAt: new Date().toISOString(),
  messages: []
})

export default function Chat() {
  const location = useLocation()
  const bottomRef = useRef(null)
  const promptRef = useRef(null)
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

  const sendMessage = async (messageText = draft) => {
    const trimmed = messageText.trim()
    if (!trimmed || loading) return

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed
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
      const response = await api.chat(
        includeLiveData ? `${trimmed}\n\nUse current ChainPulse platform data when relevant.` : trimmed,
        activeSession.messages
      )
      const aiMessage = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        content: response.response,
        confidence: `${Math.max(84, 97 - activeSession.messages.length)}% confidence`,
        sources: includeLiveData ? "Based on live dataset and current pipeline context" : "Based on current conversation context",
        feedback: null,
        followUps: FOLLOW_UPS
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
        content: `Copilot is currently unavailable. ${err.message}`,
        confidence: "Service unavailable",
        sources: "No LLM response returned",
        feedback: null,
        followUps: FOLLOW_UPS
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
            {[
              "Which supplier is highest risk?",
              "What shipments are delayed?",
              "Show financial impact",
              "Draft email to top risk supplier",
              "What's our carbon footprint?",
              "Simulate supplier failure"
            ].map((question) => (
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
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-primary">{message.confidence}</span>
                        <span>{message.sources}</span>
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
                      <div className="flex flex-wrap gap-2">
                        {message.followUps?.map((followUp) => (
                          <button
                            key={followUp}
                            type="button"
                            onClick={() => setDraft(followUp)}
                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200"
                          >
                            {followUp}
                          </button>
                        ))}
                      </div>
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
