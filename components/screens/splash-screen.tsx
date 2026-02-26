"use client"

import { useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Car } from "lucide-react"

export function SplashScreen() {
  const { navigate, user } = useApp()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        navigate("home")
      } else {
        navigate("login")
      }
    }, 2500)
    return () => clearTimeout(timer)
  }, [navigate, user])

  return (
    <div className="flex h-full flex-col items-center justify-center bg-foreground">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-card shadow-lg">
          <Car className="h-14 w-14 text-foreground" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-card">CarPark</h1>
          <p className="text-sm text-muted-foreground">Your smart parking assistant</p>
        </div>
      </div>

      {/* City skyline */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 400 120" className="w-full opacity-20" fill="none">
          <rect x="10" y="60" width="25" height="60" rx="2" fill="#9CA3AF" />
          <rect x="40" y="30" width="20" height="90" rx="2" fill="#9CA3AF" />
          <rect x="65" y="50" width="30" height="70" rx="2" fill="#9CA3AF" />
          <rect x="100" y="20" width="22" height="100" rx="2" fill="#9CA3AF" />
          <rect x="128" y="45" width="28" height="75" rx="2" fill="#9CA3AF" />
          <rect x="162" y="35" width="18" height="85" rx="2" fill="#9CA3AF" />
          <rect x="185" y="15" width="25" height="105" rx="2" fill="#9CA3AF" />
          <rect x="215" y="55" width="20" height="65" rx="2" fill="#9CA3AF" />
          <rect x="240" y="25" width="30" height="95" rx="2" fill="#9CA3AF" />
          <rect x="275" y="40" width="22" height="80" rx="2" fill="#9CA3AF" />
          <rect x="302" y="60" width="18" height="60" rx="2" fill="#9CA3AF" />
          <rect x="325" y="30" width="25" height="90" rx="2" fill="#9CA3AF" />
          <rect x="355" y="50" width="20" height="70" rx="2" fill="#9CA3AF" />
          <rect x="380" y="35" width="20" height="85" rx="2" fill="#9CA3AF" />
        </svg>
      </div>
    </div>
  )
}
