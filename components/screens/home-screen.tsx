"use client"

import { useEffect, useState } from "react"
import { useApp } from "@/lib/app-context"
import { parkingSpots as mockParkingSpots, type ParkingSpot } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Navigation,
  Search,
  Car,
  Clock,
  Settings,
  User,
  Menu,
  ChevronUp,
} from "lucide-react"
import dynamic from "next/dynamic"
import { getParkingSpotsApi } from "@/lib/api"
const AlmatyMap = dynamic(() => import("@/components/almaty-map").then(m => m.AlmatyMap), { ssr: false })

export function HomeScreen() {
  const { navigate } = useApp()
  const [spots, setSpots] = useState<ParkingSpot[]>(mockParkingSpots)
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot>(mockParkingSpots[0])
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const apiSpots = await getParkingSpotsApi()
        if (!cancelled && apiSpots.length > 0) {
          const normalized = apiSpots.map((s) => ({
            ...s,
          })) as ParkingSpot[]
          setSpots(normalized)
          setSelectedSpot(normalized[0])
        }
      } catch (err) {
        console.error("Failed to load parking spots from API, using mock data.", err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative flex h-full flex-col bg-background">
      {/* Map area */}
      <div className="relative flex-1 bg-muted">
        {/* Real interactive Almaty map */}
        <AlmatyMap
          spots={spots}
          selectedSpotId={selectedSpot.id}
          onSpotClick={(spot) => {
            setSelectedSpot(spot)
            setSheetOpen(true)
          }}
          onMapClick={() => setSheetOpen(false)}
        />

        {/* Search bar */}
        <div className="absolute top-14 right-4 left-4 z-[1000]">
          <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-lg">
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-muted-foreground">Search parking in Almaty...</span>
            <button className="rounded-xl bg-secondary p-2" aria-label="Menu">
              <Menu className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Current location button */}
        <button
          className="absolute right-4 bottom-4 z-[999] flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-lg"
          aria-label="Center on my location"
        >
          <Navigation className="h-5 w-5 text-accent" />
        </button>
      </div>

      {/* Bottom Sheet + Nav wrapper */}
      <div className="absolute right-0 bottom-0 left-0 z-[1000] flex flex-col">
        {/* Parking detail sheet */}
        {sheetOpen && selectedSpot && (
          <div className="rounded-t-3xl bg-card px-5 pt-3 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <button
              onClick={() => setSheetOpen(false)}
              className="mx-auto mb-3 block h-1 w-10 rounded-full bg-border"
              aria-label="Close bottom sheet"
            />

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{selectedSpot.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedSpot.address}
                </div>
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary"
                aria-label="Close"
              >
                <ChevronUp className="h-4 w-4 text-muted-foreground rotate-180" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2">
                <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{selectedSpot.distance}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2">
                <Car className="h-3.5 w-3.5 text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {selectedSpot.availableSpots} spots
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {selectedSpot.pricePerHour} KZT/hr
                </span>
              </div>
            </div>

            <Button
              className="mt-4 h-12 w-full rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
              onClick={() => navigate("carpark-details", { spotId: selectedSpot.id })}
            >
              View Car Park
            </Button>
          </div>
        )}

        {/* Bottom Nav - always visible */}
        <div className="flex items-center justify-around border-t border-border bg-card px-2 pb-6 pt-2">
          <NavItem icon={<MapPin className="h-5 w-5" />} label="Explore" active onClick={() => {}} />
          <NavItem icon={<Clock className="h-5 w-5" />} label="History" onClick={() => navigate("parking-history")} />
          <NavItem icon={<Settings className="h-5 w-5" />} label="Settings" onClick={() => navigate("settings")} />
          <NavItem icon={<User className="h-5 w-5" />} label="Profile" onClick={() => navigate("profile")} />
        </div>
      </div>
    </div>
  )
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 ${active ? "text-accent" : "text-muted-foreground"}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
