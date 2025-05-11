import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { CALENDLY_CLIENT_ID } from "@/lib/api-config"

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Check if CALENDLY_CLIENT_ID is available
    if (!CALENDLY_CLIENT_ID) {
      console.error("Missing CALENDLY_CLIENT_ID")
      return NextResponse.redirect(
        new URL(`/dashboard/calendly?error=${encodeURIComponent("Missing Calendly credentials")}`, request.url),
      )
    }

    // Construct the redirect URI - use the debug endpoint for testing
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/debug/calendly-callback`

    console.log("Initiating Calendly OAuth flow with debug redirect URI:", redirectUri)

    // Construct the authorization URL
    const authUrl = new URL("https://auth.calendly.com/oauth/authorize")
    authUrl.searchParams.append("client_id", CALENDLY_CLIENT_ID)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("scope", "user:read")

    console.log("Redirecting to Calendly auth URL:", authUrl.toString())

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.redirect(
      new URL(`/dashboard/calendly?error=${encodeURIComponent("Server error")}`, request.url),
    )
  }
}
