"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { useTranslation } from "@/lib/i18n/language-context"
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useApp()
  const { t } = useTranslation()
  const bookingIdParam = searchParams.get("bookingId")

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
          const active = bookingIdParam
            ? data.find((b) => String(b.id) === bookingIdParam)
            : data.find((b) => b.status === "active")
          setBooking(active || data[0] || null)
        }
      })
      .catch((err) => console.error("Failed to load bookings", err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token, bookingIdParam])

  async function handleEndParking() {
    if (!token || !booking) return
    setEnding(true)
    try {
      await updateBookingStatusApi(token, booking.id, "completed")
      router.push("/home")
    } catch (err) {
      console.error("Failed to end parking", err)
    } finally {
      setEnding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
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

        {/* Session info */}
        <div className="mt-8 w-full rounded-2xl bg-card p-5 shadow-sm">
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
                <p className="font-semibold text-foreground">{booking.duration}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{t("endParking.totalPrice")}</p>
                  <p className="text-xl font-bold text-foreground">{booking.price} KZT</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-medium text-accent">{t("endParking.paid")}</span>
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
            {ending ? t("endParking.completing") : t("endParking.exitComplete")}
          </Button>
        </div>
      </div>
    </div>
  )
}
