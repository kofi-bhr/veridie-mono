import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return NextResponse.json({ error: "Failed to list storage buckets" }, { status: 500 })
    }

    const profilesBucketExists = buckets.some((bucket) => bucket.name === "profiles")

    if (profilesBucketExists) {
      return NextResponse.json({ message: "Profiles bucket already exists" })
    }

    // Create the profiles bucket
    const { error: createError } = await supabaseAdmin.storage.createBucket("profiles", {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
    })

    if (createError) {
      console.error("Error creating bucket:", createError)
      return NextResponse.json({ error: "Failed to create storage bucket" }, { status: 500 })
    }

    return NextResponse.json({ message: "Storage bucket created successfully" })
  } catch (error) {
    console.error("Error in storage bucket setup:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
