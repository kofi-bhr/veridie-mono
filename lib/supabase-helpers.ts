import { getSupabaseClient } from "./supabase-client"

// Helper function to get the current user ID from Supabase
export async function getCurrentUserId() {
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id
}

// Helper function to check if the user is authenticated
export async function isAuthenticated() {
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

// Helper function to get the current user's profile
export async function getCurrentUserProfile() {
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getSession()

  if (!data.session?.user?.id) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single()

  return profile
}
