import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { deleteService } from "@/lib/supabase"

export async function DELETE(request: NextRequest) {
  try {
    // Get the service ID from the query parameters
    const serviceId = request.nextUrl.searchParams.get("serviceId")

    if (!serviceId) {
      return NextResponse.json({ error: "Missing serviceId parameter" }, { status: 400 })
    }

    // Validate the user is authenticated and is the owner of the service
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user owns the service
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("mentor_id")
      .eq("id", serviceId)
      .single()

    if (serviceError) {
      console.error("Error fetching service:", serviceError)
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    if (service.mentor_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own services" }, { status: 403 })
    }

    // Delete the service
    const { data, error } = await deleteService(serviceId)

    if (error) {
      console.error("Error deleting service:", error)
      return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
    }

    return NextResponse.json({ success: true, service: data })
  } catch (error) {
    console.error("Unexpected error in delete-service route:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
