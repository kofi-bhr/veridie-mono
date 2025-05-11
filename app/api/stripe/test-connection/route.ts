import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    // Get Stripe secret key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing STRIPE_SECRET_KEY environment variable",
        },
        { status: 500 },
      )
    }

    // Initialize Stripe
    let stripe: Stripe
    try {
      stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2023-10-16",
      })
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize Stripe client",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // Test Stripe connection by retrieving account info
    try {
      const account = await stripe.accounts.retrieve("acct_1QvMMEG28TeyQW0V")
      return NextResponse.json({
        success: true,
        message: "Successfully connected to Stripe API",
      })
    } catch (error: any) {
      // This is expected to fail with a "no such account" error, which means the API is working
      if (error.code === "account_invalid") {
        return NextResponse.json({
          success: true,
          message: "Successfully connected to Stripe API (account not found, but API is working)",
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to Stripe API",
          details: error.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
