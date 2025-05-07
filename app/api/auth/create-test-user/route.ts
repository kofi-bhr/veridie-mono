import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Test user credentials
    const testEmail = "test@example.com"
    const testPassword = "password123"

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail(testEmail)

    if (checkError && checkError.message !== "User not found") {
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    // If user exists, return their info
    if (existingUser) {
      return NextResponse.json({
        message: "Test user already exists",
        email: testEmail,
        password: testPassword,
      })
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: "Test User",
        role: "consultant",
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          name: "Test User",
          email: testEmail,
          role: "consultant",
          avatar: "/placeholder.svg?height=40&width=40",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (profileError) {
        console.error("Error creating profile:", profileError)
      }

      // Create mentor profile
      const { error: mentorError } = await supabase.from("mentors").insert([
        {
          id: data.user.id,
          title: "Test Mentor",
          university: "Test University",
          bio: "This is a test mentor profile",
          rating: 5,
          review_count: 1,
          languages: ["English"],
          created_at: new Date().toISOString(),
        },
      ])

      if (mentorError) {
        console.error("Error creating mentor profile:", mentorError)
      }
    }

    return NextResponse.json({
      message: "Test user created successfully",
      email: testEmail,
      password: testPassword,
    })
  } catch (error: any) {
    console.error("Error creating test user:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
