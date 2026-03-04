"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { getUserProfileApi, updateUserProfileApi, type UserProfileDto } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Camera } from "lucide-react"

export function ProfileScreen() {
  const { goBack, token, navigate } = useApp()
  const [profile, setProfile] = useState<UserProfileDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    carNumber: "",
  })

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
      goBack()
    } catch (err) {
      console.error("Failed to save profile", err)
    } finally {
      setSaving(false)
    }
  }

  if (!token) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background gap-4">
        <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>
        <Button variant="outline" onClick={() => navigate("login")}>Go to Login</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const avatar = profile?.avatar || "U"

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={goBack} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">My Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Avatar */}
        <div className="mb-8 flex flex-col items-center">
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

        {/* Form fields */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Full Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 rounded-xl border-border bg-card text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Email</Label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 rounded-xl border-border bg-card text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Phone Number</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="h-12 rounded-xl border-border bg-card text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Car Number</Label>
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
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
