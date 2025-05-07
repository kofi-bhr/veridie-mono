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
      return NextResponse.json({ account: null }, { status: 200 })
    }

    // Get session data
    const {
      data: { user },
      error: sessionError,
    } = await adminSupabase.auth.getUser()

    if (sessionError || !user) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ account: null }, { status: 200 })
    }

    // Get mentor data
    const { data: mentor, error: mentorError } = await adminSupabase
      .from("mentors")
      .select("stripe_connect_accounts")
      .eq("id", user.id)
      .single()

    if (mentorError) {
      console.error("Error fetching mentor data:", mentorError)
      // If the mentor doesn't exist, return null account instead of error
      if (mentorError.code === "PGRST116") {
        return NextResponse.json({ account: null }, { status: 200 })
      }
      return NextResponse.json({ account: null, error: "Failed to fetch mentor data" }, { status: 200 })
    }

    // If no Stripe account connected
    if (!mentor?.stripe_connect_accounts) {
      return NextResponse.json({ account: null }, { status: 200 })
    }

    try {
      // Get Stripe account
      const account = await stripe.accounts.retrieve(mentor.stripe_connect_accounts)

      return NextResponse.json({
        account: {
          id: account.id,
          details_submitted: account.details_submitted,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
        },
      })
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError)
      // Return null account instead of error
      return NextResponse.json({ account: null }, { status: 200 })
    }
  } catch (error: any) {
    console.error("Error in /api/stripe/account:", error)
    // Return null account instead of error
    return NextResponse.json({ account: null }, { status: 200 })
  }
}
