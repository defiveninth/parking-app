"use client"

import { useEffect, useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  Timer,
  CalendarClock,
} from "lucide-react"
import { getBookingsApi, type BookingDto } from "@/lib/api"

export function ParkingHistoryScreen() {
  const { navigate, goBack, token } = useApp()
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getBookingsApi(token)
      .then((data) => {
        if (!cancelled) setBookings(data)
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message || "Failed to load bookings")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const activeBookings = bookings.filter((b) => b.status === "active")
  const completedBookings = bookings.filter((b) => b.status === "completed")
  const reservedBookings = bookings.filter((b) => b.status === "reserved")

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={goBack} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">Parking Sessions</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {!token && (
          <div className="mb-6 rounded-2xl bg-card p-4 text-sm text-muted-foreground">
            <p className="mb-3">
              Sign in to see your parking history.
            </p>
            <Button
              className="h-10 rounded-xl bg-foreground text-xs font-semibold text-background hover:bg-foreground/90"
              onClick={() => navigate("login")}
            >
              Go to Login
            </Button>
          </div>
        )}

        {token && loading && (
          <p className="mb-4 text-sm text-muted-foreground">Loading bookings...</p>
        )}

        {token && !loading && error && (
          <p className="mb-4 text-sm text-red-500">{error}</p>
        )}

        {/* Active Sessions */}
        {activeBookings.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Timer className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">Active Session</h2>
            </div>
            {activeBookings.map((booking) => (
              <button
                key={booking.id}
                className="w-full rounded-2xl bg-accent/10 p-4 border border-accent/20"
                onClick={() => navigate("end-parking")}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20">
                    <Timer className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground">{booking.parkingName}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {booking.address}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-accent font-medium">
                        <Clock className="h-3 w-3" />
                        {booking.startTime} - {booking.endTime}
                      </span>
                      <span className="font-semibold text-foreground">{booking.price} KZT</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </section>
        )}

        {/* Reserved */}
        {reservedBookings.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Reserved</h2>
            </div>
            <div className="flex flex-col gap-3">
              {reservedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                      <CalendarClock className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{booking.parkingName}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {booking.address}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.date} {booking.startTime}
                        </span>
                        <span className="font-semibold text-foreground">{booking.price} KZT</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed */}
        {completedBookings.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Completed</h2>
            </div>
            <div className="flex flex-col gap-3">
              {completedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{booking.parkingName}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {booking.address}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.date} {booking.startTime} - {booking.endTime}
                        </span>
                        <span className="font-semibold text-foreground">{booking.price} KZT</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <Button
          className="mt-2 h-14 w-full rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
          onClick={() => navigate("home")}
        >
          Go Back to Home Screen
        </Button>
      </div>
    </div>
  )
}
