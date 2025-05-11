import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.CALENDLY_CLIENT_ID

    if (!clientId) {
      return NextResponse.redirect(new URL(`/dashboard/calendly?error=missing_client_id`, request.url))
    }

    // Use the exact URL format that works
    const authUrl = `https://calendly.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=https://veridie.vercel.app/api/calendly/simple-callback`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Error in Calendly auth:", error)
    return NextResponse.redirect(new URL(`/dashboard/calendly?error=auth_error`, request.url))
  }
}
