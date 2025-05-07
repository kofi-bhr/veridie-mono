import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Test the connection by making a simple query
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.error("Supabase connection error:", error)
      return NextResponse.json(
        {
          connected: false,
          error: error.message,
          details: error,
          env: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
            anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
            serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      connected: true,
      data,
      env: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
        serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
      },
    })
  } catch (error: any) {
    console.error("Unexpected error testing Supabase connection:", error)
    return NextResponse.json(
      {
        connected: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
