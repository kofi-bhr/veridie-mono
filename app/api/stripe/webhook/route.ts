import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2023-10-16",
})

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature") || ""

    if (!stripeWebhookSecret) {
      console.error("Missing Stripe webhook secret")
      return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account

        // Update the account status in the database
        const { error } = await adminSupabase
          .from("mentors")
          .update({
            stripe_account_details_submitted: account.details_submitted,
            stripe_account_charges_enabled: account.charges_enabled,
            stripe_account_payouts_enabled: account.payouts_enabled,
          })
          .eq("stripe_connect_accounts", account.id)

        if (error) {
          console.error("Error updating account status:", error)
          return NextResponse.json({ error: "Failed to update account status" }, { status: 500 })
        }

        break
      }
      // Add more event handlers as needed
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

// Disable body parsing, we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}
