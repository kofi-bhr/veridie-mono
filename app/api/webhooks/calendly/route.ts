import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceRole)

// Verify Calendly webhook signature
function verifyCalendlySignature(signature: string, body: string): boolean {
  try {
    const webhookSecret = process.env.CALENDLY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("CALENDLY_WEBHOOK_SECRET is not set")
      return false
    }

    const hmac = crypto.createHmac("sha256", webhookSecret)
    const digest = hmac.update(body).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
  } catch (error) {
    console.error("Error verifying Calendly webhook signature:", error)
    return false
  }
}

// Process the Calendly event
async function processCalendlyEvent(event: any) {
  try {
    // Extract data from the event
    const eventType = event.event
    const payload = event.payload

    if (eventType === "invitee.created") {
      // A new booking was created
      const calendlyEventUuid = payload.event.uuid
      const inviteeUuid = payload.invitee.uuid

      // Extract custom questions (where we stored mentor ID, service ID, etc)
      const customQuestions = payload.questions_and_answers || []

      // Find mentor ID from custom questions
      let mentorId = null
      let serviceId = null

      customQuestions.forEach((qa: any) => {
        if (qa.question.includes("Mentor ID")) {
          mentorId = qa.answer.replace("Mentor ID: ", "").trim()
        }
        if (qa.question.includes("Service ID")) {
          serviceId = qa.answer.replace("Service ID: ", "").trim()
        }
      })

      if (!mentorId) {
        console.error("No mentor ID found in Calendly event")
        return false
      }

      // Get client info
      const clientEmail = payload.invitee.email
      const clientName = payload.invitee.name

      // Find client by email
      const { data: clientData } = await supabase.from("profiles").select("id").eq("email", clientEmail).limit(1)

      const clientId = clientData && clientData[0] ? clientData[0].id : null

      if (!clientId) {
        console.error("No client found with email:", clientEmail)
        // You might want to create a client here
        return false
      }

      // Create a booking record
      const bookingData = {
        client_id: clientId,
        mentor_id: mentorId,
        service_id: serviceId || null,
        date: new Date(payload.event.start_time).toISOString().split("T")[0],
        time: new Date(payload.event.start_time).toTimeString().split(" ")[0],
        status: "confirmed",
        calendly_event_id: calendlyEventUuid,
        created_at: new Date().toISOString(),
        meeting_url: payload.event.location?.join_url || null,
      }

      const { error } = await supabase.from("bookings").insert([bookingData])

      if (error) {
        console.error("Error creating booking from Calendly event:", error)
        return false
      }

      return true
    }

    if (eventType === "invitee.canceled") {
      // A booking was canceled
      const calendlyEventUuid = payload.event.uuid

      // Update the booking status
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("calendly_event_id", calendlyEventUuid)

      if (error) {
        console.error("Error updating booking status:", error)
        return false
      }

      return true
    }

    return true
  } catch (error) {
    console.error("Error processing Calendly event:", error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get("calendly-webhook-signature") || ""

    // Verify the webhook signature
    if (!verifyCalendlySignature(signature, body)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    const success = await processCalendlyEvent(event)

    if (!success) {
      return NextResponse.json({ error: "Failed to process event" }, { status: 500 })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Calendly webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
