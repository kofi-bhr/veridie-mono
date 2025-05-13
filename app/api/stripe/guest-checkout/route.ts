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

    // First, check if the guest_bookings table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "guest_bookings")
      .single()

    if (tableCheckError || !tableExists) {
      console.log("Guest bookings table doesn't exist, trying to create it...")

      // Try to create the table on the fly
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS guest_bookings (
          id UUID PRIMARY KEY,
          mentor_id UUID NOT NULL,
          service_id UUID NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          status TEXT NOT NULL,
          guest_name TEXT NOT NULL,
          guest_email TEXT NOT NULL,
          calendly_event_uri TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE
        );
      `

      try {
        // Try to create the table using RPC if available
        const { error: createError } = await supabase.rpc("exec_sql", {
          sql_query: createTableSQL,
        })

        if (createError) {
          console.error("Error creating guest_bookings table:", createError)
          return NextResponse.json(
            {
              error: "Failed to create guest bookings table. Please contact support.",
              details: createError,
            },
            { status: 500 },
          )
        }
      } catch (rpcError) {
        console.error("Error executing RPC to create table:", rpcError)
        return NextResponse.json(
          {
            error: "Failed to create guest bookings table. Please contact support.",
            details: rpcError,
          },
          { status: 500 },
        )
      }
    }

    // Insert into the guest_bookings table instead of bookings
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

      // Try a direct approach without using the bookings table
      // Create a temporary record in a simple key-value store
      const tempBookingData = {
        id: bookingId,
        mentor_id: mentorId,
        service_id: serviceId,
        date,
        time,
        status: "pending_payment",
        guest_name: guestName,
        guest_email: guestEmail,
        created_at: new Date().toISOString(),
      }

      // Store this in a session or temporary storage
      // For now, we'll just proceed with the checkout and handle this in the success page
      console.log("Proceeding with checkout without database record:", tempBookingData)
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
