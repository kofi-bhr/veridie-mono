import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Create a single supabase client for the entire app
export const supabase = createClientComponentClient<Database>()
