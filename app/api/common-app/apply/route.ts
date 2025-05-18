import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get the data from the request
    const { activities, awards } = await request.json()

    // Validate the data
    if (!Array.isArray(activities) || !Array.isArray(awards)) {
      return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 })
    }

    // Add activities to the database
    for (const activity of activities) {
      // Validate activity data
      if (!activity.title) continue

      await supabase.from("activities").insert({
        user_id: user.id,
        title: activity.title,
        role: activity.role || null,
        organization: activity.organization || null,
        description: activity.description || null,
        time_commitment: activity.timeCommitment || null,
        years: activity.years || null,
        source: "common_app",
      })
    }

    // Add awards to the database
    for (const award of awards) {
      // Validate award data
      if (!award.title) continue

      await supabase.from("awards").insert({
        user_id: user.id,
        title: award.title,
        awarding_organization: award.awarding_organization || null,
        level: award.level || null,
        year: award.year || null,
        source: "common_app",
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error applying data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to apply data to profile",
      },
      {
        status: 500,
      },
    )
  }
}
