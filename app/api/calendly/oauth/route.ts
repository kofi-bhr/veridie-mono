import { NextResponse } from "next/server"
import { CALENDLY_CLIENT_ID } from "@/lib/api-config"

export async function GET() {
  try {
    if (!CALENDLY_CLIENT_ID) {
      console.error("Missing Calendly client ID")
      return NextResponse.json({ error: "Calendly integration not configured" }, { status: 500 })
    }

    // Ensure the base URL has no trailing slash
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1)
    }

    const redirectUri = `${baseUrl}/api/calendly/callback`

    // Create URL parameters
    const params = new URLSearchParams({
      client_id: CALENDLY_CLIENT_ID,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: "user:read event_types:read scheduling_links:read",
    })

    // Build the Calendly authorization URL
    const calendlyAuthUrl = `https://auth.calendly.com/oauth/authorize?${params.toString()}`

    console.log("Redirecting to Calendly auth URL:", calendlyAuthUrl)

    // Redirect to Calendly for authorization
    return NextResponse.redirect(calendlyAuthUrl)
  } catch (error) {
    console.error("Error in Calendly OAuth route:", error)
    return NextResponse.json({ error: "Failed to initiate Calendly authorization" }, { status: 500 })
  }
}
