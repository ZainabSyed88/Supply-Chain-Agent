import { createContext, useEffect, useMemo, useState } from "react"
import { api } from "../utils/api"

const SESSION_KEY = "chainpulse_auth_session"

export const AuthContext = createContext(null)

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null")
  } catch {
    return null
  }
}

function persistSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession())
  const [isReady, setIsReady] = useState(false)
  const user = session?.user || null

  useEffect(() => {
    const restore = async () => {
      if (!session?.accessToken) {
        setIsReady(true)
        return
      }
      try {
        const currentUser = await api.getCurrentUser()
        setSession((prev) => (prev ? { ...prev, user: currentUser } : null))
      } catch {
        setSession(null)
      } finally {
        setIsReady(true)
      }
    }
    restore()
  }, [])

  useEffect(() => {
    persistSession(session)
  }, [session])

  const signIn = async ({ username, password }) => {
    const authResponse = await api.login(username, password)
    const nextSession = {
      accessToken: authResponse.access_token,
      refreshToken: authResponse.refresh_token,
      user: authResponse.user
    }
    persistSession(nextSession)
    setSession(nextSession)
    setIsReady(true)
    return authResponse.user
  }

  const signUp = async ({ fullName, username, email, password }) => {
    await api.register({
      full_name: fullName,
      username,
      email,
      password
    })
    return signIn({ username, password })
  }

  const signOut = async () => {
    try {
      await api.signOut()
    } catch {
      return
    } finally {
      persistSession(null)
      setSession(null)
      setIsReady(true)
    }
  }

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isReady,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signOut
    }),
    [isReady, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
