import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getStripe } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    let accountId: string | null = null
    try {
      const body = await request.json()
      accountId = body.accountId
    } catch (e) {
      // If no body is provided, try to get the account ID from the database
    }

    // If no account ID was provided, get it from the database
    if (!accountId) {
      const { data: mentor, error: mentorError } = await supabase
        .from("mentors")
        .select("stripe_account_id")
        .eq("id", user.id)
        .single()

      if (mentorError || !mentor?.stripe_account_id) {
        return NextResponse.json({ error: "No Stripe account found" }, { status: 404 })
      }

      accountId = mentor.stripe_account_id
    }

    // Get Stripe instance
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 })
    }

    // Create a dashboard link
    const link = await stripe.accounts.createLoginLink(accountId)

    return NextResponse.json({ url: link.url })
  } catch (error) {
    console.error("Error creating dashboard link:", error)
    return NextResponse.json(
      {
        error: "Failed to create dashboard link",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
