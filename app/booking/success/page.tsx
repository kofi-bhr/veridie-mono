"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const bookingId = searchParams.get("booking_id")

  useEffect(() => {
    const confirmBooking = async () => {
      if (sessionId && bookingId) {
        try {
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
            console.error("Error confirming booking:", await response.text())
          }
        } catch (error) {
          console.error("Error confirming booking:", error)
        }
      }
    }

    confirmBooking()
  }, [sessionId, bookingId])

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!sessionId) {
        setError("No session ID provided")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/booking/details?session_id=${sessionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch booking details")
        }

        setBookingDetails(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [sessionId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Booking Error</CardTitle>
            <CardDescription>There was a problem retrieving your booking details</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Booking Confirmed!</CardTitle>
          <CardDescription>Your session has been successfully booked</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingDetails && (
            <>
              <div className="border-b pb-2">
                <p className="text-sm text-muted-foreground">Mentor</p>
                <p className="font-medium">{bookingDetails.mentorName}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{bookingDetails.serviceName}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {new Date(bookingDetails.date).toLocaleDateString()} at {bookingDetails.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="font-medium">${(bookingDetails.amount / 100).toFixed(2)}</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/dashboard/sessions">View My Sessions</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
