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

    // Include all the necessary scopes, especially availability:read
    const scopes = ["availability:read", "event_types:read", "scheduling_links:read", "user:read"].join(" ")

    const calendlyAuthUrl = `https://auth.calendly.com/oauth/authorize?client_id=${CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`

    return NextResponse.json({ url: calendlyAuthUrl })
  } catch (error) {
    console.error("Error generating Calendly OAuth URL:", error)
    return NextResponse.json({ error: "Failed to generate Calendly OAuth URL" }, { status: 500 })
  }
}
