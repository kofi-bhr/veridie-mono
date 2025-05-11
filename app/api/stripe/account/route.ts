import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { getStripe } from "@/lib/stripe"

export async function POST(request: Request) {
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

    // Get request body
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Verify that the user is requesting their own account
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get Stripe instance
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 500 })
    }

    // Get the user's Stripe account ID
    const { data: mentor, error: fetchError } = await supabase
      .from("mentors")
      .select("stripe_connect_accounts")
      .eq("id", userId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 500 })
    }

    if (!mentor?.stripe_connect_accounts) {
      return NextResponse.json({
        accountId: null,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      })
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(mentor.stripe_connect_accounts)

    // Update the database with the latest account status
    await supabase
      .from("mentors")
      .update({
        stripe_account_details_submitted: account.details_submitted,
        stripe_account_charges_enabled: account.charges_enabled,
        stripe_account_payouts_enabled: account.payouts_enabled,
      })
      .eq("id", userId)

    return NextResponse.json({
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    })
  } catch (error) {
    console.error("Error fetching account status:", error)
    return NextResponse.json(
      { error: "Failed to fetch account status", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
