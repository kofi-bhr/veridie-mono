import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Add this near the top of the file, after imports
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Add this helper function
export async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    console.log(`Request failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`)
    await new Promise((resolve) => setTimeout(resolve, delay))
    return withRetry(fn, retries - 1, delay)
  }
}

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
