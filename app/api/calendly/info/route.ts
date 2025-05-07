import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the query parameters
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Validate the user is authenticated
    const supabase = createRouteHandlerClient({ cookies })

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error("Authentication error:", authError)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } catch (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 })
    }

    try {
      // Get the mentor's Calendly information
      const { data: mentor, error: mentorError } = await supabase
        .from("mentors")
        .select("calendly_username, calendly_token_expires_at")
        .eq("id", userId)
        .single()

      if (mentorError) {
        console.error("Error fetching mentor:", mentorError)

        // If the error is about the relation not existing, return a more specific error
        if (mentorError.message?.includes("does not exist")) {
          return NextResponse.json(
            {
              error: "Database schema issue: " + mentorError.message,
              details: mentorError,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({ error: "Mentor not found" }, { status: 404 })
      }

      return NextResponse.json({
        calendlyUsername: mentor.calendly_username,
        expiresAt: mentor.calendly_token_expires_at,
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          error: "Database error",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unexpected error in Calendly info route:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
