"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { CalendarDays, Loader2 } from "lucide-react"
import { getStripeClient } from "@/lib/stripe-client"

interface CheckoutButtonProps {
  mentorId: string
  serviceId: string
  serviceName: string
  servicePrice: number
  stripePriceId?: string
  date: Date | null
  time: string | null
  disabled?: boolean
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
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to book a session",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!date || !time) {
      toast({
        title: "Please select a date and time",
        description: "You need to select both a date and time for your session",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
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
          date: date.toISOString().split("T")[0],
          time,
          clientId: user.id,
        }),
      })

      const { url, error, sessionId } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // If we have a direct URL, redirect to it
      if (url) {
        window.location.href = url
      }
      // Otherwise, use the Stripe client to redirect
      else if (sessionId) {
        const stripe = await getStripeClient()
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId })
        }
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Checkout failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={disabled || isLoading} className="w-full" size="lg">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CalendarDays className="mr-2 h-4 w-4" />
          Book Now
        </>
      )}
    </Button>
  )
}
