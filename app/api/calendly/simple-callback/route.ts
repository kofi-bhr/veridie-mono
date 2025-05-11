import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { CALENDLY_CLIENT_ID, CALENDLY_CLIENT_SECRET } from "@/lib/api-config"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the query parameters
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    console.log("Calendly callback received:", {
      code: code ? "present" : "missing",
      error,
      errorDescription,
    })

    // Handle error from Calendly
    if (error) {
      console.error("Calendly OAuth error:", error, errorDescription)
      return NextResponse.redirect(
        new URL(`/dashboard/calendly?error=${encodeURIComponent(errorDescription || error)}`, request.url),
      )
    }

    // Check if code is available
    if (!code) {
      console.error("Missing authorization code")
      return NextResponse.redirect(
        new URL(`/dashboard/calendly?error=${encodeURIComponent("Missing authorization code")}`, request.url),
      )
    }

    // Check if Calendly credentials are available
    if (!CALENDLY_CLIENT_ID || !CALENDLY_CLIENT_SECRET) {
      console.error("Missing Calendly credentials")
      return NextResponse.redirect(
        new URL(`/dashboard/calendly?error=${encodeURIComponent("Missing Calendly credentials")}`, request.url),
      )
    }

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

    // Construct the redirect URI (must match the one used in the authorization request)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/calendly/simple-callback`

    console.log("Exchanging code for tokens with redirect URI:", redirectUri)

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CALENDLY_CLIENT_ID,
        client_secret: CALENDLY_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }).toString(),
    })

    // Check for rate limiting
    if (tokenResponse.status === 429) {
      console.error("Calendly API rate limit exceeded")
      return NextResponse.redirect(new URL(`/dashboard/calendly?error=rate_limited`, request.url))
    }

    // Check if the token request was successful
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error(`Token exchange error (${tokenResponse.status}):`, errorText)
      return NextResponse.redirect(
        new URL(
          `/dashboard/calendly?error=${encodeURIComponent(`Token exchange failed: ${tokenResponse.status} - ${errorText}`)}`,
          request.url,
        ),
      )
    }

    // Parse the token response
    let tokenData
    try {
      tokenData = await tokenResponse.json()
      console.log("Token exchange successful, received access token")
    } catch (e) {
      console.error("Failed to parse token response:", e)
      return NextResponse.redirect(
        new URL(`/dashboard/calendly?error=${encodeURIComponent("Invalid token response")}`, request.url),
      )
    }

    // Get the user's Calendly information
    console.log("Fetching Calendly user info")
    const userResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    // Check for rate limiting
    if (userResponse.status === 429) {
      console.error("Calendly API rate limit exceeded")
      return NextResponse.redirect(new URL(`/dashboard/calendly?error=rate_limited`, request.url))
    }

    // Check if the user request was successful
    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error(`User info error (${userResponse.status}):`, errorText)
      return NextResponse.redirect(
        new URL(
          `/dashboard/calendly?error=${encodeURIComponent(`User info failed: ${userResponse.status} - ${errorText}`)}`,
          request.url,
        ),
      )
    }

    // Parse the user response
    let userData2
    try {
      userData2 = await userResponse.json()
      console.log("Successfully retrieved Calendly user info:", userData2.resource.name)
    } catch (e) {
      console.error("Failed to parse user response:", e)
      return NextResponse.redirect(
        new URL(`/dashboard/calendly?error=${encodeURIComponent("Invalid user response")}`, request.url),
      )
    }

    const calendlyUsername = userData2.resource.name
    const calendlyUri = userData2.resource.uri

    // Calculate token expiration time
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
    console.log("Token expires at:", expiresAt.toISOString())

    // Update the user's Calendly information in the database
    console.log("Updating database with Calendly credentials")
    const { error: updateError } = await supabase
      .from("mentors")
      .update({
        calendly_username: calendlyUsername,
        calendly_access_token: tokenData.access_token,
        calendly_refresh_token: tokenData.refresh_token,
        calendly_token_expires_at: expiresAt.toISOString(),
        calendly_user_uri: calendlyUri,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userData.user.id)

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.redirect(
        new URL(
          `/dashboard/calendly?error=${encodeURIComponent("Database update failed: " + updateError.message)}`,
          request.url,
        ),
      )
    }

    console.log("Calendly integration successful, redirecting to dashboard")
    // Redirect to the Calendly page with success parameter
    return NextResponse.redirect(new URL(`/dashboard/calendly?success=true`, request.url))
  } catch (error) {
    console.error("Callback error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.redirect(
      new URL(`/dashboard/calendly?error=${encodeURIComponent("Server error: " + errorMessage)}`, request.url),
    )
  }
}
