import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createStripeConnectAccount, createStripeConnectAccountLink } from "@/lib/supabase-server"

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
    const { userId, email, name } = body

    if (!userId || !email) {
      return NextResponse.json({ error: "User ID and email are required" }, { status: 400 })
    }

    // Verify that the user is creating an account for themselves
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Create or retrieve Stripe Connect account
    const { account, error } = await createStripeConnectAccount(userId, email, name || email)

    if (error || !account) {
      console.error("Error creating Stripe Connect account:", error)
      return NextResponse.json({ error: "Failed to create Stripe Connect account", details: error }, { status: 500 })
    }

    // Create account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const refreshUrl = `${baseUrl}/dashboard/services?refresh=true`
    const returnUrl = `${baseUrl}/stripe-connect-success`

    const { url, error: linkError } = await createStripeConnectAccountLink(account.id, refreshUrl, returnUrl)

    if (linkError || !url) {
      console.error("Error creating account link:", linkError)
      return NextResponse.json({ error: "Failed to create account link", details: linkError }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Unexpected error in connect-account route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
