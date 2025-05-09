import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with service role key for admin access
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

export async function GET(request: NextRequest) {
  try {
    // Get the image path from the URL
    const url = new URL(request.url)
    const imagePath = url.searchParams.get("path")

    if (!imagePath) {
      return new NextResponse("Image path is required", { status: 400 })
    }

    console.log("Proxying image:", imagePath)

    // Extract bucket and path from the full URL
    let bucket = "profiles"
    let path = imagePath

    // If the full URL is provided, extract the path
    if (imagePath.includes("storage/v1/object/public/")) {
      const parts = imagePath.split("storage/v1/object/public/")
      if (parts.length > 1) {
        const bucketAndPath = parts[1].split("/")
        bucket = bucketAndPath[0]
        path = bucketAndPath.slice(1).join("/")
      }
    }

    // Download the image from Supabase storage
    const { data, error } = await supabase.storage.from(bucket).download(path)

    if (error) {
      console.error("Error downloading image:", error)
      return new NextResponse("Image not found", { status: 404 })
    }

    // Determine content type based on file extension
    let contentType = "image/jpeg" // Default
    if (path.endsWith(".png")) contentType = "image/png"
    if (path.endsWith(".gif")) contentType = "image/gif"
    if (path.endsWith(".svg")) contentType = "image/svg+xml"
    if (path.endsWith(".webp")) contentType = "image/webp"

    // Return the image with appropriate headers
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error in image proxy:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
