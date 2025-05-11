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
    console.warn(
      "Supabase admin client is not properly configured. " +
        "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or API_KEY) are set.",
    )
    return null
  }

  if (!_supabaseAdmin) {
    try {
      _supabaseAdmin = createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    } catch (error) {
      console.error("Failed to create Supabase admin client:", error)
      return null
    }
  }

  return _supabaseAdmin
}

// Create a dummy response object for when the admin client is not available
const dummyResponse = {
  data: null,
  error: { message: "Admin client not configured" },
}

// Helper function to create a dummy method that returns the dummy response
const createDummyMethod = () => {
  const chainableObject = {
    data: null,
    error: { message: "Admin client not configured" },
  }

  // Add all the methods to the response so they can be chained
  const methods = [
    "select",
    "insert",
    "update",
    "delete",
    "upsert",
    "eq",
    "neq",
    "gt",
    "lt",
    "gte",
    "lte",
    "like",
    "ilike",
    "is",
    "in",
    "contains",
    "containedBy",
    "filter",
    "or",
    "and",
    "order",
    "limit",
    "range",
    "single",
    "maybeSingle",
    "csv",
    "then",
  ]

  methods.forEach((method) => {
    chainableObject[method] = () => chainableObject
  })

  return () => chainableObject
}

// Create a dummy table object with chainable methods
const dummyMethod = createDummyMethod()
const dummyTable = {}
const methods = ["select", "insert", "update", "delete", "upsert"]

methods.forEach((method) => {
  dummyTable[method] = dummyMethod
})

// Create a dummy storage object
const dummyStorage = {
  upload: dummyMethod,
  download: dummyMethod,
  list: dummyMethod,
  remove: dummyMethod,
  createSignedUrl: dummyMethod,
  getPublicUrl: () => ({ data: { publicUrl: "" } }),
}

// Export a proxy object that safely accesses the admin client
export const supabaseAdmin = {
  from: (table: string) => {
    const client = getAdminClient()
    if (!client) {
      console.warn(`Attempted to access table '${table}' but admin client is not configured`)
      return dummyTable
    }
    try {
      return client.from(table)
    } catch (error) {
      console.error(`Error accessing table '${table}':`, error)
      return dummyTable
    }
  },
  storage: {
    from: (bucket: string) => {
      const client = getAdminClient()
      if (!client) {
        console.warn(`Attempted to access storage bucket '${bucket}' but admin client is not configured`)
        return dummyStorage
      }
      try {
        return client.storage.from(bucket)
      } catch (error) {
        console.error(`Error accessing storage bucket '${bucket}':`, error)
        return dummyStorage
      }
    },
  },
  rpc: (fn: string, params?: any) => {
    const client = getAdminClient()
    if (!client) {
      console.warn(`Attempted to call RPC function '${fn}' but admin client is not configured`)
      return dummyResponse
    }
    try {
      return client.rpc(fn, params)
    } catch (error) {
      console.error(`Error calling RPC function '${fn}':`, error)
      return dummyResponse
    }
  },
  auth: {
    admin: {
      listUsers: async () => {
        console.warn("Auth admin methods are not available when admin client is not configured")
        return { data: [], error: { message: "Admin client not configured" } }
      },
    },
  },
}

// Helper function to safely execute admin operations
export async function safeAdminOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  if (!isAdminClientConfigured()) {
    console.warn("Supabase admin client is not properly configured. Returning fallback value.")
    return fallback
  }

  try {
    return await operation()
  } catch (error) {
    console.error("Error in admin operation:", error)
    return fallback
  }
}
