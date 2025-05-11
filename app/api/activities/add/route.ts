import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the activity data from the request
    const activityData = await request.json()

    // Validate the data
    if (!activityData.title || !activityData.organization || !activityData.years || !activityData.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Add the activity to the database
    const { data, error } = await supabase
      .from("activities")
      .insert([
        {
          mentor_id: user.id,
          title: activityData.title,
          organization: activityData.organization,
          years: activityData.years,
          description: activityData.description,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error adding activity:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in activities/add route:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
