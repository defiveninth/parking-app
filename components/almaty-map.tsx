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

export interface AlmatyMapHandle {
  centerOnLocation: (lat: number, lng: number) => void
  drawRoute: (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => void
  clearRoute: () => void
}

interface AlmatyMapProps {
  spots: ParkingSpotDto[]
  selectedSpotId: string | null
  onSpotClick: (spot: ParkingSpotDto) => void
  onMapClick?: () => void
  userLocation?: { lat: number; lng: number } | null
  routeDestination?: { lat: number; lng: number } | null
}

export const AlmatyMap = forwardRef<AlmatyMapHandle, AlmatyMapProps>(function AlmatyMap(
  { spots, selectedSpotId, onSpotClick, onMapClick, userLocation, routeDestination },
  ref
) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)
  const markersRef = useRef<import("leaflet").Marker[]>([])
  const userMarkerRef = useRef<import("leaflet").Marker | null>(null)
  const routeLayerRef = useRef<import("leaflet").Polyline | null>(null)
  const LRef = useRef<LeafletNS | null>(null)

  const onSpotClickRef = useRef(onSpotClick)
  onSpotClickRef.current = onSpotClick

  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    centerOnLocation: (lat: number, lng: number) => {
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 14, { animate: true })
      }
    },
    drawRoute: (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
      const map = mapRef.current
      const L = LRef.current
      if (!map || !L) return

      // Clear existing route
      if (routeLayerRef.current) {
        routeLayerRef.current.remove()
        routeLayerRef.current = null
      }

      // Draw a simple polyline route
      const routeLine = L.polyline(
        [
          [from.lat, from.lng],
          [to.lat, to.lng],
        ],
        {
          color: "#2F8EDB",
          weight: 4,
          opacity: 0.8,
          dashArray: "10, 10",
        }
      ).addTo(map)

      routeLayerRef.current = routeLine

      // Fit bounds to show both points
      const bounds = L.latLngBounds([
        [from.lat, from.lng],
        [to.lat, to.lng],
      ])
      map.fitBounds(bounds, { padding: [50, 50] })
    },
    clearRoute: () => {
      if (routeLayerRef.current) {
        routeLayerRef.current.remove()
        routeLayerRef.current = null
      }
    },
  }))

  // Update markers when spots or selection changes
  const updateMarkers = useCallback(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    // Remove old markers
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
  }, [spots, selectedSpotId])

  // Update user location marker
  useEffect(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    // Remove old user marker if exists
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    // Add new user marker at user location or fallback to Almaty center
    const position: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : ALMATY_CENTER

    userMarkerRef.current = L.marker(position, {
      icon: createUserIcon(L),
      interactive: false,
    }).addTo(map)
  }, [userLocation])

  // Initialize map once (client-only)
  useEffect(() => {
    let isMounted = true

    ;(async () => {
      if (!mapContainerRef.current || mapRef.current) return

      const L = await import("leaflet")
      if (!isMounted) return

      LRef.current = L

      // Use user location as initial center if available
      const initialCenter: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
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

      // User location marker
      userMarkerRef.current = L.marker(initialCenter, {
        icon: createUserIcon(L),
        interactive: false,
      }).addTo(map)

      map.on("click", () => {
        onMapClickRef.current?.()
      })

      mapRef.current = map
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
    }
  }, [updateMarkers])

  useEffect(() => {
    updateMarkers()
  }, [updateMarkers])

  // Draw route when routeDestination changes
  const drawRouteOnMap = useCallback(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    // Clear existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }

    // Draw route if we have both user location and destination
    if (userLocation && routeDestination) {
      const routeLine = L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [routeDestination.lat, routeDestination.lng],
        ],
        {
          color: "#2F8EDB",
          weight: 5,
          opacity: 0.9,
          dashArray: "12, 8",
        }
      ).addTo(map)

      routeLayerRef.current = routeLine

      // Fit bounds to show both points with good padding for bottom panel
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [routeDestination.lat, routeDestination.lng],
      ])
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 })
    }
  }, [userLocation, routeDestination])

  useEffect(() => {
    // Small delay to ensure map is ready
    const timer = setTimeout(() => {
      drawRouteOnMap()
    }, 100)
    return () => clearTimeout(timer)
  }, [drawRouteOnMap])

  return <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }} />
})
