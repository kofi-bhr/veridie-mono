import { createClient } from "@supabase/supabase-js"

// Create a Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

/**
 * Check if the profiles bucket exists and is public
 */
export async function checkProfilesBucket() {
  try {
    // List buckets to check if profiles exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return { success: false, message: "Error listing buckets" }
    }

    const profilesBucket = buckets.find((bucket) => bucket.name === "profiles")

    if (!profilesBucket) {
      console.error("Profiles bucket does not exist")
      return { success: false, message: "Profiles bucket does not exist" }
    }

    // Check bucket permissions
    const { data: policy, error: policyError } = await supabase.storage.getBucket("profiles")

    if (policyError) {
      console.error("Error getting bucket policy:", policyError)
      return { success: false, message: "Error getting bucket policy" }
    }

    return {
      success: true,
      message: "Profiles bucket exists",
      isPublic: policy.public || false,
      bucket: policy,
    }
  } catch (error) {
    console.error("Error checking profiles bucket:", error)
    return { success: false, message: "Error checking profiles bucket" }
  }
}

/**
 * Make the profiles bucket public
 */
export async function makeProfilesBucketPublic() {
  try {
    const { error } = await supabase.storage.updateBucket("profiles", {
      public: true,
    })

    if (error) {
      console.error("Error making profiles bucket public:", error)
      return { success: false, message: "Error making profiles bucket public" }
    }

    return { success: true, message: "Profiles bucket is now public" }
  } catch (error) {
    console.error("Error making profiles bucket public:", error)
    return { success: false, message: "Error making profiles bucket public" }
  }
}

/**
 * Create the profiles bucket if it doesn't exist
 */
export async function createProfilesBucket() {
  try {
    const { error } = await supabase.storage.createBucket("profiles", {
      public: true,
    })

    if (error) {
      console.error("Error creating profiles bucket:", error)
      return { success: false, message: "Error creating profiles bucket" }
    }

    return { success: true, message: "Profiles bucket created successfully" }
  } catch (error) {
    console.error("Error creating profiles bucket:", error)
    return { success: false, message: "Error creating profiles bucket" }
  }
}
