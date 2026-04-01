"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getParkingSpotApi, type ParkingSpotDto } from "@/lib/api"
import { useTranslation } from "@/lib/i18n/language-context"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  MapPin,
  Clock,
  DollarSign,
  QrCode,
  Timer,
  CalendarClock,
} from "lucide-react"

export function BookingConfirmationScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [spot, setSpot] = useState<ParkingSpotDto | null>(null)

  const spotId = searchParams.get("spotId") || ""
  const bookingId = searchParams.get("bookingId") || "BK-0000"
  const bookingType = searchParams.get("type") || "enter_now"
  const fee = searchParams.get("fee") || "0"

  const isEnterNow = bookingType === "enter_now"
  const isBookLater = bookingType === "book_later"

  useEffect(() => {
    if (!spotId) return
    let cancelled = false
    getParkingSpotApi(spotId)
      .then((data) => { if (!cancelled) setSpot(data) })
      .catch((err) => console.error("Failed to load spot", err))
    return () => { cancelled = true }
  }, [spotId])

  const spotName = spot?.name || "Parking"

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-1 flex-col items-center px-5 pt-14 pb-6 overflow-y-auto">
        {/* Close / back button */}
        <div className="flex w-full items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => router.push("/home")}
            aria-label="Close"
          >
            {"✕"}
          </Button>
        </div>
        
        {/* Success indicator */}
        <div className="mb-6 mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("bookingConfirm.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("bookingConfirm.subtitle")}</p>

        {/* Booking Type Badge */}
        <div className="mt-4 flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2">
          {isEnterNow ? (
            <>
              <Timer className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">{t("bookingConfirm.enterNowType")}</span>
            </>
          ) : (
            <>
              <CalendarClock className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">{t("bookingConfirm.bookLaterType")}</span>
            </>
          )}
        </div>

        {/* QR code */}
        <div className="mt-6 rounded-2xl bg-card p-6 shadow-sm">
          <div className="flex h-44 w-44 items-center justify-center rounded-2xl bg-foreground">
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-6 w-6 rounded-sm ${
                    [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24, 6, 12, 18].includes(i)
                      ? "bg-card"
                      : "bg-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <QrCode className="h-4 w-4" />
            <span>{t("bookingConfirm.scanAtEntrance")}</span>
          </div>
        </div>

        {/* Booking ID */}
        <div className="mt-4 rounded-xl bg-accent/10 px-4 py-2">
          <span className="text-sm font-semibold text-accent">{t("bookingConfirm.bookingId")}: {bookingId}</span>
        </div>

        {/* Instructions based on booking type */}
        <div className="mt-6 w-full rounded-2xl bg-secondary/50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">{t("bookingConfirm.nextSteps")}</h3>
          {isEnterNow ? (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>1. {t("bookingConfirm.enterNowStep1")}</p>
              <p>2. {t("bookingConfirm.enterNowStep2")}</p>
              <p>3. {t("bookingConfirm.enterNowStep3")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>1. {t("bookingConfirm.bookLaterStep1")}</p>
              <p>2. {t("bookingConfirm.bookLaterStep2")}</p>
              <p>3. {t("bookingConfirm.bookLaterStep3")}</p>
            </div>
          )}
        </div>

        {/* Booking details */}
        <div className="mt-6 w-full rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("bookingConfirm.details")}</h3>
          <div className="flex flex-col gap-4">
            <DetailRow
              icon={<MapPin className="h-4 w-4 text-accent" />}
              label={t("bookingConfirm.parking")}
              value={spotName}
            />
            <DetailRow
              icon={<Clock className="h-4 w-4 text-accent" />}
              label={t("bookingConfirm.validFor")}
              value={isEnterNow ? t("bookingConfirm.tenMinutes") : t("bookingConfirm.sixHours")}
            />
            {isBookLater && Number(fee) > 0 && (
              <DetailRow
                icon={<DollarSign className="h-4 w-4 text-accent" />}
                label={t("bookingConfirm.reservationFee")}
                value={`${fee} KZT`}
              />
            )}
            <DetailRow
              icon={<DollarSign className="h-4 w-4 text-accent" />}
              label={t("bookingConfirm.parkingCost")}
              value={isEnterNow ? t("bookingConfirm.payOnExit") : t("bookingConfirm.payOnExit")}
            />
          </div>
        </div>

        <div className="mt-auto w-full pt-6 flex flex-col gap-3">
          <Button
            className="h-14 w-full rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
            onClick={() => router.push("/history")}
          >
            {t("bookingConfirm.viewBookings")}
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl text-base font-semibold"
            onClick={() => router.push("/home")}
          >
            {t("bookingConfirm.goHome")}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}
