import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id

    // Get the current user
    const {
      data: { session: userSession },
    } = await supabase.auth.getSession()

    if (!userSession?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = userSession.user.id

    // Get the booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        mentors:mentor_id(id, name:profiles(name)),
        service:service_id(id, name, price)
      `)
      .eq("id", bookingId)
      .single()

    if (bookingError) {
      console.error("Error getting booking:", bookingError)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if the user is authorized to view this booking
    if (booking.client_id !== userId && booking.mentor_id !== userId) {
      return NextResponse.json({ error: "Not authorized to view this booking" }, { status: 403 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error getting booking:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get booking" },
      { status: 500 },
    )
  }
}
