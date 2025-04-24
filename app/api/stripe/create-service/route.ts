import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { addService } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { mentorId, name, description, price, calendlyEventTypeUri } = body

    if (!mentorId || !name || !description || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: mentorId, name, description, price" },
        { status: 400 },
      )
    }

    // Validate the user is authenticated and is the mentor
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.id !== mentorId) {
      return NextResponse.json({ error: "You can only add services to your own profile" }, { status: 403 })
    }

    // Add the service
    const { data, error } = await addService(mentorId, {
      name,
      description,
      price,
      calendlyEventTypeUri,
    })

    if (error) {
      console.error("Error adding service:", error)
      return NextResponse.json({ error: "Failed to add service" }, { status: 500 })
    }

    return NextResponse.json({ success: true, service: data })
  } catch (error) {
    console.error("Unexpected error in create-service route:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
