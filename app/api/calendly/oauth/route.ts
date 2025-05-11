import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { CALENDLY_CLIENT_ID } from "@/lib/api-config"

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client using the route handler client
    const supabase = createRouteHandlerClient({ cookies })

    // Validate the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const url = new URL(request.url)
    const redirectUri = url.searchParams.get("redirect_uri") || `${url.origin}/api/calendly/callback`

    // Use the exact scope format that Calendly expects
    // These are the current valid scopes as of the latest Calendly API
    const scope = "user:read event_types:read scheduling_links:read"

    // Build the authorization URL with properly encoded parameters
    const params = new URLSearchParams({
      client_id: CALENDLY_CLIENT_ID,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: scope,
    })

    const calendlyAuthUrl = `https://auth.calendly.com/oauth/authorize?${params.toString()}`
    console.log("Generated Calendly auth URL:", calendlyAuthUrl)

    return NextResponse.json({ url: calendlyAuthUrl })
  } catch (error) {
    console.error("Error generating Calendly OAuth URL:", error)
    return NextResponse.json({ error: "Failed to generate Calendly OAuth URL" }, { status: 500 })
  }
}
