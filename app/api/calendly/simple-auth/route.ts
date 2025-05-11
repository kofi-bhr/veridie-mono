import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { CALENDLY_CLIENT_ID } from "@/lib/api-config"

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("Auth error:", userError)
      return NextResponse.redirect(
        new URL(`/dashboard/calendly?error=${encodeURIComponent("Authentication error")}`, request.url),
      )
    }

    if (!userData.user) {
      console.error("No authenticated user found")
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Check if CALENDLY_CLIENT_ID is available
    if (!CALENDLY_CLIENT_ID) {
      console.error("Missing CALENDLY_CLIENT_ID")
      return NextResponse.redirect(
        new URL(`/dashboard/calendly?error=${encodeURIComponent("Missing Calendly credentials")}`, request.url),
      )
    }

    // Construct the redirect URI
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/calendly/simple-callback`

    console.log("Initiating Calendly OAuth flow with redirect URI:", redirectUri)

    // Construct the authorization URL
    const authUrl = new URL("https://auth.calendly.com/oauth/authorize")
    authUrl.searchParams.append("client_id", CALENDLY_CLIENT_ID)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("redirect_uri", redirectUri)
    // Use the correct scope for Calendly
    authUrl.searchParams.append("scope", "default")

    console.log("Redirecting to Calendly auth URL:", authUrl.toString())

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Auth error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.redirect(
      new URL(`/dashboard/calendly?error=${encodeURIComponent("Server error: " + errorMessage)}`, request.url),
    )
  }
}
