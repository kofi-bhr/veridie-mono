"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const bookingId = searchParams.get("booking_id")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [calendlyStatus, setCalendlyStatus] = useState<"pending" | "success" | "error">("pending")
  const [calendlyEventUri, setCalendlyEventUri] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function confirmBooking() {
      if (!sessionId || !bookingId) {
        setError("Missing required parameters")
        setLoading(false)
        return
      }

      try {
        // Call the API to confirm the booking
        const response = await fetch("/api/booking/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            bookingId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to confirm booking")
        }

        const data = await response.json()

        // Set Calendly status
        if (data.calendlyEventCreated) {
          setCalendlyStatus("success")
          setCalendlyEventUri(data.calendlyEventUri)
        } else {
          setCalendlyStatus("error")
        }

        // Fetch booking details
        const bookingResponse = await fetch(`/api/booking/${bookingId}`)
        if (!bookingResponse.ok) {
          console.error("Error fetching booking details")
        } else {
          const bookingData = await bookingResponse.json()
          setBookingDetails(bookingData)
        }

        toast({
          title: "Booking Confirmed",
          description: "Your session has been successfully booked!",
        })
      } catch (error) {
        console.error("Error confirming booking:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
        toast({
          title: "Booking Error",
          description: error instanceof Error ? error.message : "Failed to confirm booking",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    confirmBooking()
  }, [sessionId, bookingId, toast])

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg">
        <Card className="border-0 shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Processing Your Booking</CardTitle>
            <CardDescription>Please wait while we confirm your booking...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              We're confirming your payment and setting up your session. This may take a moment.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg">
        <Card className="border-0 shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">Booking Error</CardTitle>
            <CardDescription>There was a problem with your booking</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-16 w-16 text-red-600 mb-4" />
            <p className="text-center text-red-600 font-medium mb-4">{error}</p>
            <p className="text-center text-muted-foreground">
              Please contact support if you believe this is an error or if your payment was processed.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4 max-w-lg">
      <Card className="border-0 shadow-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          <CardDescription>Your session has been successfully booked</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {bookingDetails ? (
            <>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Booking Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Service:</span>
                    <span className="text-sm">{bookingDetails.service?.name || "Consultation"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Consultant:</span>
                    <span className="text-sm">{bookingDetails.mentor?.name || "Your Consultant"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">
                      {bookingDetails.date ? new Date(bookingDetails.date).toLocaleDateString() : "Date not available"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Time:</span>
                    <span className="text-sm">{bookingDetails.time || "Time not available"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Calendly Status</h3>
                <div className="flex items-center">
                  {calendlyStatus === "pending" && (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span>Setting up your Calendly appointment...</span>
                    </>
                  )}
                  {calendlyStatus === "success" && (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span>Calendly appointment created! Check your email for details.</span>
                    </>
                  )}
                  {calendlyStatus === "error" && (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                      <span>
                        Calendly appointment could not be created automatically. Your consultant will contact you to
                        schedule.
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">What's Next?</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>You'll receive a confirmation email with your booking details</li>
                  <li>Your consultant will be notified of your booking</li>
                  <li>
                    {calendlyStatus === "success"
                      ? "Your Calendly appointment has been created and added to your calendar"
                      : "Your consultant will reach out to confirm the appointment details"}
                  </li>
                  <li>You can view all your bookings in your dashboard</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p>Loading booking details...</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
