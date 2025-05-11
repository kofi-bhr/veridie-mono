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
        mentors!inner(calendly_access_token, calendly_refresh_token, calendly_user_uri, calendly_event_type_uri),
        services(calendly_event_type_uri),
        profiles!client_id(name, email)
      `)
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("Error getting booking:", bookingError)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Determine which Calendly event type URI to use (prefer the service-specific one if available)
    const eventTypeUri = booking.services.calendly_event_type_uri || booking.mentors.calendly_event_type_uri

    // Create the Calendly event if we have the necessary data
    let calendlyEventUri = null
    if (booking.mentors.calendly_access_token && eventTypeUri) {
      try {
        // Format the date and time for Calendly
        const dateTime = new Date(`${booking.date}T${booking.time}`)
        const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000) // Add 1 hour

        console.log("Creating Calendly event with:", {
          eventTypeUri,
          startTime: dateTime.toISOString(),
          endTime: endTime.toISOString(),
          inviteeEmail: booking.profiles.email,
          inviteeName: booking.profiles.name,
        })

        // Create the event in Calendly
        const calendlyResponse = await fetch("https://api.calendly.com/scheduled_events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${booking.mentors.calendly_access_token}`,
          },
          body: JSON.stringify({
            event_type_uri: eventTypeUri,
            start_time: dateTime.toISOString(),
            end_time: endTime.toISOString(),
            invitees: [
              {
                email: booking.profiles.email,
                name: booking.profiles.name,
                questions_and_answers: [
                  {
                    question: "Booking Reference",
                    answer: `Mentor ID: ${booking.mentor_id}, Booking ID: ${bookingId}`,
                  },
                ],
              },
            ],
          }),
        })

        if (!calendlyResponse.ok) {
          const errorText = await calendlyResponse.text()
          console.error("Calendly API error:", errorText)
          // Continue with the booking confirmation even if Calendly fails
        } else {
          const calendlyData = await calendlyResponse.json()
          calendlyEventUri = calendlyData.uri

          console.log("Calendly event created successfully:", calendlyData)

          // Update the booking with the Calendly event URI
          await supabase
            .from("bookings")
            .update({
              calendly_event_uri: calendlyEventUri,
              status: "confirmed",
            })
            .eq("id", bookingId)
        }
      } catch (calendlyError) {
        console.error("Error creating Calendly event:", calendlyError)
        // Continue with the booking confirmation even if Calendly fails
      }
    } else {
      console.log("Missing Calendly data:", {
        hasAccessToken: !!booking.mentors.calendly_access_token,
        hasEventTypeUri: !!eventTypeUri,
      })
    }

    // Update the booking status
    await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    return NextResponse.json({
      success: true,
      calendlyEventCreated: !!calendlyEventUri,
      calendlyEventUri,
    })
  } catch (error) {
    console.error("Error confirming booking:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to confirm booking" },
      { status: 500 },
    )
  }
}
