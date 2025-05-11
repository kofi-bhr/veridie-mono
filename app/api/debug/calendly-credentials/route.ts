import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const { mentorId } = await request.json()

    if (!mentorId) {
      return NextResponse.json({ error: "Missing mentor ID" }, { status: 400 })
    }

    // Get the mentor's Calendly credentials
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_access_token, calendly_refresh_token, calendly_token_expires_at")
      .eq("id", mentorId)
      .single()

    if (mentorError) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 })
    }

    // Get the mentor's services with Calendly event URIs
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, name, calendly_event_type_uri, calendly_event_uri")
      .eq("mentor_id", mentorId)

    if (servicesError) {
      return NextResponse.json({ error: "Error fetching services" }, { status: 500 })
    }

    // Check environment variables
    const envVars = {
      hasClientId: !!process.env.CALENDLY_CLIENT_ID,
      hasClientSecret: !!process.env.CALENDLY_CLIENT_SECRET,
      hasWebhookSecret: !!process.env.CALENDLY_WEBHOOK_SECRET,
    }

    return NextResponse.json({
      mentor: {
        hasUsername: !!mentor.calendly_username,
        hasAccessToken: !!mentor.calendly_access_token,
        hasRefreshToken: !!mentor.calendly_refresh_token,
        tokenExpiresAt: mentor.calendly_token_expires_at,
      },
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        hasEventTypeUri: !!(service.calendly_event_type_uri || service.calendly_event_uri),
        eventTypeUri: service.calendly_event_type_uri || service.calendly_event_uri,
      })),
      environment: envVars,
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
