"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { parkingSpots } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Car,
  MapPin,
  Shield,
  Zap,
  Minus,
  Plus,
  Clock,
} from "lucide-react"

export function CarParkDetailsScreen() {
  const { navigate, params, goBack } = useApp()
  const spot = parkingSpots.find((s) => s.id === params.spotId) || parkingSpots[0]
  const [hours, setHours] = useState(2)
  const [minutes, setMinutes] = useState(0)
  const [coveredParking, setCoveredParking] = useState(spot.hasCovered)
  const [evCharging, setEvCharging] = useState(false)

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={goBack} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">Car Park Details</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Info card */}
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-xl font-bold text-foreground">{spot.name}</h2>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {spot.address}
          </div>

          <div className="mt-5 flex gap-3">
            <InfoBadge
              icon={<Clock className="h-4 w-4 text-accent" />}
              label="Price"
              value={`${spot.pricePerHour} KZT/hr`}
            />
            <InfoBadge
              icon={<Car className="h-4 w-4 text-accent" />}
              label="Available"
              value={`${spot.availableSpots}/${spot.totalSpots}`}
            />
          </div>
        </div>

        {/* Duration selector */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Select Duration</h3>
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">Hours</span>
                <div className="mt-1 flex items-center gap-4">
                  <button
                    onClick={() => setHours(Math.max(0, hours - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground"
                    aria-label="Decrease hours"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-2xl font-bold text-foreground">{hours}</span>
                  <button
                    onClick={() => setHours(hours + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground"
                    aria-label="Increase hours"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-3xl font-light text-border">:</div>
              <div>
                <span className="text-sm text-muted-foreground">Minutes</span>
                <div className="mt-1 flex items-center gap-4">
                  <button
                    onClick={() => setMinutes(Math.max(0, minutes - 15))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground"
                    aria-label="Decrease minutes"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-2xl font-bold text-foreground">
                    {String(minutes).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => setMinutes(Math.min(45, minutes + 15))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground"
                    aria-label="Increase minutes"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle options */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Options</h3>
          <div className="flex flex-col gap-3">
            <ToggleOption
              icon={<Shield className="h-5 w-5 text-accent" />}
              label="Covered Parking"
              description="Protected from weather"
              checked={coveredParking}
              onChange={setCoveredParking}
            />
            <ToggleOption
              icon={<Zap className="h-5 w-5 text-accent" />}
              label="EV Charging"
              description="Electric vehicle charging available"
              checked={evCharging}
              onChange={setEvCharging}
            />
          </div>
        </div>

        {/* Price summary */}
        <div className="mt-6 rounded-2xl bg-accent/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated Total</span>
            <span className="text-2xl font-bold text-foreground">
              {Math.round((hours + minutes / 60) * spot.pricePerHour)} KZT
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            className="h-14 rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
            onClick={() => navigate("booking-payment", { spotId: spot.id, hours: String(hours), minutes: String(minutes) })}
          >
            Enter Now
          </Button>
          <Button
            variant="outline"
            className="h-14 rounded-xl border-border text-base font-semibold text-foreground hover:bg-secondary"
            onClick={() => navigate("booking-payment", { spotId: spot.id, hours: String(hours), minutes: String(minutes) })}
          >
            Reserve for Another Time
          </Button>
        </div>
      </div>
    </div>
  )
}

function InfoBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-xl bg-secondary p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function ToggleOption({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
