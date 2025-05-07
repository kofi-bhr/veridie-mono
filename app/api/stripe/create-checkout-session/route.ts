import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createBooking, getMentorProfile } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { mentorId, serviceId, serviceName, servicePrice, stripePriceId, date, time, clientId } = await request.json()

    // Get mentor's Stripe Connect account ID
    const { mentor, error: mentorError } = await getMentorProfile(mentorId)

    if (mentorError || !mentor) {
      return NextResponse.json({ error: "Failed to fetch mentor profile" }, { status: 500 })
    }

    const stripeConnectAccountId = mentor.stripe_connect_account_id

    if (!stripeConnectAccountId) {
      return NextResponse.json({ error: "Mentor has not connected their Stripe account" }, { status: 400 })
    }

    // Create a Stripe checkout session
    const stripe = getStripe()

    // Calculate application fee (20% of the price)
    const applicationFee = Math.round(servicePrice * 100 * 0.2) // in cents

    const sessionOptions = {
      payment_method_types: ["card"],
      line_items: [
        stripePriceId
          ? { price: stripePriceId, quantity: 1 }
          : {
              price_data: {
                currency: "usd",
                product_data: {
                  name: serviceName,
                  description: `Session with mentor on ${date} at ${time}`,
                },
                unit_amount: servicePrice * 100, // Convert to cents
              },
              quantity: 1,
            },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/mentors/${mentorId}`,
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: stripeConnectAccountId,
        },
      },
      metadata: {
        mentorId,
        serviceId,
        date,
        time,
        clientId,
      },
    }

    const session = await stripe.checkout.sessions.create(sessionOptions)

    // Create a pending booking in the database
    await createBooking({
      clientId,
      mentorId,
      serviceId,
      date,
      time,
      paymentIntentId: session.payment_intent as string,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
