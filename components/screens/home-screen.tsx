"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { type ParkingSpotDto, getParkingSpotsApi } from "@/lib/api"
import {
  MapPin,
  Navigation,
  Search,
  Clock,
  Settings,
  User,
  Menu,
} from "lucide-react"
import dynamic from "next/dynamic"
const AlmatyMap = dynamic(() => import("@/components/almaty-map").then(m => m.AlmatyMap), { ssr: false })

export function HomeScreen() {
  const router = useRouter()
  const [spots, setSpots] = useState<ParkingSpotDto[]>([])
  const [loading, setLoading] = useState(true)

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
          spots={spots}
          selectedSpotId={null}
          onSpotClick={(spot) => {
            router.push(`/parking/${spot.id}`)
          }}
          onMapClick={() => {}}
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

      {/* Bottom Nav wrapper */}
      <div className="absolute right-0 bottom-0 left-0 z-[1000] flex flex-col">
        <div className="flex items-center justify-around border-t border-border bg-card px-2 pb-6 pt-2">
          <NavItem icon={<MapPin className="h-5 w-5" />} label="Explore" active onClick={() => {}} />
          <NavItem icon={<Clock className="h-5 w-5" />} label="History" onClick={() => router.push("/history")} />
          <NavItem icon={<Settings className="h-5 w-5" />} label="Settings" onClick={() => router.push("/settings")} />
          <NavItem icon={<User className="h-5 w-5" />} label="Profile" onClick={() => router.push("/profile")} />
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
