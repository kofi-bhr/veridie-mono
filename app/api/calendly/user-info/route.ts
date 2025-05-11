import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Get the mentor's Calendly information
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_token_expires_at")
      .eq("id", userId)
      .single()

    if (mentorError) {
      console.error("Error fetching mentor:", mentorError)
      return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 404 })
    }

    // Return the Calendly username
    return NextResponse.json({
      username: mentor.calendly_username,
      expiresAt: mentor.calendly_token_expires_at,
    })
  } catch (error) {
    console.error("Error in Calendly user info route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
