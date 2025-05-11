import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

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

    // Create a Supabase client using the route handler client
    const supabase = createRouteHandlerClient({ cookies })

    // Validate the user is authenticated
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

    // Check if Calendly credentials are configured
    const clientId = process.env.CALENDLY_CLIENT_ID
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("Missing Calendly credentials")
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

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Token exchange error:", errorText)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Failed to exchange authorization code")}`,
      )
    }

    const tokens = await tokenResponse.json()
    const accessToken = tokens.access_token
    const refreshToken = tokens.refresh_token
    const expiresIn = tokens.expires_in || 3600 // Default to 1 hour
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Get the user's Calendly information
    const userResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error("User info error:", errorText)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Failed to get user information")}`,
      )
    }

    const userData = await userResponse.json()
    const calendlyUser = userData.resource
    const username = calendlyUser.scheduling_url.split("calendly.com/")[1]

    console.log("Successfully retrieved Calendly user info:", {
      username,
      uri: calendlyUser.uri,
    })

    // Update the mentor's Calendly information
    const { error: updateError } = await supabase
      .from("mentors")
      .update({
        calendly_username: username,
        calendly_access_token: accessToken,
        calendly_refresh_token: refreshToken,
        calendly_token_expires_at: expiresAt.toISOString(),
        calendly_user_uri: calendlyUser.uri,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating mentor:", updateError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Failed to update Calendly information")}`,
      )
    }

    // Redirect back to the Calendly dashboard with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?success=true`)
  } catch (error) {
    console.error("Unexpected error in Calendly callback route:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=${encodeURIComponent("An unexpected error occurred")}`,
    )
  }
}
