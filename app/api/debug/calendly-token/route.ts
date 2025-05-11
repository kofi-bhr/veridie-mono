import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import { refreshCalendlyToken } from "@/lib/calendly-token-refresh"

export async function POST(request: Request) {
  try {
    const { mentorId } = await request.json()

    if (!mentorId) {
      return NextResponse.json({ error: "Mentor ID is required" }, { status: 400 })
    }

    // Get the mentor's Calendly tokens
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_access_token, calendly_refresh_token, calendly_token_expires_at")
      .eq("id", mentorId)
      .single()

    if (mentorError || !mentor) {
      return NextResponse.json(
        {
          error: "Mentor not found",
          details: mentorError?.message,
        },
        { status: 404 },
      )
    }

    // Check if token exists
    if (!mentor.calendly_access_token) {
      return NextResponse.json({
        status: "no_token",
        message: "Mentor does not have a Calendly access token",
        mentor: {
          id: mentorId,
          calendly_username: mentor.calendly_username,
          has_access_token: false,
          has_refresh_token: !!mentor.calendly_refresh_token,
        },
      })
    }

    // Check if token is expired
    const now = new Date()
    const tokenExpiresAt = mentor.calendly_token_expires_at ? new Date(mentor.calendly_token_expires_at) : null

    const isExpired = tokenExpiresAt ? now > tokenExpiresAt : false

    // If token is expired and we have a refresh token, try to refresh it
    let refreshResult = null
    if (isExpired && mentor.calendly_refresh_token) {
      try {
        refreshResult = await refreshCalendlyToken(mentorId, mentor.calendly_refresh_token)
      } catch (refreshError) {
        refreshResult = {
          success: false,
          error: refreshError instanceof Error ? refreshError.message : "Unknown error",
        }
      }
    }

    // Test the token with a simple Calendly API call
    let tokenTest = null
    if (mentor.calendly_access_token) {
      try {
        const response = await fetch("https://api.calendly.com/users/me", {
          headers: {
            Authorization: `Bearer ${mentor.calendly_access_token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          tokenTest = {
            status: "valid",
            user: data.resource,
          }
        } else {
          const errorText = await response.text()
          tokenTest = {
            status: "invalid",
            statusCode: response.status,
            error: errorText,
          }
        }
      } catch (testError) {
        tokenTest = {
          status: "error",
          error: testError instanceof Error ? testError.message : "Unknown error",
        }
      }
    }

    return NextResponse.json({
      mentor: {
        id: mentorId,
        calendly_username: mentor.calendly_username,
        has_access_token: !!mentor.calendly_access_token,
        has_refresh_token: !!mentor.calendly_refresh_token,
        token_expires_at: mentor.calendly_token_expires_at,
        is_token_expired: isExpired,
      },
      token_test: tokenTest,
      refresh_result: refreshResult,
    })
  } catch (error) {
    console.error("Error in debug Calendly token:", error)
    return NextResponse.json(
      {
        error: "Failed to check Calendly token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
