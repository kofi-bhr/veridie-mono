import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET() {
  try {
    // Verify user is authenticated
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=${encodeURIComponent("Authentication required")}`,
      )
    }

    // Get Calendly client ID
    const clientId = process.env.CALENDLY_CLIENT_ID
    if (!clientId) {
      console.error("Missing Calendly client ID")
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Calendly integration not configured")}`,
      )
    }

    // Ensure the base URL has no trailing slash
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1)
    }

    const redirectUri = `${baseUrl}/api/calendly/callback`

    // Build the Calendly authorization URL with properly formatted scopes
    const authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:read event_types:read scheduling_links:read`

    console.log("Redirecting to Calendly auth URL:", authUrl)

    // Redirect to Calendly for authorization
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Error in Calendly authorize route:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Failed to initiate Calendly authorization")}`,
    )
  }
}
