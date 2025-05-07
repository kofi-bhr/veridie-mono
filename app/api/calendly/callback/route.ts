import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { exchangeCalendlyCode, getCurrentUser, createWebhookSubscription } from "@/lib/calendly-api"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceRole)

// Calendly OAuth credentials
const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID || ""
const CALENDLY_CLIENT_SECRET = process.env.CALENDLY_CLIENT_SECRET || ""
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ""
const REDIRECT_URI = `${BASE_URL}/api/calendly/callback`
const WEBHOOK_URL = `${BASE_URL}/api/webhooks/calendly`

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const stateParam = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle error from Calendly
    if (error) {
      console.error("Error from Calendly:", error)
      return NextResponse.redirect(`${BASE_URL}/dashboard/calendly?error=${encodeURIComponent(error)}`)
    }

    if (!code || !stateParam) {
      return NextResponse.redirect(
        `${BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Missing required parameters")}`,
      )
    }

    // Decode state parameter
    let state
    try {
      state = JSON.parse(Buffer.from(stateParam, "base64").toString())
    } catch (err) {
      return NextResponse.redirect(
        `${BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Invalid state parameter")}`,
      )
    }

    const userId = state.userId

    if (!userId) {
      return NextResponse.redirect(
        `${BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Missing user ID in state")}`,
      )
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCalendlyCode(code, CALENDLY_CLIENT_ID, CALENDLY_CLIENT_SECRET, REDIRECT_URI)

    // Get user info from Calendly
    const user = await getCurrentUser(tokens.accessToken)

    // Create webhook subscription
    let webhookSubscription
    try {
      webhookSubscription = await createWebhookSubscription(tokens.accessToken, user.uri, WEBHOOK_URL)
    } catch (err) {
      console.error("Error creating webhook subscription:", err)
      // Continue even if webhook creation fails
    }

    // Update user's Calendly information in the database
    const { error: updateError } = await supabase
      .from("mentors")
      .update({
        calendly_access_token: tokens.accessToken,
        calendly_refresh_token: tokens.refreshToken,
        calendly_user_uri: user.uri,
        calendly_token_expires_at: tokens.expiresAt.toISOString(),
        calendly_username: user.schedulingUrl.split("/").pop(), // Extract username from URL
        calendly_webhook_subscriptions: webhookSubscription ? [webhookSubscription.resource] : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating user Calendly info:", updateError)
      return NextResponse.redirect(
        `${BASE_URL}/dashboard/calendly?error=${encodeURIComponent("Failed to save Calendly information")}`,
      )
    }

    // Redirect to success page
    return NextResponse.redirect(`${BASE_URL}/dashboard/calendly?success=true`)
  } catch (error: any) {
    console.error("Error handling Calendly callback:", error)
    return NextResponse.redirect(
      `${BASE_URL}/dashboard/calendly?error=${encodeURIComponent(error.message || "An error occurred")}`,
    )
  }
}
