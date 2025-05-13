"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, CalendarCheck } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CheckoutButtonProps {
  mentorId: string
  serviceId: string
  serviceName: string
  servicePrice: number
  stripePriceId?: string
  date: string | null
  time: string | null
  disabled?: boolean
  onBeforeCheckout?: () => boolean // Return true to prevent default checkout
}

export function CheckoutButton({
  mentorId,
  serviceId,
  serviceName,
  servicePrice,
  stripePriceId,
  date,
  time,
  disabled = false,
  onBeforeCheckout,
}: CheckoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    // If onBeforeCheckout returns true, don't proceed with default checkout
    if (onBeforeCheckout && onBeforeCheckout()) {
      return
    }

    setLoading(true)
    try {
      // Create a checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorId,
          serviceId,
          serviceName,
          servicePrice,
          stripePriceId,
          date,
          time,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }

      const data = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={disabled || loading} className="w-full">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CalendarCheck className="mr-2 h-4 w-4" />
          Book Now
        </>
      )}
    </Button>
  )
}
