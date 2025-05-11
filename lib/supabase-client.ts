import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Create a singleton Supabase client for the entire app
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>({
      cookieOptions: {
        name: "veridie-session",
        lifetime: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
        path: "/",
      },
    })
  }
  return supabaseInstance
}

// For backward compatibility
export const supabase = getSupabaseClient()

// Function to reset the Supabase client (useful for logout)
export function resetSupabaseClient() {
  supabaseInstance = null
}
