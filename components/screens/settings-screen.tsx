"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { useTranslation } from "@/lib/i18n/language-context"
import { localeLabels, type Locale } from "@/lib/i18n/language-context"
import {
  ArrowLeft,
  CreditCard,
  User,
  Globe,
  FileText,
  Shield,
  ChevronRight,
  LogOut,
  Check,
  X,
  MessageCircle,
} from "lucide-react"

export function SettingsScreen() {
  const router = useRouter()
  const { clearAuth } = useApp()
  const { t, locale, setLocale } = useTranslation()
  const [showLangPicker, setShowLangPicker] = useState(false)

  const settingsItems = [
    { icon: CreditCard, label: t("settings.paymentMethod"), href: "/payment-method" },
    { icon: User, label: t("settings.account"), href: "/profile" },
    { icon: MessageCircle, label: t("support.title"), href: "/support" },
    { icon: Globe, label: t("settings.language"), href: null, action: () => setShowLangPicker(true) },
    { icon: FileText, label: t("settings.termsOfUse"), href: null },
    { icon: Shield, label: t("settings.privacyPolicy"), href: null },
  ]

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={() => router.back()} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">{t("settings.title")}</h1>
      </div>

      <div className="flex-1 px-5 pb-6">
        <div className="rounded-2xl bg-card shadow-sm">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              className={`flex w-full items-center gap-4 px-5 py-4 ${
                index < settingsItems.length - 1 ? "border-b border-border" : ""
              }`}
              onClick={() => {
                if (item.action) {
                  item.action()
                } else if (item.href) {
                  router.push(item.href)
                }
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <item.icon className="h-5 w-5 text-foreground" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
              {item.icon === Globe && (
                <span className="text-xs text-muted-foreground">{localeLabels[locale]}</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          className="mt-6 flex w-full items-center gap-4 rounded-2xl bg-card px-5 py-4 shadow-sm"
          onClick={() => {
            clearAuth()
            router.push("/login")
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-destructive">{t("settings.logOut")}</span>
        </button>
      </div>

      {/* Language picker overlay */}
      {showLangPicker && (
        <div className="absolute inset-0 z-50 flex items-end bg-foreground/40">
          <div
            className="w-full rounded-t-3xl bg-card px-5 pb-8 pt-5 shadow-2xl animate-in slide-in-from-bottom duration-300"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t("settings.chooseLanguage")}</h2>
              <button
                onClick={() => setShowLangPicker(false)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {(Object.keys(localeLabels) as Locale[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocale(loc)
                    setShowLangPicker(false)
                  }}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-colors ${
                    locale === loc
                      ? "bg-accent/10 border border-accent/30"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  <Globe className={`h-5 w-5 ${locale === loc ? "text-accent" : "text-muted-foreground"}`} />
                  <span className={`flex-1 text-left text-sm font-medium ${locale === loc ? "text-accent" : "text-foreground"}`}>
                    {localeLabels[loc]}
                  </span>
                  {locale === loc && (
                    <Check className="h-5 w-5 text-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
