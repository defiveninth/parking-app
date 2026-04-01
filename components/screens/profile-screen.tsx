"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { useTranslation } from "@/lib/i18n/language-context"
import { getUserProfileApi, updateUserProfileApi, topUpBalanceApi, type UserProfileDto } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Camera, Wallet, Plus } from "lucide-react"

export function ProfileScreen() {
  const router = useRouter()
  const { token } = useApp()
  const { t } = useTranslation()
  const [profile, setProfile] = useState<UserProfileDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    carNumber: "",
  })
  const [topUpAmount, setTopUpAmount] = useState("")
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [topUpLoading, setTopUpLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    getUserProfileApi(token)
      .then((data) => {
        if (!cancelled) {
          setProfile(data)
          setForm({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            carNumber: data.carNumber || "",
          })
        }
      })
      .catch((err) => console.error("Failed to load profile", err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token])

  async function handleSave() {
    if (!token) return
    setSaving(true)
    try {
      const updated = await updateUserProfileApi(token, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        carNumber: form.carNumber,
      })
      setProfile(updated)
      router.back()
    } catch (err) {
      console.error("Failed to save profile", err)
    } finally {
      setSaving(false)
    }
  }

  async function handleTopUp() {
    if (!token) return
    const amount = parseInt(topUpAmount, 10)
    if (!amount || amount <= 0) return
    setTopUpLoading(true)
    try {
      const updated = await topUpBalanceApi(token, amount)
      setProfile(updated)
      setTopUpAmount("")
      setTopUpOpen(false)
    } catch (err) {
      console.error("Failed to top up", err)
    } finally {
      setTopUpLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background gap-4">
        <p className="text-sm text-muted-foreground">{t("profile.signInPrompt")}</p>
        <Button variant="outline" onClick={() => router.push("/login")}>{t("profile.goToLogin")}</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t("profile.loading")}</p>
      </div>
    )
  }

  const avatar = profile?.avatar || "U"

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={() => router.back()} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">{t("profile.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-foreground text-2xl font-bold text-background">
              {avatar}
            </div>
            <button
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md"
              aria-label="Change profile picture"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-lg font-bold text-foreground">{form.name}</p>
          <p className="text-sm text-muted-foreground">{form.email}</p>
        </div>

        {/* Balance Card */}
        <div className={`mb-6 rounded-2xl p-5 shadow-sm ${(profile?.balance ?? 0) < 0 ? "bg-destructive/10" : "bg-card"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${(profile?.balance ?? 0) < 0 ? "bg-destructive/20" : "bg-accent/10"}`}>
                <Wallet className={`h-6 w-6 ${(profile?.balance ?? 0) < 0 ? "text-destructive" : "text-accent"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("profile.balance")}</p>
                <p className={`text-2xl font-bold ${(profile?.balance ?? 0) < 0 ? "text-destructive" : "text-foreground"}`}>
                  {profile?.balance ?? 0} KZT
                </p>
              </div>
            </div>
            <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                  {t("profile.topUp")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("profile.topUpTitle")}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label>{t("profile.topUpAmount")}</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl"
                        onClick={() => setTopUpAmount(String(amt))}
                      >
                        {amt}
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90"
                    onClick={handleTopUp}
                    disabled={topUpLoading || !topUpAmount}
                  >
                    {topUpLoading ? t("common.loading") : t("profile.topUpConfirm")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {(profile?.balance ?? 0) < 0 && (
            <p className="mt-3 text-sm text-destructive">{t("profile.negativeBalance")}</p>
          )}
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">{t("profile.fullName")}</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 rounded-xl border-border bg-card text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">{t("profile.email")}</Label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 rounded-xl border-border bg-card text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">{t("profile.phone")}</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="h-12 rounded-xl border-border bg-card text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">{t("profile.carNumber")}</Label>
            <Input
              value={form.carNumber}
              onChange={(e) => setForm({ ...form, carNumber: e.target.value })}
              className="h-12 rounded-xl border-border bg-card text-foreground"
            />
          </div>

          <Button
            className="mt-4 h-14 rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t("profile.saving") : t("profile.save")}
          </Button>
        </div>
      </div>
    </div>
  )
}
