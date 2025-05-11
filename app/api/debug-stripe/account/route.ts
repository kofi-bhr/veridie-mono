import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2023-10-16",
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
    }

    // Retrieve the account from Stripe
    const account = await stripe.accounts.retrieve(accountId)

    return NextResponse.json({
      account: {
        id: account.id,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements,
        business_profile: account.business_profile,
        capabilities: account.capabilities,
        settings: account.settings,
      },
    })
  } catch (error: any) {
    console.error("Error retrieving Stripe account:", error)
    return NextResponse.json(
      { error: error.message || "Failed to retrieve Stripe account" },
      { status: error.statusCode || 500 },
    )
  }
}
