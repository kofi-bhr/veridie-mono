import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

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
    const { data: mentorData, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_access_token, calendly_refresh_token")
      .eq("id", userId)

    if (mentorError) {
      console.error("Mentor query failed:", mentorError)
      return NextResponse.json({
        error: "Failed to retrieve mentor data",
        username: null,
        isConnected: false,
      })
    }

    // If no mentor record or empty array, return not connected
    if (!mentorData || mentorData.length === 0) {
      return NextResponse.json({
        username: null,
        isConnected: false,
      })
    }

    // Get the first mentor record (should only be one)
    const mentor = mentorData[0]

    // Check if the user actually has Calendly credentials
    const isConnected = !!(mentor?.calendly_username && mentor?.calendly_access_token && mentor?.calendly_refresh_token)

    return NextResponse.json({
      username: mentor?.calendly_username || null,
      isConnected: isConnected,
    })
  } catch (error) {
    console.error("Info error:", error)
    // Return a more graceful error response
    return NextResponse.json(
      {
        error: "Server error",
        username: null,
        isConnected: false,
      },
      { status: 200 },
    ) // Return 200 to prevent client-side errors
  }
}
