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
  Car,
  Route,
} from "lucide-react"
import dynamic from "next/dynamic"
import type { AlmatyMapHandle, RouteInfo } from "@/components/almaty-map"

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
  const [nearestParking, setNearestParking] = useState<ParkingSpotDto | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [findingNearest, setFindingNearest] = useState(false)
  // routeDestination is a separate stable ref updated only on button click,
  // so GPS location changes never cause a new object to be passed to the map.
  const [routeDestination, setRouteDestination] = useState<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef<AlmatyMapHandle>(null)

  // Calculate straight-line distance for finding nearest (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  // Handle route info from map component (real road distance/duration)
  const handleRouteCalculated = useCallback((info: RouteInfo | null) => {
    setRouteInfo(info)
  }, [])

  // Find nearest parking spot
  const findNearestParking = useCallback(() => {
    if (!userLocation || spots.length === 0) {
      setLocationError("Please enable location to find nearest parking")
      return
    }

    setFindingNearest(true)

    // Find the nearest spot with available spaces (using straight-line for initial search)
    let nearest: ParkingSpotDto | null = null
    let minDistance = Infinity

    spots.forEach((spot) => {
      if (spot.availableSpots > 0) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          spot.lat,
          spot.lng
        )
        if (distance < minDistance) {
          minDistance = distance
          nearest = spot
        }
      }
    })

    if (nearest) {
      setNearestParking(nearest)
      // Set the destination once here – this is the only place it changes
      setRouteDestination({ lat: nearest.lat, lng: nearest.lng })
      // Route info will be set by onRouteCalculated callback from map
    } else {
      setLocationError("No available parking spots found")
    }

    setFindingNearest(false)
  }, [userLocation, spots, calculateDistance])

  // Clear route and nearest parking
  const clearRoute = useCallback(() => {
    setNearestParking(null)
    setRouteInfo(null)
    setRouteDestination(null)
    mapRef.current?.clearRoute()
  }, [])

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
          selectedSpotId={nearestParking?.id || null}
          onSpotClick={(spot) => {
            router.push(`/parking/${spot.id}`)
          }}
          onMapClick={() => {}}
          userLocation={userLocation}
          routeDestination={routeDestination}
          onRouteCalculated={handleRouteCalculated}
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
      <div className="absolute right-0 bottom-0 left-0 z-[1000] flex flex-col">
        {/* Action buttons - right bottom corner above nav */}
        <div className="flex flex-col items-end gap-3 px-4 pb-4">
          {/* Find Nearest Parking button */}
          <button
            onClick={findNearestParking}
            disabled={findingNearest || !userLocation}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform active:scale-95 disabled:opacity-70"
            aria-label="Find nearest parking"
          >
            {findingNearest ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Car className="h-5 w-5" />
            )}
          </button>

          {/* Go to me button */}
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

        {/* Route info panel */}
        {nearestParking && routeInfo && (
          <div className="mx-4 mb-3 rounded-2xl bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Time */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-lg font-semibold text-foreground">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>{routeInfo.duration}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">min</span>
                </div>

                <div className="h-8 w-px bg-border" />

                {/* Distance */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-lg font-semibold text-foreground">
                    <Route className="h-4 w-4 text-accent" />
                    <span>{routeInfo.distance}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">km</span>
                </div>

                <div className="h-8 w-px bg-border" />

                {/* Price */}
                <div className="flex flex-col items-center">
                  <div className="text-lg font-semibold text-foreground">
                    {nearestParking.pricePerHour} T
                  </div>
                  <span className="text-xs text-muted-foreground">/hour</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Close button */}
                <button
                  onClick={clearRoute}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80"
                  aria-label="Close route"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Go button */}
                <button
                  onClick={() => router.push(`/parking/${nearestParking.id}`)}
                  className="flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition-transform active:scale-95"
                >
                  <span>Go</span>
                  <Navigation className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Parking name */}
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <MapPin className="h-4 w-4 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{nearestParking.name}</p>
                <p className="truncate text-xs text-muted-foreground">{nearestParking.address}</p>
              </div>
              <span className="shrink-0 text-xs text-accent">{nearestParking.availableSpots} spots</span>
            </div>
          </div>
        )}

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
