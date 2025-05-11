import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user's Calendly data directly from database
    const { data, error } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_access_token, calendly_refresh_token, updated_at")
      .eq("id", userData.user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "Database query failed", details: error }, { status: 500 })
    }

    // Return sanitized data (don't expose full tokens)
    return NextResponse.json({
      username: data.calendly_username,
      hasAccessToken: !!data.calendly_access_token,
      hasRefreshToken: !!data.calendly_refresh_token,
      lastUpdated: data.updated_at,
      isConnected: !!(data.calendly_username && data.calendly_access_token && data.calendly_refresh_token),
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
