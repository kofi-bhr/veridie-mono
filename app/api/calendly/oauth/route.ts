import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getCalendlyAuthUrl } from "@/lib/calendly-api"

export async function GET(request: NextRequest) {
  try {
    // Validate the user is authenticated
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is a consultant
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "consultant") {
      console.error("Profile error or not a consultant:", profileError)
      return NextResponse.json({ error: "Only consultants can connect to Calendly" }, { status: 403 })
    }

    // Get Calendly OAuth URL
    const clientId = process.env.CALENDLY_CLIENT_ID

    // Ensure the base URL has no trailing slash
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1)
    }

    const redirectUri = `${baseUrl}/api/calendly/callback`

    if (!clientId) {
      console.error("Missing Calendly client ID")
      return NextResponse.json({ error: "Calendly integration not configured" }, { status: 500 })
    }

    console.log("Using redirect URI:", redirectUri)
    const authUrl = getCalendlyAuthUrl(clientId, redirectUri)

    // Redirect to Calendly OAuth page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Unexpected error in Calendly OAuth route:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
