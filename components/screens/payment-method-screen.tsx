"use client"

import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Wifi } from "lucide-react"

export function PaymentMethodScreen() {
  const { goBack } = useApp()

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={goBack} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground">Payment Method</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Card Preview */}
        <div className="relative overflow-hidden rounded-2xl bg-foreground p-6 text-background">
          <div className="absolute top-0 right-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-card/5" />
          <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-8 translate-y-8 rounded-full bg-card/5" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <CreditCard className="h-8 w-8" />
              <Wifi className="h-6 w-6 rotate-90" />
            </div>
            <p className="mt-8 font-mono text-lg tracking-widest">
              {'**** **** **** 4242'}
            </p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-card/60">Card Holder</p>
                <p className="text-sm font-medium">Alex Johnson</p>
              </div>
              <div>
                <p className="text-xs text-card/60">Expires</p>
                <p className="text-sm font-medium">12/28</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add new card form */}
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Add New Card</h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Card Number</Label>
              <Input
                placeholder="0000 0000 0000 0000"
                className="h-12 rounded-xl border-border bg-card font-mono text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">Expiry Date</Label>
                <Input
                  placeholder="MM/YY"
                  className="h-12 rounded-xl border-border bg-card font-mono text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">CVV</Label>
                <Input
                  placeholder="123"
                  className="h-12 rounded-xl border-border bg-card font-mono text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <Button
              className="mt-4 h-14 rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
              onClick={goBack}
            >
              Make Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
