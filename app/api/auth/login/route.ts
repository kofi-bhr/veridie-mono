import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const { email, password } = requestData

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Create a Supabase client for the route handler
    const supabase = createRouteHandlerClient({ cookies })

    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Server-side login error:", error)
      return NextResponse.json(
        {
          error: error.message,
          details: error,
        },
        { status: 401 },
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json(
        {
          error: "Error fetching user profile",
          details: profileError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || "",
        role: profile?.role || "client",
        avatar: profile?.avatar || "",
      },
      session: data.session,
    })
  } catch (error) {
    console.error("Unexpected error during login:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
