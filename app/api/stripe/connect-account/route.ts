import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createStripeConnectAccount, createStripeConnectAccountLink } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    console.log("Stripe Connect Account API called")
    // Get the request body
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      console.error("Missing userId in request body")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get the current user from the session
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Authentication error:", userError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify that the user is requesting their own account
    if (user.id !== userId) {
      console.error("User ID mismatch:", user.id, userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    console.log("Fetching user profile data")
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    console.log("Creating Stripe Connect account")
    // Create Stripe Connect account
    const { account, error: accountError } = await createStripeConnectAccount(
      userId,
      profile.email || user.email || "",
      profile.full_name || "College Consultant",
    )

    if (accountError || !account) {
      console.error("Error creating Stripe Connect account:", accountError)
      return NextResponse.json({ error: "Failed to create Stripe Connect account" }, { status: 500 })
    }

    console.log("Creating account link for onboarding")
    // Create account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const refreshUrl = `${baseUrl}/dashboard?stripe=refresh`
    const returnUrl = `${baseUrl}/dashboard?stripe=success`

    const { url, error: linkError } = await createStripeConnectAccountLink(account.id, refreshUrl, returnUrl)

    if (linkError || !url) {
      console.error("Error creating Stripe Connect account link:", linkError)
      return NextResponse.json({ error: "Failed to create Stripe Connect onboarding link" }, { status: 500 })
    }

    console.log("Returning onboarding URL:", url)
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Unexpected error in /api/stripe/connect-account:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
