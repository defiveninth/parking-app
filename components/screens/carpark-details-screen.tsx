"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getParkingSpotApi, getUserProfileApi, createBookingApi, type ParkingSpotDto, type UserProfileDto } from "@/lib/api"
import { useApp } from "@/lib/app-context"
import { useTranslation } from "@/lib/i18n/language-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Car,
  MapPin,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
  DoorOpen,
  CalendarClock,
} from "lucide-react"

export function CarParkDetailsScreen({ spotId }: { spotId: string }) {
  const router = useRouter()
  const { token } = useApp()
  const { t } = useTranslation()
  const [spot, setSpot] = useState<ParkingSpotDto | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [coveredParking, setCoveredParking] = useState(false)
  const [evCharging, setEvCharging] = useState(false)
  const [showNegativeBalanceAlert, setShowNegativeBalanceAlert] = useState(false)
  const [showNoSpotsAlert, setShowNoSpotsAlert] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const RESERVATION_FEE = 500

  useEffect(() => {
    if (!spotId) return
    let cancelled = false
    setLoading(true)
    
    const fetchData = async () => {
      try {
        const spotData = await getParkingSpotApi(spotId)
        if (!cancelled) {
          setSpot(spotData)
          setCoveredParking(!!spotData.hasCovered)
        }
        
        if (token) {
          const profileData = await getUserProfileApi(token)
          if (!cancelled) {
            setUserProfile(profileData)
          }
        }
      } catch (err) {
        console.error("Failed to load data", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    
    fetchData()
    return () => { cancelled = true }
  }, [spotId, token])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t("carpark.loading")}</p>
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background gap-4">
        <p className="text-sm text-muted-foreground">{t("carpark.notFound")}</p>
        <Button variant="outline" onClick={() => router.back()}>{t("carpark.goBack")}</Button>
      </div>
    )
  }

  const userBalance = userProfile?.balance ?? 0
  const hasNegativeBalance = userBalance < 0
  const hasNoAvailableSpots = spot.availableSpots <= 0

  async function handleEnterNow() {
    if (!token) {
      router.push("/login")
      return
    }
    if (hasNegativeBalance) {
      setShowNegativeBalanceAlert(true)
      return
    }
    if (hasNoAvailableSpots) {
      setShowNoSpotsAlert(true)
      return
    }

    // Create booking with "enter_now" type - no prepayment, pay on exit
    setSubmitting(true)
    setError(null)
    try {
      const booking = await createBookingApi(token, {
        parkingSpotId: Number(spot.id),
        price: 0, // No prepayment for enter now - pay on exit
        duration: "Pay on exit",
        durationMinutes: 0,
        date: "Today",
        startTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        endTime: "—",
        bookingType: "enter_now",
      })
      router.push(`/booking/confirmation?spotId=${spot.id}&bookingId=${booking.id}&type=enter_now`)
    } catch (err: any) {
      setError(err?.message || "Failed to create booking")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReserveLater() {
    if (!token) {
      router.push("/login")
      return
    }
    if (hasNegativeBalance) {
      setShowNegativeBalanceAlert(true)
      return
    }
    if (hasNoAvailableSpots) {
      setShowNoSpotsAlert(true)
      return
    }

    // Create booking with "book_later" type - pay reservation fee immediately
    setSubmitting(true)
    setError(null)
    try {
      const booking = await createBookingApi(token, {
        parkingSpotId: Number(spot.id),
        price: RESERVATION_FEE, // Reservation fee
        duration: "Reserved (6h window)",
        durationMinutes: 0,
        date: "Today",
        startTime: "Later",
        endTime: "—",
        bookingType: "book_later",
      })
      router.push(`/booking/confirmation?spotId=${spot.id}&bookingId=${booking.id}&type=book_later&fee=${RESERVATION_FEE}`)
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
        <h1 className="flex-1 text-lg font-bold text-foreground">{t("carpark.title")}</h1>
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
              label={t("carpark.price")}
              value={`${spot.pricePerHour} KZT/hr`}
            />
            <InfoBadge
              icon={<Car className="h-4 w-4 text-accent" />}
              label={t("carpark.available")}
              value={`${spot.availableSpots}/${spot.totalSpots}`}
            />
          </div>
        </div>

        {/* How it works */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">{t("carpark.howItWorks")}</h3>
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">1</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t("carpark.step1Title")}</p>
                  <p className="text-xs text-muted-foreground">{t("carpark.step1Desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">2</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t("carpark.step2Title")}</p>
                  <p className="text-xs text-muted-foreground">{t("carpark.step2Desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">3</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t("carpark.step3Title")}</p>
                  <p className="text-xs text-muted-foreground">{t("carpark.step3Desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle options */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">{t("carpark.options")}</h3>
          <div className="flex flex-col gap-3">
            <ToggleOption
              icon={<Shield className="h-5 w-5 text-accent" />}
              label={t("carpark.coveredParking")}
              description={t("carpark.coveredDesc")}
              checked={coveredParking}
              onChange={setCoveredParking}
            />
            <ToggleOption
              icon={<Zap className="h-5 w-5 text-accent" />}
              label={t("carpark.evCharging")}
              description={t("carpark.evDesc")}
              checked={evCharging}
              onChange={setEvCharging}
            />
          </div>
        </div>

        {/* Pricing info */}
        <div className="mt-6 rounded-2xl bg-secondary/50 p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("carpark.hourlyRate")}</span>
              <span className="text-sm font-semibold text-foreground">{spot.pricePerHour} KZT/hr</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("carpark.reservationFee")}</span>
              <span className="text-sm font-semibold text-foreground">{RESERVATION_FEE} KZT</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            className="h-14 rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
            onClick={handleEnterNow}
            disabled={submitting}
          >
            <DoorOpen className="mr-2 h-5 w-5" />
            {submitting ? t("common.loading") : t("carpark.enterNow")}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t("carpark.enterNowDesc")}</p>
          
          <div className="my-2 flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">{t("carpark.or")}</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <Button
            variant="outline"
            className="h-14 rounded-xl border-border text-base font-semibold text-foreground hover:bg-secondary"
            onClick={handleReserveLater}
            disabled={submitting}
          >
            <CalendarClock className="mr-2 h-5 w-5" />
            {t("carpark.reserveAnother")} ({RESERVATION_FEE} KZT)
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t("carpark.reserveDesc")}</p>
        </div>
      </div>

      {/* Negative Balance Alert */}
      <AlertDialog open={showNegativeBalanceAlert} onOpenChange={setShowNegativeBalanceAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">{t("carpark.negativeBalanceTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t("carpark.negativeBalanceDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90"
              onClick={() => router.push("/profile")}
            >
              {t("carpark.topUpNow")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* No Spots Available Alert */}
      <AlertDialog open={showNoSpotsAlert} onOpenChange={setShowNoSpotsAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Car className="h-8 w-8 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">{t("carpark.noSpotsTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t("carpark.noSpotsDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90"
              onClick={() => setShowNoSpotsAlert(false)}
            >
              {t("common.goBack")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
