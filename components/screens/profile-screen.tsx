"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { userProfile } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Camera } from "lucide-react"

export function ProfileScreen() {
  const { goBack } = useApp()
  const [form, setForm] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    carNumber: userProfile.carNumber,
  })

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
              {userProfile.avatar}
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
            onClick={goBack}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
