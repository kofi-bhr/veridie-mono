import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { exchangeCalendlyCode, getCurrentUser } from "@/lib/calendly-api"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the query parameters
    const code = request.nextUrl.searchParams.get("code")
    const error = request.nextUrl.searchParams.get("error")

    if (error) {
      console.error("Calendly OAuth error:", error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent(error)}`,
      )
    }

    if (!code) {
      console.error("Missing authorization code")
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Missing authorization code")}`,
      )
    }

    // Validate the user is authenticated
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

    // Exchange the code for tokens
    const clientId = process.env.CALENDLY_CLIENT_ID
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET

    // Ensure the base URL has no trailing slash
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1)
    }

    const redirectUri = `${baseUrl}/api/calendly/callback`

    if (!clientId || !clientSecret) {
      console.error("Missing Calendly credentials")
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Calendly integration not configured")}`,
      )
    }

    console.log("Using redirect URI for token exchange:", redirectUri)
    const tokens = await exchangeCalendlyCode(code, clientId, clientSecret, redirectUri)

    // Get the user's Calendly information
    const calendlyUser = await getCurrentUser(tokens.accessToken)

    // Extract username from scheduling URL
    const username = calendlyUser.schedulingUrl.split("calendly.com/")[1]

    // Update the mentor's Calendly information
    const { error: updateError } = await supabase
      .from("mentors")
      .update({
        calendly_username: username,
        calendly_access_token: tokens.accessToken,
        calendly_refresh_token: tokens.refreshToken,
        calendly_token_expires_at: tokens.expiresAt.toISOString(),
        calendly_user_uri: calendlyUser.uri,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating mentor:", updateError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Failed to update Calendly information")}`,
      )
    }

    // Redirect back to the Calendly dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?success=true`)
  } catch (error) {
    console.error("Unexpected error in Calendly callback route:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent("An unexpected error occurred")}`,
    )
  }
}
