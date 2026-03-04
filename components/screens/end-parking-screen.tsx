"use client"

import { useEffect, useState } from "react"
import { useApp } from "@/lib/app-context"
import { getBookingsApi, updateBookingStatusApi, type BookingDto } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Car,
  CheckCircle2,
} from "lucide-react"

export function EndParkingScreen() {
  const { navigate, goBack, token, params } = useApp()
  const [booking, setBooking] = useState<BookingDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [ending, setEnding] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    getBookingsApi(token)
      .then((data) => {
        if (!cancelled) {
          // Find the active booking (or the one passed via params)
          const active = params.bookingId
            ? data.find((b) => String(b.id) === params.bookingId)
            : data.find((b) => b.status === "active")
          setBooking(active || data[0] || null)
        }
      })
      .catch((err) => console.error("Failed to load bookings", err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token, params.bookingId])

  async function handleEndParking() {
    if (!token || !booking) return
    setEnding(true)
    try {
      await updateBookingStatusApi(token, booking.id, "completed")
      navigate("home")
    } catch (err) {
      console.error("Failed to end parking", err)
    } finally {
      setEnding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background gap-4">
        <p className="text-sm text-muted-foreground">No active parking session found.</p>
        <Button variant="outline" onClick={goBack}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={goBack} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">End Parking</h1>
      </div>

      <div className="flex flex-1 flex-col items-center px-5 pb-6">
        {/* Car illustration */}
        <div className="my-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent/10">
          <Car className="h-12 w-12 text-accent" />
        </div>

        <h2 className="text-xl font-bold text-foreground">Ready to leave?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Here's your parking session summary"}
        </p>

        {/* Session info */}
        <div className="mt-8 w-full rounded-2xl bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Parking Location</p>
                <p className="font-semibold text-foreground">{booking.parkingName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time Spent</p>
                <p className="font-semibold text-foreground">{booking.duration}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Total Price</p>
                  <p className="text-xl font-bold text-foreground">{booking.price} KZT</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-medium text-accent">Paid</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto w-full pt-6">
          <Button
            className="h-14 w-full rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
            onClick={handleEndParking}
            disabled={ending}
          >
            {ending ? "Completing..." : "Exit and Complete Parking"}
          </Button>
        </div>
      </div>
    </div>
  )
}
