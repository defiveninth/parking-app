"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { en, type TranslationKey } from "./en"
import { ru } from "./ru"
import { kk } from "./kk"

export type Locale = "en" | "ru" | "kk"

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, ru, kk }

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  kk: "Қазақша",
}

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const STORAGE_KEY = "parking_app_locale"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && dictionaries[stored]) {
      setLocaleState(stored)
    }
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      return dictionaries[locale][key] ?? dictionaries.en[key] ?? key
    },
    [locale],
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider")
  return ctx
}
