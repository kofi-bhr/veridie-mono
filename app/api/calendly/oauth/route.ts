import { NextResponse } from "next/server"
import { CALENDLY_CLIENT_ID } from "@/lib/api-config"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const redirectUri = url.searchParams.get("redirect_uri") || `${url.origin}/api/calendly/callback`

    // Include all the necessary scopes, especially availability:read
    const scopes = ["availability:read", "event_types:read", "scheduling_links:read", "user:read"].join(" ")

    const calendlyAuthUrl = `https://auth.calendly.com/oauth/authorize?client_id=${CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`

    return NextResponse.json({ url: calendlyAuthUrl })
  } catch (error) {
    console.error("Error generating Calendly OAuth URL:", error)
    return NextResponse.json({ error: "Failed to generate Calendly OAuth URL" }, { status: 500 })
  }
}
