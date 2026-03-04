import { Suspense } from "react"
import { EndParkingScreen } from "@/components/screens/end-parking-screen"

export default function EndParkingPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center bg-background"><p className="text-sm text-muted-foreground">Loading...</p></div>}>
      <EndParkingScreen />
    </Suspense>
  )
}
