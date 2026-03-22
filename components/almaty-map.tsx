"use client"

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react"
import "leaflet/dist/leaflet.css"
import type { ParkingSpotDto } from "@/lib/api"

const ALMATY_CENTER: [number, number] = [43.2380, 76.9458]
const DEFAULT_ZOOM = 14

type LeafletNS = typeof import("leaflet")

function createParkingIcon(L: LeafletNS, isSelected: boolean) {
  const bg = isSelected ? "#2F8EDB" : "#ffffff"
  const text = isSelected ? "#ffffff" : "#2F8EDB"
  const border = isSelected ? "#1a6fad" : "#2F8EDB"

  return L.divIcon({
    className: "custom-parking-marker",
    html: `
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:36px;height:36px;
        background:${bg};color:${text};
        border:2.5px solid ${border};
        border-radius:8px;
        font-size:20px;font-weight:800;font-family:Inter,sans-serif;
        box-shadow:0 2px 10px rgba(0,0,0,0.18);
        cursor:pointer;
        line-height:1;
      ">P</div>
      <div style="
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:6px solid ${border};
        margin:0 auto;
      "></div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
  })
}

function createUserIcon(L: LeafletNS) {
  return L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="position:relative;width:40px;height:40px;">
        <div style="
          position:absolute;inset:0;
          border-radius:50%;
          background:rgba(47,142,219,0.15);
          animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
        <div style="
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:18px;height:18px;
          border-radius:50%;
          background:#2F8EDB;
          border:3px solid #ffffff;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
        "></div>
      </div>
      <style>
        @keyframes ping{75%,100%{transform:scale(2);opacity:0;}}
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

export interface RouteInfo {
  distance: number // in km
  duration: number // in minutes
}

export interface AlmatyMapHandle {
  centerOnLocation: (lat: number, lng: number) => void
  clearRoute: () => void
}

interface AlmatyMapProps {
  spots: ParkingSpotDto[]
  selectedSpotId: string | null
  onSpotClick: (spot: ParkingSpotDto) => void
  onMapClick?: () => void
  userLocation?: { lat: number; lng: number } | null
  routeDestination?: { lat: number; lng: number } | null
  onRouteCalculated?: (routeInfo: RouteInfo | null) => void
}

export const AlmatyMap = forwardRef<AlmatyMapHandle, AlmatyMapProps>(function AlmatyMap(
  { spots, selectedSpotId, onSpotClick, onMapClick, userLocation, routeDestination, onRouteCalculated },
  ref
) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)
  const markersRef = useRef<import("leaflet").Marker[]>([])
  const userMarkerRef = useRef<import("leaflet").Marker | null>(null)
  const routeLayerRef = useRef<import("leaflet").Polyline | null>(null)
  const LRef = useRef<LeafletNS | null>(null)

  // Keep stable refs for callbacks and volatile props so effects never need
  // them as reactive dependencies.
  const onSpotClickRef = useRef(onSpotClick)
  onSpotClickRef.current = onSpotClick

  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick

  const onRouteCalculatedRef = useRef(onRouteCalculated)
  onRouteCalculatedRef.current = onRouteCalculated

  const userLocationRef = useRef(userLocation)
  userLocationRef.current = userLocation

  // Track the last destination we actually fetched a route for so we can
  // skip duplicate fetches (e.g. parent re-renders without changing destination)
  const lastRoutedDestinationRef = useRef<{ lat: number; lng: number } | null>(null)

  // ─── Expose imperative API ───────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    centerOnLocation: (lat: number, lng: number) => {
      mapRef.current?.setView([lat, lng], 14, { animate: true })
    },
    clearRoute: () => {
      if (routeLayerRef.current) {
        routeLayerRef.current.remove()
        routeLayerRef.current = null
      }
      lastRoutedDestinationRef.current = null
      onRouteCalculatedRef.current?.(null)
    },
  }))

  // ─── Update parking markers (imperative, no map re-init) ─────────────────
  const updateMarkers = useCallback(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    spots.forEach((spot) => {
      const isSelected = spot.id === selectedSpotId
      const marker = L.marker([spot.lat, spot.lng], {
        icon: createParkingIcon(L, isSelected),
      })
        .addTo(map)
        .on("click", (e: any) => {
          L.DomEvent.stopPropagation(e)
          onSpotClickRef.current(spot)
        })
      markersRef.current.push(marker)
    })
  }, [spots, selectedSpotId]) // safe – does NOT touch routeLayerRef or the map itself

  // ─── Update user location marker only ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    const position: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : ALMATY_CENTER

    userMarkerRef.current = L.marker(position, {
      icon: createUserIcon(L),
      interactive: false,
    }).addTo(map)
  }, [userLocation]) // only re-runs when location changes – does NOT affect route

  // ─── Initialize map ONCE ─────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true

    ;(async () => {
      if (!mapContainerRef.current || mapRef.current) return

      const L = await import("leaflet")
      if (!isMounted) return

      LRef.current = L

      const initialCenter: [number, number] = userLocationRef.current
        ? [userLocationRef.current.lat, userLocationRef.current.lng]
        : ALMATY_CENTER

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map)

      userMarkerRef.current = L.marker(initialCenter, {
        icon: createUserIcon(L),
        interactive: false,
      }).addTo(map)

      map.on("click", () => {
        onMapClickRef.current?.()
      })

      mapRef.current = map

      // Draw initial markers now that map is ready
      updateMarkers()
    })()

    return () => {
      isMounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markersRef.current = []
      userMarkerRef.current = null
      routeLayerRef.current = null
      lastRoutedDestinationRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // EMPTY – map is created once and never destroyed/recreated

  // ─── Update markers when spots or selection changes ───────────────────────
  useEffect(() => {
    updateMarkers()
  }, [updateMarkers])

  // ─── Fetch and draw route ONLY when routeDestination identity changes ─────
  // We compare by value (lat/lng) to avoid re-fetching on parent re-renders
  // that pass a new object with the same coordinates.
  // userLocation is intentionally read from a ref here so that GPS updates
  // never re-trigger this effect.
  useEffect(() => {
    // No destination → clear route
    if (!routeDestination) {
      if (routeLayerRef.current) {
        routeLayerRef.current.remove()
        routeLayerRef.current = null
      }
      lastRoutedDestinationRef.current = null
      onRouteCalculatedRef.current?.(null)
      return
    }

    // Skip if destination hasn't actually changed (same lat/lng)
    const prev = lastRoutedDestinationRef.current
    if (
      prev &&
      prev.lat === routeDestination.lat &&
      prev.lng === routeDestination.lng
    ) {
      return
    }

    lastRoutedDestinationRef.current = routeDestination

    const draw = async () => {
      const map = mapRef.current
      const L = LRef.current
      if (!map || !L) return

      const from = userLocationRef.current
      if (!from) return

      // Clear old route line
      if (routeLayerRef.current) {
        routeLayerRef.current.remove()
        routeLayerRef.current = null
      }

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${routeDestination.lng},${routeDestination.lat}?overview=full&geometries=geojson`
        const response = await fetch(url)
        const data = await response.json()

        if (data.code === "Ok" && data.routes?.length > 0) {
          const route = data.routes[0]
          const latLngs: [number, number][] = (route.geometry.coordinates as [number, number][]).map(
            ([lng, lat]) => [lat, lng]
          )

          const routeLine = L.polyline(latLngs, {
            color: "#2F8EDB",
            weight: 5,
            opacity: 0.9,
          }).addTo(map)

          routeLayerRef.current = routeLine
          map.fitBounds(routeLine.getBounds(), { padding: [80, 80], maxZoom: 15 })

          onRouteCalculatedRef.current?.({
            distance: Math.round((route.distance / 1000) * 10) / 10,
            duration: Math.ceil(route.duration / 60),
          })
          return
        }
      } catch {
        // fall through to straight-line fallback
      }

      // Fallback: straight dashed line
      const routeLine = L.polyline(
        [
          [from.lat, from.lng],
          [routeDestination.lat, routeDestination.lng],
        ],
        { color: "#2F8EDB", weight: 5, opacity: 0.9, dashArray: "12, 8" }
      ).addTo(map)

      routeLayerRef.current = routeLine
      map.fitBounds(
        L.latLngBounds([
          [from.lat, from.lng],
          [routeDestination.lat, routeDestination.lng],
        ]),
        { padding: [80, 80], maxZoom: 15 }
      )
    }

    // Small delay to ensure Leaflet is fully mounted on first render
    const timer = setTimeout(draw, 150)
    return () => clearTimeout(timer)

  // ONLY re-run when routeDestination reference changes (set by button click).
  // userLocation is read via ref – GPS movement never triggers this effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeDestination])

  return <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }} />
})
