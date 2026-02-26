"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

export type Screen =
  | "splash"
  | "login"
  | "signup"
  | "otp"
  | "home"
  | "carpark-details"
  | "booking-payment"
  | "booking-confirmation"
  | "end-parking"
  | "settings"
  | "profile"
  | "payment-method"
  | "parking-history"

export interface AuthUser {
  id: number
  email: string
  name: string
  phone: string | null
  carNumber: string | null
  avatar: string | null
}

interface AppContextType {
  screen: Screen
  navigate: (screen: Screen, params?: Record<string, string>) => void
  params: Record<string, string>
  goBack: () => void
  history: Screen[]
  user: AuthUser | null
  token: string | null
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
}

const AppContext = createContext<AppContextType | null>(null)

const STORAGE_KEY = "parking_app_auth"

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("splash")
  const [params, setParams] = useState<Record<string, string>>({})
  const [history, setHistory] = useState<Screen[]>(["splash"])
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

  const navigate = useCallback((newScreen: Screen, newParams?: Record<string, string>) => {
    setScreen(newScreen)
    if (newParams) setParams(newParams)
    setHistory((prev) => [...prev, newScreen])
  }, [])

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev
      const newHistory = prev.slice(0, -1)
      const previousScreen = newHistory[newHistory.length - 1]
      setScreen(previousScreen)
      return newHistory
    })
  }, [])

  return (
    <AppContext.Provider
      value={{ screen, navigate, params, goBack, history, user, token, setAuth, clearAuth }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

