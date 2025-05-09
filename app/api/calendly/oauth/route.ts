import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reconnect = searchParams.get("reconnect") === "true"

    // Get the Calendly OAuth credentials
    const clientId = process.env.CALENDLY_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendly/callback`

    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: "Missing Calendly credentials" }, { status: 500 })
    }

    // Generate a random state to prevent CSRF attacks
    const state = Math.random().toString(36).substring(2, 15)

    // Store the state in a cookie for verification later
    const response = NextResponse.json({
      authUrl: `https://auth.calendly.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
    })

    // Set a cookie with the state
    response.cookies.set("calendly_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    // If this is a reconnection, store that in a cookie too
    if (reconnect) {
      response.cookies.set("calendly_reconnect", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Error generating Calendly OAuth URL:", error)
    return NextResponse.json({ error: "Failed to generate authorization URL" }, { status: 500 })
  }
}
