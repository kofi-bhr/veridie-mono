import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { mentorId, serviceId, serviceName, servicePrice, stripePriceId, date, time } = await request.json()

    // Get the current user
    const {
      data: { session: userSession },
    } = await supabase.auth.getSession()

    if (!userSession?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = userSession.user.id

    // Get the mentor's Stripe Connect account ID
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("stripe_connect_account_id")
      .eq("id", mentorId)
      .single()

    if (mentorError || !mentor?.stripe_connect_account_id) {
      console.error("Error getting mentor Stripe account:", mentorError)
      return NextResponse.json({ error: "Mentor payment setup incomplete" }, { status: 400 })
    }

    // Create a temporary booking record
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          client_id: userId,
          mentor_id: mentorId,
          service_id: serviceId,
          date,
          time,
          status: "pending_payment",
        },
      ])
      .select()

    if (bookingError || !booking?.[0]) {
      console.error("Error creating booking:", bookingError)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    const bookingId = booking[0].id

    // Create a Stripe Checkout Session
    let priceId = stripePriceId

    // If no Stripe Price ID exists, create a one-time price
    if (!priceId) {
      const price = await stripe.prices.create({
        unit_amount: Math.round(servicePrice * 100), // Convert to cents
        currency: "usd",
        product_data: {
          name: serviceName,
        },
      })
      priceId = price.id
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/mentors/${mentorId}?canceled=true`,
      payment_intent_data: {
        application_fee_amount: Math.round(servicePrice * 100 * 0.1), // 10% platform fee
        transfer_data: {
          destination: mentor.stripe_connect_account_id,
        },
      },
      metadata: {
        bookingId,
        mentorId,
        serviceId,
        userId,
        date,
        time,
      },
    })

    // Update the booking with the checkout session ID
    await supabase
      .from("bookings")
      .update({
        payment_intent_id: session.payment_intent as string,
        checkout_session_id: session.id,
      })
      .eq("id", bookingId)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 },
    )
  }
}
