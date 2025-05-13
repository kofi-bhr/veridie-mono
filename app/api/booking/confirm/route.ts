import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { sessionId, bookingId, isGuest } = await request.json()

    if (!sessionId || !bookingId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify the payment was successful
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Get the booking details - check guest_bookings if isGuest is true
    let booking
    let bookingError

    if (isGuest) {
      // Try to get from guest_bookings table
      const result = await supabase
        .from("guest_bookings")
        .select(`
          *,
          mentors!inner(calendly_access_token, calendly_refresh_token, calendly_user_uri, calendly_event_type_uri),
          services(calendly_event_type_uri)
        `)
        .eq("id", bookingId)
        .single()

      booking = result.data
      bookingError = result.error

      // If not found, try to get from Stripe metadata
      if (bookingError || !booking) {
        console.log("Guest booking not found in database, using Stripe metadata")

        // Extract booking details from Stripe session metadata
        booking = {
          id: bookingId,
          mentor_id: session.metadata?.mentorId,
          service_id: session.metadata?.serviceId,
          date: session.metadata?.date,
          time: session.metadata?.time,
          guest_name: session.metadata?.guestName,
          guest_email: session.metadata?.guestEmail,
          status: "pending_payment",
        }

        // Get the mentor details
        const mentorResult = await supabase
          .from("mentors")
          .select("calendly_access_token, calendly_refresh_token, calendly_user_uri, calendly_event_type_uri")
          .eq("id", booking.mentor_id)
          .single()

        if (mentorResult.error) {
          console.error("Error getting mentor details:", mentorResult.error)
          return NextResponse.json({ error: "Mentor not found" }, { status: 404 })
        }

        booking.mentors = mentorResult.data

        // Get the service details
        const serviceResult = await supabase
          .from("services")
          .select("calendly_event_type_uri")
          .eq("id", booking.service_id)
          .single()

        if (!serviceResult.error) {
          booking.services = serviceResult.data
        } else {
          booking.services = { calendly_event_type_uri: null }
        }
      }
    } else {
      // Regular booking
      const result = await supabase
        .from("bookings")
        .select(`
          *,
          mentors!inner(calendly_access_token, calendly_refresh_token, calendly_user_uri, calendly_event_type_uri),
          services(calendly_event_type_uri),
          profiles!client_id(name, email)
        `)
        .eq("id", bookingId)
        .single()

      booking = result.data
      bookingError = result.error
    }

    if (bookingError || !booking) {
      console.error("Error getting booking:", bookingError)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Determine which Calendly event type URI to use (prefer the service-specific one if available)
    const eventTypeUri = booking.services?.calendly_event_type_uri || booking.mentors?.calendly_event_type_uri

    // Create the Calendly event if we have the necessary data
    let calendlyEventUri = null
    if (booking.mentors?.calendly_access_token && eventTypeUri) {
      try {
        // Format the date and time for Calendly
        const dateTime = new Date(`${booking.date}T${booking.time}`)
        const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000) // Add 1 hour

        // Get the attendee name and email
        let attendeeName
        let attendeeEmail

        if (isGuest) {
          attendeeName = booking.guest_name
          attendeeEmail = booking.guest_email
        } else if (booking.client_id && booking.profiles) {
          attendeeName = booking.profiles.name
          attendeeEmail = booking.profiles.email
        } else if (booking.guest_name && booking.guest_email) {
          attendeeName = booking.guest_name
          attendeeEmail = booking.guest_email
        } else {
          // Fallback to session customer details
          attendeeEmail = session.customer_details?.email || "guest@example.com"
          attendeeName = session.customer_details?.name || "Guest"
        }

        console.log("Creating Calendly event with:", {
          eventTypeUri,
          startTime: dateTime.toISOString(),
          endTime: endTime.toISOString(),
          inviteeEmail: attendeeEmail,
          inviteeName: attendeeName,
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
                email: attendeeEmail,
                name: attendeeName,
                questions_and_answers: [
                  {
                    question: "Booking Reference",
                    answer: `Booking ID: ${bookingId}`,
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
          if (isGuest) {
            await supabase
              .from("guest_bookings")
              .update({
                calendly_event_uri: calendlyEventUri,
                status: "confirmed",
              })
              .eq("id", bookingId)
          } else {
            await supabase
              .from("bookings")
              .update({
                calendly_event_uri: calendlyEventUri,
                status: "confirmed",
              })
              .eq("id", bookingId)
          }
        }
      } catch (calendlyError) {
        console.error("Error creating Calendly event:", calendlyError)
        // Continue with the booking confirmation even if Calendly fails
      }
    } else {
      console.log("Missing Calendly data:", {
        hasAccessToken: !!booking.mentors?.calendly_access_token,
        hasEventTypeUri: !!eventTypeUri,
      })
    }

    // Update the booking status
    if (isGuest) {
      try {
        await supabase
          .from("guest_bookings")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId)
      } catch (updateError) {
        console.error("Error updating guest booking:", updateError)
        // Continue even if update fails
      }
    } else {
      try {
        await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId)
      } catch (updateError) {
        console.error("Error updating booking:", updateError)
        // Continue even if update fails
      }
    }

    return NextResponse.json({
      success: true,
      calendlyEventCreated: !!calendlyEventUri,
      calendlyEventUri,
      isGuest,
    })
  } catch (error) {
    console.error("Error confirming booking:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to confirm booking" },
      { status: 500 },
    )
  }
}
