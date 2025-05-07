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
      .select(
        "stripe_connect_accounts, stripe_account_details_submitted, stripe_account_charges_enabled, stripe_account_payouts_enabled",
      )
      .eq("id", userId)
      .single()

    if (mentorError) {
      console.error("Error fetching mentor:", mentorError)
      return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 500 })
    }

    if (!mentor?.stripe_connect_accounts) {
      return NextResponse.json({ account: null })
    }

    // Get the account details from Stripe
    const stripe = getStripe()
    const account = await stripe.accounts.retrieve(mentor.stripe_connect_accounts)

    // Update the database with the latest account status if it has changed
    if (
      account.details_submitted !== mentor.stripe_account_details_submitted ||
      account.charges_enabled !== mentor.stripe_account_charges_enabled ||
      account.payouts_enabled !== mentor.stripe_account_payouts_enabled
    ) {
      await supabase
        .from("mentors")
        .update({
          stripe_account_details_submitted: account.details_submitted,
          stripe_account_charges_enabled: account.charges_enabled,
          stripe_account_payouts_enabled: account.payouts_enabled,
        })
        .eq("id", userId)
    }

    return NextResponse.json({
      account: {
        accountId: account.id,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
    })
  } catch (error) {
    console.error("Error fetching Stripe account:", error)
    return NextResponse.json({ error: "Failed to fetch Stripe account" }, { status: 500 })
  }
}
