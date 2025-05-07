import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { sessionId, bookingId } = await request.json()

    if (!sessionId || !bookingId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify the payment was successful
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Get the booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        mentors!inner(calendly_access_token, calendly_event_type_uri),
        profiles!client_id(name, email)
      `)
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("Error getting booking:", bookingError)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Create the Calendly event
    if (booking.mentors.calendly_access_token && booking.mentors.calendly_event_type_uri) {
      try {
        // Format the date and time for Calendly
        const dateTime = new Date(`${booking.date}T${booking.time}`)
        const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000) // Add 1 hour

        // Create the event in Calendly
        const calendlyResponse = await fetch("https://api.calendly.com/scheduled_events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${booking.mentors.calendly_access_token}`,
          },
          body: JSON.stringify({
            event_type_uri: booking.mentors.calendly_event_type_uri,
            start_time: dateTime.toISOString(),
            end_time: endTime.toISOString(),
            invitees: [
              {
                email: booking.profiles.email,
                name: booking.profiles.name,
              },
            ],
          }),
        })

        if (!calendlyResponse.ok) {
          console.error("Calendly API error:", await calendlyResponse.text())
        } else {
          const calendlyData = await calendlyResponse.json()

          // Update the booking with the Calendly event URI
          await supabase
            .from("bookings")
            .update({
              calendly_event_uri: calendlyData.uri,
              status: "confirmed",
            })
            .eq("id", bookingId)
        }
      } catch (calendlyError) {
        console.error("Error creating Calendly event:", calendlyError)
        // Continue with the booking confirmation even if Calendly fails
      }
    }

    // Update the booking status
    await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error confirming booking:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to confirm booking" },
      { status: 500 },
    )
  }
}
