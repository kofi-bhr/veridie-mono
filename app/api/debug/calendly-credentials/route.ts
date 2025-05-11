import { NextResponse } from "next/server"
import { CALENDLY_CLIENT_ID, CALENDLY_CLIENT_SECRET } from "@/lib/api-config"

export async function GET() {
  return NextResponse.json({
    clientId: CALENDLY_CLIENT_ID || null,
    clientSecret: CALENDLY_CLIENT_SECRET ? "present" : null,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || null,
  })
}
