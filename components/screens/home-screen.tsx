"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { type ParkingSpotDto, getParkingSpotsApi } from "@/lib/api"
import { useTranslation } from "@/lib/i18n/language-context"
import {
  MapPin,
  Navigation,
  Search,
  Clock,
  Settings,
  User,
  X,
  Loader2,
} from "lucide-react"
import dynamic from "next/dynamic"
import type { AlmatyMapHandle } from "@/components/almaty-map"

const AlmatyMap = dynamic(() => import("@/components/almaty-map").then(m => m.AlmatyMap), { ssr: false })

export function HomeScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [spots, setSpots] = useState<ParkingSpotDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const mapRef = useRef<AlmatyMapHandle>(null)

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    setLocationLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocationLoading(false)
        // Center map on user location
        mapRef.current?.centerOnLocation(latitude, longitude)
      },
      (error) => {
        setLocationLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable")
            break
          case error.TIMEOUT:
            setLocationError("Location request timed out")
            break
          default:
            setLocationError("Unable to get location")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [])

  // Try to get location on initial load
  useEffect(() => {
    getUserLocation()
  }, [getUserLocation])

  const filteredSpots = searchQuery.trim().length > 0
    ? spots.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getParkingSpotsApi()
      .then((apiSpots) => {
        if (!cancelled && apiSpots.length > 0) {
          setSpots(apiSpots)
        }
      })
      .catch((err) => {
        console.error("Failed to load parking spots from API.", err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative flex h-full flex-col bg-background">
      {/* Map area */}
      <div className="relative flex-1 bg-muted">
        <AlmatyMap
          ref={mapRef}
          spots={spots}
          selectedSpotId={null}
          onSpotClick={(spot) => {
            router.push(`/parking/${spot.id}`)
          }}
          onMapClick={() => {}}
          userLocation={userLocation}
        />

        {/* Search bar */}
        <div className="absolute top-14 right-4 left-4 z-[1000]">
          <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-lg">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("home.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => setSearchQuery("")}
                className="rounded-xl bg-secondary p-2"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {searchFocused && searchQuery.trim().length > 0 && (
            <div className="mt-2 max-h-72 overflow-y-auto rounded-2xl bg-card shadow-lg">
              {filteredSpots.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {t("home.noSpotsFound")}
                </div>
              ) : (
                filteredSpots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => {
                      setSearchQuery("")
                      router.push(`/parking/${spot.id}`)
                    }}
                    className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-secondary/50"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{spot.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{spot.address}</p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs text-accent">{spot.availableSpots} {t("home.spots")}</span>
                        <span className="text-xs text-muted-foreground">{spot.pricePerHour} T/hr</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Location error toast */}
        {locationError && (
          <div className="absolute right-4 bottom-24 z-999 rounded-lg bg-destructive/90 px-3 py-2 text-xs text-destructive-foreground shadow-lg">
            {locationError}
            <button
              onClick={() => setLocationError(null)}
              className="ml-2 font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav wrapper */}
      <div className="absolute right-0 bottom-0 left-0 z-1000 flex flex-col">
        {/* Current location button - right bottom corner above nav */}
        <div className="flex justify-end px-4 pb-4">
          <button
            onClick={getUserLocation}
            disabled={locationLoading}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-lg transition-transform active:scale-95 disabled:opacity-70"
            aria-label="Center on my location"
          >
            {locationLoading ? (
              <Loader2 className="h-5 w-5 text-accent animate-spin" />
            ) : (
              <Navigation className={`h-5 w-5 ${userLocation ? "text-accent" : "text-muted-foreground"}`} />
            )}
          </button>
        </div>
        <div className="flex items-center justify-around border-t border-border bg-card px-2 pb-6 pt-2">
          <NavItem icon={<MapPin className="h-5 w-5" />} label={t("nav.explore")} active onClick={() => {}} />
          <NavItem icon={<Clock className="h-5 w-5" />} label={t("nav.history")} onClick={() => router.push("/history")} />
          <NavItem icon={<Settings className="h-5 w-5" />} label={t("nav.settings")} onClick={() => router.push("/settings")} />
          <NavItem icon={<User className="h-5 w-5" />} label={t("nav.profile")} onClick={() => router.push("/profile")} />
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
