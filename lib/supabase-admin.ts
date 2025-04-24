import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)
