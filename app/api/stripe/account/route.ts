import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Explicitly set the content type to application/json
    const headers = {
      "Content-Type": "application/json",
    }

    // Get the current user
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", isConnected: false }, { status: 401, headers })
    }

    // Get the mentor record
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select(
        "stripe_connect_accounts, stripe_account_details_submitted, stripe_account_charges_enabled, stripe_account_payouts_enabled",
      )
      .eq("id", user.id)
      .single()

    if (mentorError) {
      console.error("Error fetching mentor:", mentorError)
      return NextResponse.json(
        {
          error: "Failed to fetch mentor data",
          isConnected: false,
          details: mentorError.message,
        },
        { status: 500, headers },
      )
    }

    // Check if Stripe account is connected
    const isConnected = !!mentor?.stripe_connect_accounts

    return NextResponse.json(
      {
        isConnected,
        accountId: mentor?.stripe_connect_accounts || null,
        chargesEnabled: mentor?.stripe_account_charges_enabled || false,
        detailsSubmitted: mentor?.stripe_account_details_submitted || false,
        payoutsEnabled: mentor?.stripe_account_payouts_enabled || false,
      },
      { headers },
    )
  } catch (error) {
    console.error("Error in Stripe account route:", error)
    return NextResponse.json(
      {
        error: "Unexpected error",
        isConnected: false,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
