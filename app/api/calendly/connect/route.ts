import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceRole)

export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const { mentorId, username } = await request.json()

    // Verify that the authenticated user is the mentor
    if (session.user.id !== mentorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate the username
    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 })
    }

    // Clean the username (remove any "calendly.com/" prefix if present)
    const cleanUsername = username.replace(/^(https?:\/\/)?(www\.)?(calendly\.com\/)?/, "").trim()

    // Update the mentor's Calendly username
    const { error } = await supabase.from("mentors").update({ calendly_username: cleanUsername }).eq("id", mentorId)

    if (error) {
      console.error("Error updating Calendly username:", error)
      return NextResponse.json({ error: "Failed to update Calendly username" }, { status: 500 })
    }

    return NextResponse.json({ success: true, username: cleanUsername })
  } catch (error) {
    console.error("Error connecting Calendly account:", error)
    return NextResponse.json({ error: "Failed to connect Calendly account" }, { status: 500 })
  }
}
