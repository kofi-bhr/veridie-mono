import { type NextRequest, NextResponse } from "next/server"
import { getCalendlyAuthUrl } from "@/lib/calendly-api"
import { CALENDLY_CLIENT_ID } from "@/lib/api-config"

export async function GET(request: NextRequest) {
  try {
    // Ensure we have the client ID
    if (!CALENDLY_CLIENT_ID) {
      console.error("Missing Calendly client ID")
      return NextResponse.json({ error: "Calendly client ID is not configured" }, { status: 500 })
    }

    // Use the exact redirect URI format
    const redirectUri = "https://veridie.vercel.app/api/calendly/simple-callback"

    console.log("Generating Calendly OAuth URL with redirect URI:", redirectUri)

    // Generate the OAuth URL
    const oauthUrl = getCalendlyAuthUrl(CALENDLY_CLIENT_ID, redirectUri)

    console.log("Generated Calendly OAuth URL:", oauthUrl)

    return NextResponse.json({ url: oauthUrl })
  } catch (error) {
    console.error("Error generating Calendly OAuth URL:", error)
    return NextResponse.json({ error: "Failed to generate Calendly OAuth URL" }, { status: 500 })
  }
}
