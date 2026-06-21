import { useCallback, useEffect, useRef, useState } from "react"
import { WS_BASE } from "../utils/constants"

export function useWebSocket(path, onMessage, enabled = true) {
  const socketRef = useRef(null)
  const handlerRef = useRef(onMessage)
  const timeoutRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    handlerRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!enabled || !path) return undefined

    let cancelled = false

    const connect = () => {
      if (cancelled) return
      const socket = new WebSocket(`${WS_BASE}${path}`)
      socketRef.current = socket

      socket.onopen = () => setConnected(true)
      socket.onerror = () => socket.close()
      socket.onclose = () => {
        setConnected(false)
        if (!cancelled) {
          timeoutRef.current = window.setTimeout(connect, 2000)
        }
      }
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          handlerRef.current?.(payload)
        } catch {
          return
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      setConnected(false)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      socketRef.current?.close()
    }
  }, [enabled, path])

  const send = useCallback((data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { connected, send }
}
