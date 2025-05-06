import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Get the Supabase URL and API key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.API_KEY

// Create a variable to hold the admin client
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

// Function to check if admin client can be configured
export function isAdminClientConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceRoleKey)
}

// Function to get the admin client, creating it only if properly configured
export function getAdminClient() {
  if (!isAdminClientConfigured()) {
    throw new Error(
      "Supabase admin client is not properly configured. " +
        "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or API_KEY) are set.",
    )
  }

  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return _supabaseAdmin
}

// Export a proxy object that safely accesses the admin client
export const supabaseAdmin = {
  from: (...args: any[]) => {
    try {
      return getAdminClient().from(...args)
    } catch (error) {
      console.error("Error accessing supabaseAdmin:", error)
      // Return a dummy object that won't throw errors when methods are called
      return {
        select: () => ({ data: null, error: { message: "Admin client not configured" } }),
        insert: () => ({ data: null, error: { message: "Admin client not configured" } }),
        update: () => ({ data: null, error: { message: "Admin client not configured" } }),
        delete: () => ({ data: null, error: { message: "Admin client not configured" } }),
        eq: () => ({ data: null, error: { message: "Admin client not configured" } }),
      }
    }
  },
  storage: {
    from: (...args: any[]) => {
      try {
        return getAdminClient().storage.from(...args)
      } catch (error) {
        console.error("Error accessing supabaseAdmin.storage:", error)
        // Return a dummy object
        return {
          upload: () => ({ data: null, error: { message: "Admin client not configured" } }),
          list: () => ({ data: null, error: { message: "Admin client not configured" } }),
          remove: () => ({ data: null, error: { message: "Admin client not configured" } }),
        }
      }
    },
  },
  rpc: (...args: any[]) => {
    try {
      return getAdminClient().rpc(...args)
    } catch (error) {
      console.error("Error accessing supabaseAdmin.rpc:", error)
      return { data: null, error: { message: "Admin client not configured" } }
    }
  },
}

// Helper function to safely execute admin operations
export async function safeAdminOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    if (!isAdminClientConfigured()) {
      console.warn("Supabase admin client is not properly configured. Some features may not work correctly.")
      return fallback
    }

    return await operation()
  } catch (error) {
    console.error("Error in admin operation:", error)
    return fallback
  }
}
