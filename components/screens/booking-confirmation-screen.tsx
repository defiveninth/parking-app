"use client"

import { useApp } from "@/lib/app-context"
import { parkingSpots } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  MapPin,
  Clock,
  DollarSign,
  QrCode,
} from "lucide-react"

export function BookingConfirmationScreen() {
  const { navigate, params } = useApp()
  const spot = parkingSpots.find((s) => s.id === params.spotId) || parkingSpots[0]
  const price = params.price || "7.50"
  const duration = params.duration || "2"

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-1 flex-col items-center px-5 pt-20 pb-6">
        {/* Success indicator */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Booking Confirmed</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your parking space is reserved</p>

        {/* QR code */}
        <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm">
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
            <span>Scan at entrance</span>
          </div>
        </div>

        {/* Booking ID */}
        <div className="mt-4 rounded-xl bg-accent/10 px-4 py-2">
          <span className="text-sm font-semibold text-accent">Booking ID: BK-2847</span>
        </div>

        {/* Booking details */}
        <div className="mt-6 w-full rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Booking Details</h3>
          <div className="flex flex-col gap-4">
            <DetailRow
              icon={<MapPin className="h-4 w-4 text-accent" />}
              label="Parking"
              value={spot.name}
            />
            <DetailRow
              icon={<Clock className="h-4 w-4 text-accent" />}
              label="Duration"
              value={`${duration}h 00m`}
            />
            <DetailRow
              icon={<DollarSign className="h-4 w-4 text-accent" />}
              label="Total Price"
              value={`${price} KZT`}
            />
          </div>
        </div>

        <div className="mt-auto w-full pt-6">
          <Button
            className="h-14 w-full rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
            onClick={() => navigate("home")}
          >
            Go Back to Home Screen
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
