"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface CheckoutButtonProps {
  mentorId: string
  serviceId: string
  serviceName: string
  servicePrice: number
  stripePriceId?: string
  date: string | null
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
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleBooking = async () => {
    try {
      setLoading(true)
      console.log("Booking details:", {
        mentorId,
        serviceId,
        serviceName,
        servicePrice,
        stripePriceId,
        date,
        time,
      })

      // In the real implementation, this would call your API to create a booking
      // and redirect to the Stripe checkout page

      // For now, we'll just simulate the process with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect to a success page or Stripe checkout
      router.push(`/booking/success?mentor=${mentorId}&service=${serviceId}&date=${date}&time=${time}`)
    } catch (error) {
      console.error("Error creating checkout session:", error)
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleBooking} disabled={disabled || loading} className="w-full">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Book Now"
      )}
    </Button>
  )
}
