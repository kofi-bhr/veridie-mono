import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Get the stored state from cookies
    const cookieStore = cookies()
    const storedState = cookieStore.get("calendly_oauth_state")?.value
    const isReconnect = cookieStore.get("calendly_reconnect")?.value === "true"

    // Clear the cookies
    const response = NextResponse.redirect(new URL("/dashboard/calendly", request.url))
    response.cookies.delete("calendly_oauth_state")
    response.cookies.delete("calendly_reconnect")

    // Check if there was an error
    if (error) {
      console.error("Calendly OAuth error:", error)
      return NextResponse.redirect(new URL(`/dashboard/calendly?error=${encodeURIComponent(error)}`, request.url))
    }

    // Validate the state to prevent CSRF attacks
    if (!state || !storedState || state !== storedState) {
      console.error("Invalid state parameter")
      return NextResponse.redirect(new URL("/dashboard/calendly?error=invalid_state", request.url))
    }

    // Check if we have the authorization code
    if (!code) {
      console.error("Missing authorization code")
      return NextResponse.redirect(new URL("/dashboard/calendly?error=missing_code", request.url))
    }

    // Exchange the code for an access token
    const tokenResponse = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.CALENDLY_CLIENT_ID,
        client_secret: process.env.CALENDLY_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendly/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error(`Token exchange error (${tokenResponse.status}): ${errorText}`)
      return NextResponse.redirect(new URL(`/dashboard/calendly?error=token_exchange_failed`, request.url))
    }

    const tokenData = await tokenResponse.json()

    // Get the user's Calendly info
    const userResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error(`User info error (${userResponse.status}): ${errorText}`)
      return NextResponse.redirect(new URL(`/dashboard/calendly?error=user_info_failed`, request.url))
    }

    const userData = await userResponse.json()
    const user = userData.resource

    // Get the current user from the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.error("No active session")
      return NextResponse.redirect(new URL("/auth/login?error=no_session", request.url))
    }

    // Calculate token expiration time (Calendly tokens typically last 1 hour)
    const expiresIn = tokenData.expires_in || 3600 // Default to 1 hour if not provided
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Update the mentor record with Calendly info
    const { error: updateError } = await supabase
      .from("mentors")
      .update({
        calendly_access_token: tokenData.access_token,
        calendly_refresh_token: tokenData.refresh_token,
        calendly_token_expires_at: expiresAt.toISOString(),
        calendly_username: user.name,
        calendly_user_uri: user.uri,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id)

    if (updateError) {
      console.error("Error updating mentor record:", updateError)
      return NextResponse.redirect(new URL(`/dashboard/calendly?error=update_failed`, request.url))
    }

    // Redirect to the appropriate page
    const redirectUrl = isReconnect ? "/dashboard/calendly?reconnected=true" : "/dashboard/calendly?connected=true"

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error("Error in Calendly callback:", error)
    return NextResponse.redirect(new URL("/dashboard/calendly?error=unexpected", request.url))
  }
}
