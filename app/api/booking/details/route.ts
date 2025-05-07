import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Get the booking details from your database
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        *,
        mentors!inner(
          *,
          profiles!inner(*)
        ),
        services(*)
      `)
      .eq("payment_intent_id", session.payment_intent)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Return the booking details
    return NextResponse.json({
      id: booking.id,
      mentorId: booking.mentor_id,
      mentorName: booking.mentors.profiles.name,
      serviceId: booking.service_id,
      serviceName: booking.services?.name || "Consultation",
      date: booking.date,
      time: booking.time,
      status: booking.status,
      amount: session.amount_total,
    })
  } catch (error) {
    console.error("Error retrieving booking details:", error)
    return NextResponse.json({ error: "Failed to retrieve booking details" }, { status: 500 })
  }
}
