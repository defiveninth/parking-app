"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { SplashScreen } from "@/components/screens/splash-screen"
import { LoginScreen, SignupScreen, OTPScreen } from "@/components/screens/auth-screens"
import { HomeScreen } from "@/components/screens/home-screen"
import { CarParkDetailsScreen } from "@/components/screens/carpark-details-screen"
import { BookingPaymentScreen } from "@/components/screens/booking-payment-screen"
import { BookingConfirmationScreen } from "@/components/screens/booking-confirmation-screen"
import { EndParkingScreen } from "@/components/screens/end-parking-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { ProfileScreen } from "@/components/screens/profile-screen"
import { PaymentMethodScreen } from "@/components/screens/payment-method-screen"
import { ParkingHistoryScreen } from "@/components/screens/parking-history-screen"

function AppScreens() {
  const { screen } = useApp()

  const screens: Record<string, React.ReactNode> = {
    splash: <SplashScreen />,
    login: <LoginScreen />,
    signup: <SignupScreen />,
    otp: <OTPScreen />,
    home: <HomeScreen />,
    "carpark-details": <CarParkDetailsScreen />,
    "booking-payment": <BookingPaymentScreen />,
    "booking-confirmation": <BookingConfirmationScreen />,
    "end-parking": <EndParkingScreen />,
    settings: <SettingsScreen />,
    profile: <ProfileScreen />,
    "payment-method": <PaymentMethodScreen />,
    "parking-history": <ParkingHistoryScreen />,
  }

  return (
    <div className="mx-auto h-dvh w-full max-w-md overflow-hidden bg-background shadow-2xl sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:border sm:border-border">
      {screens[screen] || <SplashScreen />}
    </div>
  )
}

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted">
      <AppProvider>
        <AppScreens />
      </AppProvider>
    </main>
  )
}
