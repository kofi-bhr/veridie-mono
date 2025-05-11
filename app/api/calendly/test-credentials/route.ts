import { NextResponse } from "next/server"
import { CALENDLY_CLIENT_ID, CALENDLY_CLIENT_SECRET } from "@/lib/api-config"

export async function GET() {
  try {
    // Check if Calendly credentials are available
    const hasClientId = !!CALENDLY_CLIENT_ID
    const hasClientSecret = !!CALENDLY_CLIENT_SECRET

    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""

    return NextResponse.json({
      success: true,
      hasClientId,
      hasClientSecret,
      clientId: CALENDLY_CLIENT_ID, // Include the actual client ID for the connect page
      baseUrl,
      redirectUri: `${baseUrl}/api/calendly/simple-callback`,
      message: "Calendly credentials check completed",
    })
  } catch (error) {
    console.error("Error checking Calendly credentials:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
