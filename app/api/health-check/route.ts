import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET() {
  try {
    // Check if Stripe is initialized
    const stripe = getStripe()
    const stripeStatus = stripe ? "available" : "unavailable"

    // Check if Supabase is initialized
    let supabaseStatus = "unavailable"
    try {
      // Simple query to check if Supabase is working
      const { count, error } = await supabaseAdmin.from("profiles").select("*", { count: "exact", head: true })

      supabaseStatus = error ? "error" : "available"
    } catch (error) {
      console.error("Supabase health check error:", error)
    }

    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "missing",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "set" : "missing",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "set" : "missing",
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? "set" : "missing",
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        stripe: stripeStatus,
        supabase: supabaseStatus,
      },
      environment: envVars,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
