import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get code from query params
    const code = request.nextUrl.searchParams.get("code")
    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=no_code`)
    }

    // Get user
    const supabase = createRouteHandlerClient({ cookies })
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`)
    }

    // Get credentials
    const clientId = process.env.CALENDLY_CLIENT_ID
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=missing_credentials`)
    }

    // Build redirect URI
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1)
    }
    const redirectUri = `${baseUrl}/api/calendly/simple-callback`

    // Exchange code for token
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

    // Check for rate limiting or other errors
    if (!tokenResponse.ok) {
      const statusCode = tokenResponse.status
      const responseText = await tokenResponse.text()

      console.error(`Token exchange failed (${statusCode}):`, responseText)

      if (statusCode === 429) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=rate_limited`)
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=token_exchange_failed`)
    }

    // Parse token response
    let tokens
    try {
      tokens = await tokenResponse.json()
    } catch (error) {
      console.error("Failed to parse token response:", error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=invalid_token_response`,
      )
    }

    // Get user info
    const userResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    // Check for rate limiting or other errors
    if (!userResponse.ok) {
      const statusCode = userResponse.status
      const responseText = await userResponse.text()

      console.error(`User info failed (${statusCode}):`, responseText)

      if (statusCode === 429) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=rate_limited`)
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=user_info_failed`)
    }

    // Parse user response
    let userData
    try {
      userData = await userResponse.json()
    } catch (error) {
      console.error("Failed to parse user response:", error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=invalid_user_response`)
    }

    // Extract important user data
    const username = userData.resource.scheduling_url.split("calendly.com/")[1]

    // IMPORTANT: Extract and store the user URI
    const userUri = userData.resource.uri
    console.log("Extracted Calendly user URI:", userUri)

    // Calculate token expiration time
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    // Update database with all Calendly information
    const { error: updateError } = await supabase
      .from("mentors")
      .update({
        calendly_username: username,
        calendly_access_token: tokens.access_token,
        calendly_refresh_token: tokens.refresh_token,
        calendly_token_expires_at: expiresAt,
        calendly_user_uri: userUri, // Store the user URI
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user.id)

    if (updateError) {
      console.error("Database update failed:", updateError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=database_update_failed`,
      )
    }

    // Success!
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?success=true`)
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/calendly?error=callback_failed`)
  }
}
