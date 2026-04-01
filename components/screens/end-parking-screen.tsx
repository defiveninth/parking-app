"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { useTranslation } from "@/lib/i18n/language-context"
import { getBookingsApi, exitBarrierApi, type BookingDto, type ExitBarrierResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Car,
  CheckCircle2,
  Timer,
  DoorOpen,
} from "lucide-react"

export function EndParkingScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useApp()
  const { t } = useTranslation()
  const bookingIdParam = searchParams.get("bookingId")

  const [booking, setBooking] = useState<BookingDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [exiting, setExiting] = useState(false)
  const [exitResult, setExitResult] = useState<ExitBarrierResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Live timer for active sessions
  const [elapsedTime, setElapsedTime] = useState<string>("")
  const [estimatedCost, setEstimatedCost] = useState<number>(0)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    getBookingsApi(token)
      .then((data) => {
        if (!cancelled) {
          const active = bookingIdParam
            ? data.find((b) => String(b.id) === bookingIdParam)
            : data.find((b) => b.status === "active")
          setBooking(active || null)
        }
      })
      .catch((err) => console.error("Failed to load bookings", err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token, bookingIdParam])

  // Update elapsed time and estimated cost every second for active booking
  useEffect(() => {
    if (!booking || booking.status !== "active" || !booking.enteredAt) return

    const updateTimer = () => {
      const enteredAt = new Date(booking.enteredAt!)
      const now = new Date()
      const diffMs = now.getTime() - enteredAt.getTime()
      const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60

      setElapsedTime(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)

      // Calculate estimated cost (billed per hour, rounded up)
      const billedHours = Math.max(1, Math.ceil(diffMinutes / 60))
      const pricePerHour = booking.pricePerHour || 200
      setEstimatedCost(billedHours * pricePerHour)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [booking])

  async function handleExitParking() {
    if (!token || !booking) return
    setExiting(true)
    setError(null)
    try {
      const result = await exitBarrierApi(token, booking.id)
      if (result.success) {
        setExitResult(result)
      } else {
        setError(result.error || "Failed to exit parking")
      }
    } catch (err: any) {
      setError(err?.message || "Failed to exit parking")
    } finally {
      setExiting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  // Show success screen after exit
  if (exitResult) {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex flex-1 flex-col items-center px-5 pt-14 pb-6">
          {/* Success indicator */}
          <div className="my-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-12 w-12 text-accent" />
          </div>

          <h2 className="text-xl font-bold text-foreground">{t("endParking.exitSuccess")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("endParking.barrierOpened")}
          </p>

          {/* Exit summary */}
          <div className="mt-8 w-full rounded-2xl bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t("endParking.sessionSummary")}</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("endParking.parkingLocation")}</p>
                  <p className="font-semibold text-foreground">{booking?.parkingName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("endParking.timeSpent")}</p>
                  <p className="font-semibold text-foreground">{exitResult.duration}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                    <DollarSign className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{t("endParking.totalCharged")}</p>
                    <p className="text-xl font-bold text-foreground">{exitResult.cost} KZT</p>
                    <p className="text-xs text-muted-foreground">
                      {exitResult.billedHours}h x {exitResult.pricePerHour} KZT/hr
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-secondary p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("endParking.newBalance")}</span>
                  <span className={`text-lg font-bold ${(exitResult.newBalance ?? 0) < 0 ? "text-destructive" : "text-foreground"}`}>
                    {exitResult.newBalance} KZT
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto w-full pt-6">
            <Button
              className="h-14 w-full rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
              onClick={() => router.push("/home")}
            >
              {t("endParking.goHome")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background gap-4">
        <p className="text-sm text-muted-foreground">{t("endParking.noSession")}</p>
        <Button variant="outline" onClick={() => router.back()}>{t("endParking.goBack")}</Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={() => router.back()} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">{t("endParking.title")}</h1>
      </div>

      <div className="flex flex-1 flex-col items-center px-5 pb-6">
        {/* Car illustration */}
        <div className="my-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent/10">
          <Car className="h-12 w-12 text-accent" />
        </div>

        <h2 className="text-xl font-bold text-foreground">{t("endParking.readyToLeave")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("endParking.summary")}
        </p>

        {/* Live timer badge */}
        {booking.status === "active" && booking.enteredAt && (
          <div className="mt-4 flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2">
            <Timer className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm font-semibold text-accent">{elapsedTime}</span>
          </div>
        )}

        {/* Session info */}
        <div className="mt-6 w-full rounded-2xl bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("endParking.parkingLocation")}</p>
                <p className="font-semibold text-foreground">{booking.parkingName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("endParking.timeSpent")}</p>
                <p className="font-semibold text-foreground">{elapsedTime || booking.duration}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{t("endParking.estimatedCost")}</p>
                  <p className="text-xl font-bold text-foreground">{estimatedCost} KZT</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.pricePerHour || 200} KZT/hr ({t("endParking.billedPerHour")})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        <div className="mt-auto w-full pt-6">
          <Button
            className="h-14 w-full rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
            onClick={handleExitParking}
            disabled={exiting}
          >
            <DoorOpen className="mr-2 h-5 w-5" />
            {exiting ? t("endParking.processing") : t("endParking.exitAndPay")}
          </Button>
        </div>
      </div>
    </div>
  )
}
