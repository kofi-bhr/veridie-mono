import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Only proceed with token refresh for authenticated users on specific paths
  if (session && request.nextUrl.pathname.startsWith("/dashboard")) {
    try {
      // Check if user has Calendly tokens that need refreshing
      const { data: mentor } = await supabase
        .from("mentors")
        .select("id, calendly_token_expires_at, calendly_refresh_token")
        .eq("id", session.user.id)
        .single()

      if (mentor?.calendly_token_expires_at && mentor?.calendly_refresh_token) {
        const expiresAt = new Date(mentor.calendly_token_expires_at)
        const now = new Date()

        // If token expires in less than 6 hours, trigger a background refresh
        if (expiresAt.getTime() - now.getTime() < 6 * 60 * 60 * 1000) {
          // Don't await this - let it happen in the background
          fetch(`${request.nextUrl.origin}/api/calendly/refresh-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: session.user.id }),
          }).catch((err) => {
            // Just log the error, don't block the request
            console.error("Background token refresh failed:", err)
          })
        }
      }
    } catch (error) {
      // Just log the error, don't block the request
      console.error("Error in middleware token refresh check:", error)
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/mentors/:path*"],
}
