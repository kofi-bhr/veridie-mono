import { type NextRequest, NextResponse } from "next/server"
import { CALENDLY_CLIENT_ID, CALENDLY_CLIENT_SECRET } from "@/lib/api-config"

export async function GET(request: NextRequest) {
  try {
    // Get all query parameters
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    // Log everything for debugging
    console.log("Calendly debug callback received:", {
      url: request.url,
      code: code ? "present" : "missing",
      error,
      errorDescription,
      allParams: Object.fromEntries(searchParams.entries()),
    })

    // If there's an error, redirect with the error
    if (error) {
      return NextResponse.redirect(
        new URL(`/calendly-debug?error=${encodeURIComponent(errorDescription || error)}`, request.url),
      )
    }

    // If there's no code, redirect with an error
    if (!code) {
      return NextResponse.redirect(
        new URL(`/calendly-debug?error=${encodeURIComponent("No authorization code received")}`, request.url),
      )
    }

    // Check if we have credentials
    if (!CALENDLY_CLIENT_ID || !CALENDLY_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL(`/calendly-debug?error=${encodeURIComponent("Missing Calendly credentials")}`, request.url),
      )
    }

    // Construct the redirect URI based on the current request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/calendly/debug-callback`

    console.log("Exchanging code for tokens with redirect URI:", redirectUri)

    // Exchange the code for tokens
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

    // Check the response
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error(`Token exchange error (${tokenResponse.status}):`, errorText)
      return NextResponse.redirect(
        new URL(
          `/calendly-debug?error=${encodeURIComponent(`Token exchange failed: ${tokenResponse.status} - ${errorText}`)}`,
          request.url,
        ),
      )
    }

    // Parse the token response
    const tokenData = await tokenResponse.json()

    // Get the user info
    const userResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    // Check the user response
    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error(`User info error (${userResponse.status}):`, errorText)
      return NextResponse.redirect(
        new URL(
          `/calendly-debug?error=${encodeURIComponent(`User info failed: ${userResponse.status} - ${errorText}`)}`,
          request.url,
        ),
      )
    }

    // Parse the user response
    const userData = await userResponse.json()

    // Success! Redirect with a success message
    return NextResponse.redirect(
      new URL(
        `/calendly-debug?message=${encodeURIComponent(
          `Successfully connected to Calendly as ${userData.resource.name}. Access token obtained.`,
        )}`,
        request.url,
      ),
    )
  } catch (error) {
    console.error("Debug callback error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.redirect(
      new URL(`/calendly-debug?error=${encodeURIComponent(`Server error: ${errorMessage}`)}`, request.url),
    )
  }
}
