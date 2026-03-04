"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

export interface AuthUser {
  id: number
  email: string
  name: string
  phone: string | null
  carNumber: string | null
  avatar: string | null
}

interface AppContextType {
  user: AuthUser | null
  token: string | null
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
}

const AppContext = createContext<AppContextType | null>(null)

const STORAGE_KEY = "parking_app_auth"

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { user: AuthUser; token: string }
      if (parsed?.token && parsed?.user) {
        setUser(parsed.user)
        setToken(parsed.token)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const persistAuth = useCallback((nextUser: AuthUser | null, nextToken: string | null) => {
    if (typeof window === "undefined") return
    if (nextUser && nextToken) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: nextUser, token: nextToken }),
      )
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const setAuth = useCallback(
    (nextUser: AuthUser, nextToken: string) => {
      setUser(nextUser)
      setToken(nextToken)
      persistAuth(nextUser, nextToken)
    },
    [persistAuth],
  )

  const clearAuth = useCallback(() => {
    setUser(null)
    setToken(null)
    persistAuth(null, null)
  }, [persistAuth])

  return (
    <AppContext.Provider value={{ user, token, setAuth, clearAuth }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
