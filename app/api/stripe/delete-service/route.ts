import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { getStripe } from "@/lib/stripe"

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const serviceId = url.searchParams.get("serviceId")

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    console.log(`Attempting to delete service with ID: ${serviceId}`)

    // Get the current user from the session
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get service details
    const { data: service, error: fetchError } = await supabase
      .from("services")
      .select("stripe_product_id, mentor_id")
      .eq("id", serviceId)
      .single()

    if (fetchError) {
      console.error("Error fetching service:", fetchError)
      return NextResponse.json({ error: "Failed to fetch service details" }, { status: 500 })
    }

    // Verify the user owns this service
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (service.mentor_id !== session.user.id) {
      return NextResponse.json({ error: "You do not have permission to delete this service" }, { status: 403 })
    }

    // Deactivate the Stripe product if it exists
    if (service.stripe_product_id) {
      try {
        const stripe = getStripe()
        await stripe.products.update(service.stripe_product_id, { active: false })
        console.log(`Deactivated Stripe product: ${service.stripe_product_id}`)
      } catch (stripeError) {
        console.error("Error deactivating Stripe product:", stripeError)
        // Continue with database deletion even if Stripe update fails
      }
    }

    // Delete the service from the database
    const { error: deleteError } = await supabase.from("services").delete().eq("id", serviceId)

    if (deleteError) {
      console.error("Error deleting service:", deleteError)
      return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error in delete service route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
