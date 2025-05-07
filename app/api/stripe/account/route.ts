import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Safely initialize Stripe only if we have a key
let stripe: Stripe | null = null
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (stripeSecretKey) {
  try {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
  } catch (error) {
    console.error("Failed to initialize Stripe:", error)
  }
}

export async function GET(request: Request) {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      console.warn("Stripe is not initialized. Missing or invalid STRIPE_SECRET_KEY.")
      return NextResponse.json({ account: null }, { status: 200 })
    }

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("Supabase is not properly configured. Missing URL or service key.")
      return NextResponse.json({ account: null }, { status: 200 })
    }

    // Initialize Supabase client
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the session cookie
    const cookieHeader = request.headers.get("cookie") || ""

    // Extract the session token from cookies
    const sessionMatch = cookieHeader.match(/sb-.*?-auth-token=([^;]*)/)
    if (!sessionMatch) {
      console.warn("No session token found in cookies")
      return NextResponse.json({ account: null }, { status: 200 })
    }

    // Get session data
    const {
      data: { user },
      error: sessionError,
    } = await adminSupabase.auth.getUser()

    if (sessionError || !user) {
      console.warn("Session error or no user:", sessionError)
      return NextResponse.json({ account: null }, { status: 200 })
    }

    // Get mentor data - STANDARDIZED to use stripe_connect_accounts consistently
    const { data: mentor, error: mentorError } = await adminSupabase
      .from("mentors")
      .select(
        "stripe_connect_accounts, stripe_account_details_submitted, stripe_account_charges_enabled, stripe_account_payouts_enabled",
      )
      .eq("id", user.id)
      .single()

    if (mentorError) {
      console.warn("Error fetching mentor data:", mentorError)
      // If the mentor doesn't exist, return null account instead of error
      return NextResponse.json({ account: null }, { status: 200 })
    }

    // Use stripe_connect_accounts consistently
    const stripeAccountId = mentor?.stripe_connect_accounts

    // If no Stripe account connected
    if (!stripeAccountId) {
      return NextResponse.json({ account: null }, { status: 200 })
    }

    try {
      // Get Stripe account
      const account = await stripe.accounts.retrieve(stripeAccountId)

      // Update account status in database if it has changed
      if (
        account.details_submitted !== mentor.stripe_account_details_submitted ||
        account.charges_enabled !== mentor.stripe_account_charges_enabled ||
        account.payouts_enabled !== mentor.stripe_account_payouts_enabled
      ) {
        await adminSupabase
          .from("mentors")
          .update({
            stripe_account_details_submitted: account.details_submitted,
            stripe_account_charges_enabled: account.charges_enabled,
            stripe_account_payouts_enabled: account.payouts_enabled,
          })
          .eq("id", user.id)
      }

      return NextResponse.json({
        account: {
          id: account.id,
          details_submitted: account.details_submitted,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
        },
      })
    } catch (stripeError: any) {
      console.warn("Stripe API error:", stripeError)
      // Return null account instead of error
      return NextResponse.json({ account: null }, { status: 200 })
    }
  } catch (error: any) {
    console.error("Error in /api/stripe/account:", error)
    // Return null account instead of error
    return NextResponse.json({ account: null }, { status: 200 })
  }
}
