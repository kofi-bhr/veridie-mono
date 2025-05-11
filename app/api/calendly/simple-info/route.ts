import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    // Get user's Calendly data from database
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_access_token, calendly_refresh_token, calendly_token_expires_at, updated_at")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Database query error:", error)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }

    // Check if token is expired
    const tokenExpiresAt = data.calendly_token_expires_at ? new Date(data.calendly_token_expires_at) : null
    const isTokenExpired = tokenExpiresAt ? tokenExpiresAt < new Date() : false

    return NextResponse.json({
      username: data.calendly_username,
      isConnected: !!(data.calendly_username && data.calendly_access_token && data.calendly_refresh_token),
      hasToken: !!data.calendly_access_token,
      isTokenExpired,
      lastUpdated: data.updated_at,
    })
  } catch (error) {
    console.error("Error getting Calendly info:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
