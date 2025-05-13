import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      console.log("Missing userId parameter")
      return NextResponse.json(
        {
          error: "Missing userId parameter",
          username: null,
          isConnected: false,
        },
        { status: 400 },
      )
    }

    console.log("Fetching Calendly info for user:", userId)

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // First check if the user exists
    const { data: userExists, error: userCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (userCheckError) {
      console.error("User check failed:", userCheckError)
      return NextResponse.json({
        error: "User not found",
        username: null,
        isConnected: false,
      })
    }

    // Now check if the mentor record exists
    const { data, error } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_access_token, calendly_refresh_token, calendly_token_expires_at")
      .eq("id", userId)

    if (error) {
      console.error("Database query failed:", error)
      return NextResponse.json({
        error: "Database query failed",
        details: error.message,
        username: null,
        isConnected: false,
      })
    }

    // If no mentor record or empty array, return not connected
    if (!data || data.length === 0) {
      console.log("No mentor record found for user:", userId)
      return NextResponse.json({
        username: null,
        isConnected: false,
      })
    }

    // Get the first mentor record (should only be one)
    const mentor = data[0]

    // Check if the user actually has Calendly credentials
    const isConnected = !!(mentor?.calendly_username && mentor?.calendly_access_token && mentor?.calendly_refresh_token)

    // Check if token is expired
    const tokenExpiresAt = mentor?.calendly_token_expires_at ? new Date(mentor.calendly_token_expires_at) : null
    const isTokenExpired = tokenExpiresAt ? tokenExpiresAt < new Date() : false

    // Determine if the user needs to reconnect
    const needsReconnect = isTokenExpired && isConnected

    console.log("Calendly connection status for user:", userId, "is:", isConnected)
    console.log("Token expires at:", tokenExpiresAt)
    console.log("Token expired:", isTokenExpired)
    console.log("Needs reconnect:", needsReconnect)

    return NextResponse.json({
      username: mentor?.calendly_username || null,
      isConnected: isConnected,
      tokenExpiresAt: mentor?.calendly_token_expires_at || null,
      isTokenExpired: isTokenExpired,
      needsReconnect: needsReconnect,
    })
  } catch (error) {
    console.error("Unexpected error in Calendly info endpoint:", error)
    // Return a more graceful error response
    return NextResponse.json(
      {
        error: "Server error",
        message: error instanceof Error ? error.message : "Unknown error",
        username: null,
        isConnected: false,
      },
      { status: 200 }, // Return 200 to prevent client-side errors
    )
  }
}
