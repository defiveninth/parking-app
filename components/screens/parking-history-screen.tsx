"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { useTranslation } from "@/lib/i18n/language-context"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  Timer,
  CalendarClock,
  DoorOpen,
  XCircle,
  LogOut,
} from "lucide-react"
import { getBookingsApi, openBarrierApi, type BookingDto } from "@/lib/api"

export function ParkingHistoryScreen() {
  const router = useRouter()
  const { token } = useApp()
  const { t } = useTranslation()
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openingBarrier, setOpeningBarrier] = useState<string | number | null>(null)
  const [barrierError, setBarrierError] = useState<string | null>(null)
  const [barrierSuccess, setBarrierSuccess] = useState<string | null>(null)
  // Tick counter to re-render countdown every 30s
  const [tick, setTick] = useState(0)

  const fetchBookings = useCallback(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    getBookingsApi(token)
      .then((data) => setBookings(data))
      .catch((err: any) => setError(err?.message || "Failed to load bookings"))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Refresh countdown display every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  // Helper: check if a booking's reservation has expired
  function isExpired(booking: BookingDto): boolean {
    if (!booking.expiresAt) return false
    return new Date() > new Date(booking.expiresAt)
  }

  // Helper: human-readable time remaining
  function getTimeRemaining(booking: BookingDto): string {
    if (!booking.expiresAt) return ""
    const diff = new Date(booking.expiresAt).getTime() - Date.now()
    if (diff <= 0) return t("history.expired")
    const totalMinutes = Math.floor(diff / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) return `${hours}h ${minutes}m ${t("history.remaining")}`
    return `${totalMinutes}m ${t("history.remaining")}`
  }

  // Helper: booking type label
  function bookingTypeLabel(booking: BookingDto): string {
    return booking.bookingType === "book_later"
      ? t("history.bookLater")
      : t("history.enterNow")
  }

  // Helper: expiry window label (10 min / 6 h)
  function expiryWindowLabel(booking: BookingDto): string {
    if (booking.bookingType === "book_later") return "6h window"
    return "10 min window"
  }

  // Helper: get elapsed time for active session
  function getElapsedTime(booking: BookingDto): string {
    if (!booking.enteredAt) return booking.duration || "—"
    const enteredAt = new Date(booking.enteredAt)
    const now = new Date()
    const diffMs = now.getTime() - enteredAt.getTime()
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  async function handleOpenBarrier(bookingId: string | number) {
    if (!token) return
    setOpeningBarrier(bookingId)
    setBarrierError(null)
    setBarrierSuccess(null)
    try {
      const result = await openBarrierApi(token, bookingId)
      if (result.success) {
        setBarrierSuccess(t("history.barrierOpened"))
        fetchBookings()
      } else {
        setBarrierError(result.error || "Failed to open barrier")
      }
    } catch (err: any) {
      setBarrierError(err?.message || "Failed to open barrier")
    } finally {
      setOpeningBarrier(null)
    }
  }

  const activeBookings = bookings.filter((b) => b.status === "active")
  const reservedBookings = bookings.filter((b) => b.status === "reserved" && !isExpired(b))
  const expiredBookings = bookings.filter((b) => b.status === "reserved" && isExpired(b))
  const completedBookings = bookings.filter((b) => b.status === "completed")

  // suppress unused tick warning — it's only used to trigger re-render
  void tick

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="rounded-xl p-2 text-foreground hover:bg-secondary"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">{t("history.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Not signed in */}
        {!token && (
          <div className="mb-6 rounded-2xl bg-card p-4 text-sm text-muted-foreground">
            <p className="mb-3">{t("history.signInPrompt")}</p>
            <Button
              className="h-10 rounded-xl bg-foreground text-xs font-semibold text-background hover:bg-foreground/90"
              onClick={() => router.push("/login")}
            >
              {t("history.goToLogin")}
            </Button>
          </div>
        )}

        {token && loading && (
          <p className="mb-4 text-sm text-muted-foreground">{t("history.loadingBookings")}</p>
        )}

        {token && !loading && error && (
          <p className="mb-4 text-sm text-red-500">{error}</p>
        )}

        {/* Barrier Success */}
        {barrierSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm font-medium text-accent">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {barrierSuccess}
          </div>
        )}

        {/* Barrier Error */}
        {barrierError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <XCircle className="h-4 w-4 shrink-0" />
            {barrierError}
          </div>
        )}

        {/* ── Active Sessions ── */}
        {activeBookings.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Timer className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">{t("history.activeSession")}</h2>
            </div>
            <div className="flex flex-col gap-3">
              {activeBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-accent/20 bg-accent/10 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20">
                      <Timer className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{booking.parkingName}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {booking.address}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 font-medium text-accent">
                          <Clock className="h-3 w-3" />
                          {getElapsedTime(booking)}
                        </span>
                        <span className="text-muted-foreground">
                          {booking.pricePerHour || 200} KZT/hr
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Exit Parking Button */}
                  <Button
                    className="mt-3 h-10 w-full rounded-xl bg-foreground text-background hover:bg-foreground/90"
                    onClick={() => router.push(`/end-parking?bookingId=${booking.id}`)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("history.exitParking")}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Reserved (not expired) — show Open Barrier button ── */}
        {reservedBookings.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">{t("history.reserved")}</h2>
            </div>
            <div className="flex flex-col gap-3">
              {reservedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-accent/20 bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20">
                      <CalendarClock className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground">{booking.parkingName}</p>
                        <span className="whitespace-nowrap rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                          {bookingTypeLabel(booking)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {booking.address}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.date} {booking.startTime}
                        </span>
                        {booking.price > 0 && (
                          <span className="font-semibold text-foreground">{booking.price} KZT paid</span>
                        )}
                      </div>
                      {/* Expiry info */}
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="font-medium text-accent">{getTimeRemaining(booking)}</span>
                        <span className="text-muted-foreground">({expiryWindowLabel(booking)})</span>
                      </div>
                    </div>
                  </div>
                  {/* Open Barrier Button */}
                  <Button
                    className="mt-3 h-10 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => handleOpenBarrier(booking.id)}
                    disabled={openingBarrier === booking.id}
                  >
                    <DoorOpen className="mr-2 h-4 w-4" />
                    {openingBarrier === booking.id
                      ? t("history.openingBarrier")
                      : t("history.openBarrier")}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Expired Reservations — no button, show "Expired" badge ── */}
        {expiredBookings.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <h2 className="text-sm font-semibold text-foreground">{t("history.expiredSection")}</h2>
            </div>
            <div className="flex flex-col gap-3">
              {expiredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl bg-card p-4 opacity-60 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10">
                      <XCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground">{booking.parkingName}</p>
                        <span className="whitespace-nowrap rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                          {bookingTypeLabel(booking)}
                        </span>
                      </div>
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
                      <div className="mt-1 text-xs font-medium text-destructive">
                        {t("history.expired")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Completed ── */}
        {completedBookings.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">{t("history.completed")}</h2>
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
                          {booking.duration || `${booking.startTime} - ${booking.endTime}`}
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
          onClick={() => router.push("/home")}
        >
          {t("history.goHome")}
        </Button>
      </div>
    </div>
  )
}
