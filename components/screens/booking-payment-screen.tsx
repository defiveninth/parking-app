"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { useTranslation } from "@/lib/i18n/language-context"
import { getParkingSpotApi, type ParkingSpotDto, createBookingApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  ArrowLeft,
  Car,
  Clock,
  MapPin,
  CreditCard,
} from "lucide-react"

export function BookingPaymentScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useApp()
  const { t } = useTranslation()

  const spotId = searchParams.get("spotId") || ""
  const initialHours = Number(searchParams.get("hours")) || 2
  const bookingType = searchParams.get("type") || "enter" // "enter" or "reserve"

  const [spot, setSpot] = useState<ParkingSpotDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [duration, setDuration] = useState([initialHours])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const RESERVATION_FEE = 500
  const isReservation = bookingType === "reserve"

  useEffect(() => {
    if (!spotId) return
    let cancelled = false
    setLoading(true)
    getParkingSpotApi(spotId)
      .then((data) => { if (!cancelled) setSpot(data) })
      .catch((err) => console.error("Failed to load spot", err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [spotId])

  if (loading || !spot) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  // For reservations, price is fixed at RESERVATION_FEE
  // For "enter now", price will be calculated by time spent (but we show estimated based on duration selected)
  const estimatedPrice = duration[0] * spot.pricePerHour
  const price = isReservation ? RESERVATION_FEE : estimatedPrice

  async function handleBook() {
    if (!token) {
      router.push("/login")
      return
    }
    if (!spot) return
    setError(null)
    setSubmitting(true)
    try {
      const serviceFee = 100
      const total = price + serviceFee
      const booking = await createBookingApi(token, {
        parkingSpotId: Number(spot.id),
        price: total,
        duration: isReservation ? "Reserved" : `${duration[0]}h 00m`,
        durationMinutes: isReservation ? 0 : duration[0] * 60,
        date: "Today",
        startTime: isReservation ? "Later" : "Now",
        endTime: "—",
        bookingType: isReservation ? "book_later" : "enter_now",
      })
      router.push(`/booking/confirmation?spotId=${spot.id}&price=${total}&duration=${duration[0]}&bookingId=${booking.id}&type=${bookingType}`)
    } catch (err: any) {
      setError(err?.message || "Failed to create booking")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={() => router.back()} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">{t("bookingPayment.title")}</h1>
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
          <h3 className="mb-3 text-sm font-semibold text-foreground">{t("bookingPayment.parkingDuration")}</h3>
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">{t("bookingPayment.duration")}</span>
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
          <h3 className="mb-3 text-sm font-semibold text-foreground">{t("bookingPayment.priceSummary")}</h3>
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-3">
              {isReservation ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("carpark.reservationFee")}</span>
                  <span className="text-sm font-medium text-foreground">{RESERVATION_FEE} KZT</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("bookingPayment.parkingFee")}</span>
                  <span className="text-sm font-medium text-foreground">
                    {spot.pricePerHour} KZT x {duration[0]}h
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("bookingPayment.serviceFee")}</span>
                <span className="text-sm font-medium text-foreground">100 KZT</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">{t("bookingPayment.total")}</span>
                  <span className="text-xl font-bold text-foreground">{price + 100} KZT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">{t("bookingPayment.paymentMethod")}</h3>
          <button
            className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm"
            onClick={() => router.push("/payment-method")}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
              <CreditCard className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">{t("bookingPayment.visaEnding")}</p>
              <p className="text-xs text-muted-foreground">{t("bookingPayment.expires")}</p>
            </div>
            <span className="text-xs font-medium text-accent">{t("bookingPayment.change")}</span>
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
          disabled={submitting}
        >
          {submitting ? t("bookingPayment.processing") : t("bookingPayment.bookSpace")}
        </Button>
      </div>
    </div>
  )
}
