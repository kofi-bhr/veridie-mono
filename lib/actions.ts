"use server"

import { supabase } from "@/lib/supabase-client"
import { supabaseAdmin, isAdminClientConfigured } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

export async function addReview(formData: FormData) {
  try {
    const mentorId = formData.get("mentorId") as string
    const name = formData.get("name") as string
    const rating = Number.parseInt(formData.get("rating") as string)
    const service = formData.get("service") as string
    const text = formData.get("text") as string

    if (!mentorId || !name || !rating || !service || !text) {
      return {
        success: false,
        message: "Missing required fields",
      }
    }

    // First, check if the reviews table exists
    const { error: tableCheckError } = await supabase.from("reviews").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes('relation "reviews" does not exist')) {
      // Table doesn't exist, create it first
      console.log("Creating reviews table from server action...")

      // Create the reviews table using RPC if available
      try {
        await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS reviews (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              mentor_id UUID NOT NULL REFERENCES profiles(id),
              client_id UUID NOT NULL REFERENCES profiles(id),
              name TEXT NOT NULL,
              rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
              service TEXT NOT NULL,
              text TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
        })
      } catch (rpcError) {
        console.error("Failed to create reviews table via RPC:", rpcError)

        // If RPC fails, try the API route
        const createTableResult = await fetch("/api/setup/reviews-table", {
          method: "POST",
        })

        if (!createTableResult.ok) {
          throw new Error("Failed to create reviews table. Please try again later.")
        }
      }
    }

    // Get the user ID from the session if available
    let userId = null
    try {
      const cookieStore = cookies()
      const supabaseServer = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
          },
        },
      )

      const {
        data: { session },
      } = await supabaseServer.auth.getSession()
      userId = session?.user?.id || null
    } catch (error) {
      console.log("No active session, continuing as anonymous review")
    }

    // Try to insert the review
    let insertResult

    // Try admin client first if configured
    if (isAdminClientConfigured()) {
      console.log("Using admin client for review insertion in server action")
      const { data, error } = await supabaseAdmin
        .from("reviews")
        .insert([
          {
            mentor_id: mentorId,
            client_id: userId || null,
            name,
            rating,
            service,
            text,
          },
        ])
        .select()

      if (error) {
        console.error("Admin client insertion failed:", error)
      } else {
        insertResult = { data, error: null }
      }
    }

    // If admin client failed or isn't configured, try server client
    if (!insertResult) {
      console.log("Using server client for review insertion")
      const cookieStore = cookies()
      const supabaseServer = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
          },
        },
      )
      insertResult = await supabaseServer
        .from("reviews")
        .insert([
          {
            mentor_id: mentorId,
            client_id: userId || null,
            name,
            rating,
            service,
            text,
          },
        ])
        .select()
    }

    if (insertResult.error) {
      console.error("Error inserting review:", insertResult.error)
      return {
        success: false,
        message: insertResult.error.message,
      }
    }

    revalidatePath(`/mentors/${mentorId}`)

    return {
      success: true,
      message: "Review added successfully",
    }
  } catch (error: any) {
    console.error("Error in addReview server action:", error)
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    }
  }
}
