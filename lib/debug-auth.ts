import { supabase } from "./supabase-client"

export async function debugSignUp(email: string, password: string, userData: any) {
  try {
    console.log("Starting sign up process for:", email)

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        },
      },
    })

    if (authError) {
      console.error("Auth error during signup:", authError)
      return { user: null, error: authError, step: "auth" }
    }

    console.log("Auth signup successful:", authData)

    if (authData.user) {
      // Insert the user profile data
      console.log("Inserting profile data for user:", authData.user.id)

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          name: userData.name,
          email: email,
          role: userData.role,
          avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
          created_at: new Date().toISOString(),
        },
      ])

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { user: authData.user, error: profileError, step: "profile" }
      }

      console.log("Profile created successfully")

      // If the user is a consultant, create a mentor profile
      if (userData.role === "consultant") {
        console.log("Creating mentor profile for consultant")

        const { error: mentorError } = await supabase.from("mentors").insert([
          {
            id: authData.user.id,
            title: "",
            university: "",
            bio: "",
            rating: 0,
            review_count: 0,
            languages: [],
            created_at: new Date().toISOString(),
          },
        ])

        if (mentorError) {
          console.error("Mentor profile creation error:", mentorError)
          return { user: authData.user, error: mentorError, step: "mentor" }
        }

        console.log("Mentor profile created successfully")
      }
    }

    return { user: authData.user, error: null, step: "complete" }
  } catch (error) {
    console.error("Unexpected error during signup:", error)
    return { user: null, error, step: "unexpected" }
  }
}

export async function checkDatabaseTables() {
  try {
    // Check if profiles table exists
    const { count: profilesCount, error: profilesError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    // Check if mentors table exists
    const { count: mentorsCount, error: mentorsError } = await supabase
      .from("mentors")
      .select("*", { count: "exact", head: true })

    return {
      profilesTableExists: !profilesError,
      mentorsTableExists: !mentorsError,
      profilesError: profilesError?.message,
      mentorsError: mentorsError?.message,
    }
  } catch (error: any) {
    return {
      profilesTableExists: false,
      mentorsTableExists: false,
      error: error.message,
    }
  }
}
