import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createBooking } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { mentorId, serviceId, serviceName, servicePrice, date, time, clientId } = await request.json()

    // Create a Stripe checkout session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
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
      metadata: {
        mentorId,
        serviceId,
        date,
        time,
        clientId,
      },
    })

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
