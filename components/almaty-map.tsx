"use client"

import { useEffect, useRef, useCallback } from "react"
import "leaflet/dist/leaflet.css"
import type { ParkingSpot } from "@/lib/mock-data"

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

interface AlmatyMapProps {
  spots: ParkingSpot[]
  selectedSpotId: string | null
  onSpotClick: (spot: ParkingSpot) => void
  onMapClick?: () => void
}

export function AlmatyMap({ spots, selectedSpotId, onSpotClick, onMapClick }: AlmatyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)
  const markersRef = useRef<import("leaflet").Marker[]>([])
  const LRef = useRef<LeafletNS | null>(null)

  const onSpotClickRef = useRef(onSpotClick)
  onSpotClickRef.current = onSpotClick

  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick

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

  // Initialize map once (client-only)
  useEffect(() => {
    let isMounted = true

    ;(async () => {
      if (!mapContainerRef.current || mapRef.current) return

      const L = await import("leaflet")
      if (!isMounted) return

      LRef.current = L

      const map = L.map(mapContainerRef.current, {
        center: ALMATY_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map)

      // User location marker
      L.marker(ALMATY_CENTER, { icon: createUserIcon(L), interactive: false }).addTo(map)

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
    }
  }, [updateMarkers])

  useEffect(() => {
    updateMarkers()
  }, [updateMarkers])

  return <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }} />
}