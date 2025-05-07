import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET(request: Request) {
  try {
    // Get the current user from the session
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get the Stripe account ID from the database
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("stripe_connect_accounts")
      .eq("id", userId)
      .single()

    if (mentorError) {
      console.error("Error fetching mentor:", mentorError)
      return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 500 })
    }

    if (!mentor?.stripe_connect_accounts) {
      return NextResponse.json({ error: "No Stripe account found" }, { status: 404 })
    }

    // Create a dashboard link
    const stripe = getStripe()
    const link = await stripe.accounts.createLoginLink(mentor.stripe_connect_accounts)

    return NextResponse.json({ url: link.url })
  } catch (error) {
    console.error("Error creating dashboard link:", error)
    return NextResponse.json({ error: "Failed to create dashboard link" }, { status: 500 })
  }
}
