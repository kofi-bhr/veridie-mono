import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

export async function GET() {
  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return NextResponse.json({ error: bucketsError.message }, { status: 500 })
    }

    // Get details for each bucket including files
    const bucketsWithFiles = await Promise.all(
      buckets.map(async (bucket) => {
        try {
          // List files in the bucket
          const { data: files, error: filesError } = await supabaseAdmin.storage.from(bucket.name).list()

          if (filesError) {
            console.error(`Error listing files in bucket ${bucket.name}:`, filesError)
            return {
              ...bucket,
              files: [],
              error: filesError.message,
            }
          }

          return {
            ...bucket,
            files: files || [],
          }
        } catch (error) {
          console.error(`Error processing bucket ${bucket.name}:`, error)
          return {
            ...bucket,
            files: [],
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }),
    )

    return NextResponse.json({
      buckets: bucketsWithFiles,
    })
  } catch (error) {
    console.error("Error in storage debug route:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
