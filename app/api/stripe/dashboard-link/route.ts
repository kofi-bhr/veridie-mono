import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2023-10-16",
})

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
  try {
    // Get the session cookie
    const cookieHeader = request.headers.get("cookie") || ""

    // Extract the session token from cookies
    const sessionMatch = cookieHeader.match(/sb-.*?-auth-token=([^;]*)/)
    if (!sessionMatch) {
      console.error("No session token found in cookies")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get session data
    const {
      data: { user },
      error: sessionError,
    } = await adminSupabase.auth.getUser()

    if (sessionError || !user) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get mentor data
    const { data: mentor, error: mentorError } = await adminSupabase
      .from("mentors")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single()

    if (mentorError || !mentor?.stripe_account_id) {
      console.error("Error fetching mentor data:", mentorError)
      return NextResponse.json({ error: "No Stripe account connected" }, { status: 404 })
    }

    try {
      // Create login link
      const link = await stripe.accounts.createLoginLink(mentor.stripe_account_id)

      return NextResponse.json({ url: link.url })
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError)
      return NextResponse.json({ error: `Stripe API error: ${stripeError.message}` }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error in /api/stripe/dashboard-link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
