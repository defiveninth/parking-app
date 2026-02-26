"use client"

import { useApp } from "@/lib/app-context"
import {
  ArrowLeft,
  CreditCard,
  User,
  Globe,
  FileText,
  Shield,
  ChevronRight,
  LogOut,
} from "lucide-react"

const settingsItems = [
  { icon: CreditCard, label: "Payment Method", screen: "payment-method" as const },
  { icon: User, label: "Account", screen: "profile" as const },
  { icon: Globe, label: "Language", screen: null },
  { icon: FileText, label: "Terms of Use", screen: null },
  { icon: Shield, label: "Privacy Policy", screen: null },
]

export function SettingsScreen() {
  const { navigate, goBack } = useApp()

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={goBack} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">Settings</h1>
      </div>

      <div className="flex-1 px-5 pb-6">
        <div className="rounded-2xl bg-card shadow-sm">
          {settingsItems.map((item, index) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-4 px-5 py-4 ${
                index < settingsItems.length - 1 ? "border-b border-border" : ""
              }`}
              onClick={() => item.screen && navigate(item.screen)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <item.icon className="h-5 w-5 text-foreground" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          className="mt-6 flex w-full items-center gap-4 rounded-2xl bg-card px-5 py-4 shadow-sm"
          onClick={() => navigate("login")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-destructive">Log Out</span>
        </button>
      </div>
    </div>
  )
}
