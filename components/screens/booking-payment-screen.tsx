"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { parkingSpots } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  ArrowLeft,
  Car,
  Clock,
  MapPin,
  CreditCard,
} from "lucide-react"
import { createBookingApi } from "@/lib/api"

export function BookingPaymentScreen() {
  const { navigate, params, goBack, token } = useApp()
  const spot = parkingSpots.find((s) => s.id === params.spotId) || parkingSpots[0]
  const initialHours = Number(params.hours) || 2
  const [duration, setDuration] = useState([initialHours])
  const price = duration[0] * spot.pricePerHour
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBook() {
    if (!token) {
      navigate("login")
      return
    }
    setError(null)
    setLoading(true)
    try {
      const total = price + 100
      await createBookingApi(token, {
        parkingSpotId: Number(spot.id),
        price: total,
        duration: `${duration[0]}h 00m`,
        durationMinutes: duration[0] * 60,
        date: "Today",
        startTime: "—",
        endTime: "—",
      })
      navigate("booking-confirmation", {
        spotId: spot.id,
        price: String(total),
        duration: String(duration[0]),
      })
    } catch (err: any) {
      setError(err?.message || "Failed to create booking")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={goBack} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">Book Space</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Parking summary */}
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Car className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{spot.name}</h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {spot.address}
              </div>
            </div>
          </div>
        </div>

        {/* Time selector */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Parking Duration</h3>
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">Duration</span>
              </div>
              <span className="text-lg font-bold text-foreground">{duration[0]}h 00m</span>
            </div>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={1}
              max={12}
              step={1}
              className="py-2"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>1h</span>
              <span>6h</span>
              <span>12h</span>
            </div>
          </div>
        </div>

        {/* Price calculation */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Price Summary</h3>
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Parking Fee</span>
                <span className="text-sm font-medium text-foreground">
                  {spot.pricePerHour} KZT x {duration[0]}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Service Fee</span>
                <span className="text-sm font-medium text-foreground">100 KZT</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">{price + 100} KZT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Payment Method</h3>
          <button
            className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm"
            onClick={() => navigate("payment-method")}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
              <CreditCard className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 12/28</p>
            </div>
            <span className="text-xs font-medium text-accent">Change</span>
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Book button */}
        <Button
          className="mt-8 h-14 w-full rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
          onClick={handleBook}
          disabled={loading}
        >
          {loading ? "Processing..." : "Book Space"}
        </Button>
      </div>
    </div>
  )
}
