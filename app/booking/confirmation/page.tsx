import { Suspense } from "react"
import { BookingConfirmationScreen } from "@/components/screens/booking-confirmation-screen"

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center bg-background"><p className="text-sm text-muted-foreground">Loading...</p></div>}>
      <BookingConfirmationScreen />
    </Suspense>
  )
}
