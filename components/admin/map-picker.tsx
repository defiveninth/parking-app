"use client"

import { useEffect, useRef, useCallback } from "react"
import "leaflet/dist/leaflet.css"

const ALMATY_CENTER: [number, number] = [43.238, 76.9458]
const DEFAULT_ZOOM = 14

type LeafletNS = typeof import("leaflet")

interface MapPickerProps {
  lat?: number
  lng?: number
  onChange: (lat: number, lng: number) => void
}

export function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)
  const markerRef = useRef<import("leaflet").Marker | null>(null)
  const LRef = useRef<LeafletNS | null>(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const updateMarker = useCallback((newLat: number, newLng: number) => {
    const L = LRef.current
    const map = mapRef.current
    if (!L || !map) return

    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng])
    } else {
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            display:flex;align-items:center;justify-content:center;
            width:40px;height:40px;
            background:#2F8EDB;color:#ffffff;
            border:3px solid #1a6fad;
            border-radius:50%;
            font-size:18px;font-weight:800;font-family:Inter,sans-serif;
            box-shadow:0 2px 10px rgba(0,0,0,0.25);
            cursor:move;
          ">P</div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      markerRef.current = L.marker([newLat, newLng], {
        icon,
        draggable: true,
      }).addTo(map)

      markerRef.current.on("dragend", () => {
        const pos = markerRef.current?.getLatLng()
        if (pos) {
          onChangeRef.current(pos.lat, pos.lng)
        }
      })
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      if (!mapContainerRef.current || mapRef.current) return

      const L = await import("leaflet")
      if (!isMounted) return

      LRef.current = L

      const initialLat = lat ?? ALMATY_CENTER[0]
      const initialLng = lng ?? ALMATY_CENTER[1]

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map)

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng
        updateMarker(clickLat, clickLng)
        onChangeRef.current(clickLat, clickLng)
      })

      mapRef.current = map

      if (lat !== undefined && lng !== undefined) {
        updateMarker(lat, lng)
      }
    })()

    return () => {
      isMounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markerRef.current = null
    }
  }, [lat, lng, updateMarker])

  useEffect(() => {
    if (lat !== undefined && lng !== undefined && mapRef.current) {
      updateMarker(lat, lng)
    }
  }, [lat, lng, updateMarker])

  return (
    <div
      ref={mapContainerRef}
      className="h-[250px] w-full rounded-lg border lg:h-[380px]"
      style={{ zIndex: 0 }}
    />
  )
}
