import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Verify the user is authorized to clear these tokens
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session?.user || sessionData.session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Clear the Calendly tokens
    const { error: updateError } = await supabase
      .from("mentors")
      .update({
        calendly_access_token: null,
        calendly_refresh_token: null,
        calendly_token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error clearing tokens:", updateError)
      return NextResponse.json({ error: "Failed to clear tokens" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in clear tokens endpoint:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
