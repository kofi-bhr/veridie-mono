import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Create a singleton Supabase client for the entire app
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>()
  }
  return supabaseInstance
}

// For backward compatibility
export const supabase = getSupabaseClient()
