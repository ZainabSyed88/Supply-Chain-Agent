import { createContext, useContext, useEffect, useMemo, useState } from "react"

const USERS_KEY = "chainpulse_auth_users"
const SESSION_KEY = "chainpulse_auth_session"

const AuthContext = createContext(null)

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]")
  } catch {
    return []
  }
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null")
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => loadUsers())
  const [user, setUser] = useState(() => loadSession())

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [user])

  const signIn = async ({ email, password }) => {
    const existingUser = users.find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password
    )
    if (!existingUser) {
      throw new Error("Invalid email or password.")
    }

    const nextUser = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email
    }
    setUser(nextUser)
    return nextUser
  }

  const signUp = async ({ name, email, password }) => {
    const duplicate = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase())
    if (duplicate) {
      throw new Error("An account with this email already exists.")
    }

    const createdUser = {
      id: `${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      password
    }
    setUsers((prev) => [...prev, createdUser])

    const nextUser = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email
    }
    setUser(nextUser)
    return nextUser
  }

  const signOut = () => {
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signOut
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
