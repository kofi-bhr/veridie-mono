import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { addService } from "@/lib/supabase-server"

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

    const userId = session.user.id
    const { name, description, price, duration, calendlyEventTypeUri } = await request.json()

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    // Add service with Stripe product
    const { data, error } = await addService(userId, {
      name,
      description: description || "",
      price: Number.parseFloat(price),
    })

    if (error) {
      console.error("Error creating service:", error)
      return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
    }

    // Update the service with additional fields
    if (data) {
      const { error: updateError } = await supabase
        .from("services")
        .update({
          duration: Number.parseInt(duration) || 60,
          calendly_event_type_uri: calendlyEventTypeUri || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)

      if (updateError) {
        console.error("Error updating service with additional fields:", updateError)
        // Continue anyway since the core service was created
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in create-service route:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while creating the service" },
      { status: 500 },
    )
  }
}
