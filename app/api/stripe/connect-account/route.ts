import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { getStripe } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    console.log("Stripe connect account API called")

    // Get the current user from the session
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const email = session.user.email

    console.log("Processing Stripe connect for user:", userId)

    // Get Stripe instance
    const stripe = getStripe()
    if (!stripe) {
      console.error("Stripe is not initialized")
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 500 })
    }

    // First, check if the mentor record exists
    const { data: mentorExists, error: mentorCheckError } = await supabase
      .from("mentors")
      .select("id")
      .eq("id", userId)
      .single()

    if (mentorCheckError) {
      // If the mentor doesn't exist, create a new record
      if (mentorCheckError.code === "PGRST116") {
        // No rows returned
        const { error: insertError } = await supabase.from("mentors").insert([{ id: userId }])

        if (insertError) {
          console.error("Failed to create mentor record:", insertError)
          return NextResponse.json({ error: "Failed to create mentor record" }, { status: 500 })
        }
      } else {
        console.error("Error checking mentor record:", mentorCheckError)
        return NextResponse.json({ error: "Failed to check mentor record" }, { status: 500 })
      }
    }

    // Check if user already has a Stripe account
    const { data: mentor, error: fetchError } = await supabase
      .from("mentors")
      .select("stripe_connect_accounts")
      .eq("id", userId)
      .single()

    if (fetchError) {
      console.error("Error fetching mentor:", fetchError)
      return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 500 })
    }

    let accountId

    if (mentor?.stripe_connect_accounts) {
      // User already has a Stripe account
      accountId = mentor.stripe_connect_accounts
      console.log("Using existing Stripe account:", accountId)
    } else {
      // Create a new Stripe account
      try {
        console.log("Creating new Stripe account for:", email)

        const account = await stripe.accounts.create({
          type: "express",
          email: email || "",
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        })

        accountId = account.id
        console.log("Created new Stripe account:", accountId)

        // Save the account ID to the database
        const { error: updateError } = await supabase
          .from("mentors")
          .update({
            stripe_connect_accounts: accountId,
            stripe_account_details_submitted: account.details_submitted,
            stripe_account_charges_enabled: account.charges_enabled,
            stripe_account_payouts_enabled: account.payouts_enabled,
          })
          .eq("id", userId)

        if (updateError) {
          console.error("Failed to update mentor with Stripe account ID:", updateError)
          return NextResponse.json(
            { error: "Failed to update mentor with Stripe account ID", details: updateError.message },
            { status: 500 },
          )
        }
      } catch (error) {
        console.error("Error creating Stripe account:", error)
        return NextResponse.json(
          { error: "Failed to create Stripe account", details: error instanceof Error ? error.message : String(error) },
          { status: 500 },
        )
      }
    }

    // Create account link for onboarding
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      const refreshUrl = `${baseUrl}/dashboard/services`
      const returnUrl = `${baseUrl}/dashboard/services?setup=complete`

      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      })

      console.log("Created Stripe account link:", accountLink.url)
      return NextResponse.json({ url: accountLink.url })
    } catch (error) {
      console.error("Error creating account link:", error)
      return NextResponse.json(
        { error: "Failed to create account link", details: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in Stripe connect account route:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
