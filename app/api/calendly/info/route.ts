import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Initialize Supabase client with proper error checking
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase credentials are missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get mentor info
    const { data: mentor, error } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_user_uri, calendly_access_token")
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error fetching mentor:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 })
    }

    return NextResponse.json({
      calendlyUsername: mentor.calendly_username || null,
      isOAuthConnected: !!mentor.calendly_access_token,
      hasUserUri: !!mentor.calendly_user_uri,
    })
  } catch (error: any) {
    console.error("Error getting Calendly info:", error)
    return NextResponse.json({ error: error.message || "Failed to get Calendly info" }, { status: 500 })
  }
}
