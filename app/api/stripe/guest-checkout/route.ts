import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { guestName, guestEmail, mentorId, serviceId, serviceName, servicePrice, stripePriceId, date, time } =
      await request.json()

    // Validate required fields
    if (!guestName || !guestEmail || !mentorId || !serviceId || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Creating guest booking with:", {
      guestName,
      guestEmail,
      mentorId,
      serviceId,
      date,
      time,
    })

    // Create a temporary booking record for the guest
    const bookingId = uuidv4()

    // Insert into the guest_bookings table
    const { error: bookingError } = await supabase.from("guest_bookings").insert({
      id: bookingId,
      mentor_id: mentorId,
      service_id: serviceId,
      date,
      time,
      status: "pending_payment",
      guest_name: guestName,
      guest_email: guestEmail,
      created_at: new Date().toISOString(),
    })

    if (bookingError) {
      console.error("Error creating guest booking:", bookingError)

      // If there's an error with the guest_bookings table, try to store minimal info in metadata
      console.log("Proceeding with checkout without database record")
    }

    // Get the base URL for success and cancel URLs
    const origin = request.headers.get("origin") || "https://veridie.vercel.app"

    // Create a Stripe Checkout Session
    let session

    if (stripePriceId) {
      // Use existing Stripe Price ID if available
      session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}&guest=true`,
        cancel_url: `${origin}/mentors/${mentorId}`,
        customer_email: guestEmail, // Pre-fill the email for guest checkout
        client_reference_id: bookingId,
        metadata: {
          bookingId,
          mentorId,
          serviceId,
          date,
          time,
          guestName,
          guestEmail,
          isGuestBooking: "true",
        },
      })
    } else {
      // Create a one-time price if no Stripe Price ID is available
      session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: serviceName || "Consultation Service",
                description: `Session with consultant on ${new Date(date).toLocaleDateString()} at ${time}`,
              },
              unit_amount: Math.round(servicePrice * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}&guest=true`,
        cancel_url: `${origin}/mentors/${mentorId}`,
        customer_email: guestEmail, // Pre-fill the email for guest checkout
        client_reference_id: bookingId,
        metadata: {
          bookingId,
          mentorId,
          serviceId,
          date,
          time,
          guestName,
          guestEmail,
          isGuestBooking: "true",
        },
      })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 },
    )
  }
}
