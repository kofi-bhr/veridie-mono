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
    const { accountId } = body

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
    }

    // Get Stripe instance
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 500 })
    }

    // Create a login link
    const link = await stripe.accounts.createLoginLink(accountId)

    return NextResponse.json({ url: link.url })
  } catch (error) {
    console.error("Error creating dashboard link:", error)
    return NextResponse.json(
      { error: "Failed to create dashboard link", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
