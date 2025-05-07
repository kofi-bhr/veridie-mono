import { NextResponse, type NextRequest } from "next/server"
import { getCalendlyAuthUrl } from "@/lib/calendly-api"
import { auth } from "@/lib/auth"

// Calendly OAuth credentials
const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID || ""
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ""
const REDIRECT_URI = `${BASE_URL}/api/calendly/callback`

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate the authorization URL
    const authUrl = getCalendlyAuthUrl(CALENDLY_CLIENT_ID, REDIRECT_URI)

    // Store the user ID in the session to retrieve it in the callback
    const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString("base64")

    // Add state to auth URL
    const finalAuthUrl = `${authUrl}&state=${encodeURIComponent(state)}`

    // Redirect to Calendly authorization page
    return NextResponse.redirect(finalAuthUrl)
  } catch (error: any) {
    console.error("Error initiating Calendly OAuth:", error)
    return NextResponse.redirect(`${BASE_URL}/dashboard/calendly?error=${encodeURIComponent(error.message)}`)
  }
}
