import { Suspense } from "react"
import { BookingPaymentScreen } from "@/components/screens/booking-payment-screen"

export default function BookingPaymentPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center bg-background"><p className="text-sm text-muted-foreground">Loading...</p></div>}>
      <BookingPaymentScreen />
    </Suspense>
  )
}
