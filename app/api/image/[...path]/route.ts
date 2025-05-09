import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access to storage
const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Get the full path from the URL parameters
    const pathSegments = params.path

    // Log the incoming request for debugging
    console.log("Image proxy request:", {
      pathSegments,
      url: request.url,
    })

    // The first segment should be the bucket name
    const bucketName = pathSegments[0]

    // The rest of the segments form the file path within the bucket
    const filePath = pathSegments.slice(1).join("/")

    console.log("Fetching from Supabase storage:", {
      bucketName,
      filePath,
    })

    // Get the file from Supabase storage
    const { data, error } = await supabaseAdmin.storage.from(bucketName).download(filePath)

    if (error) {
      console.error("Supabase storage error:", error)

      // Try to get more details about the bucket and file
      const { data: bucketInfo } = await supabaseAdmin.storage.getBucket(bucketName)
      console.log("Bucket info:", bucketInfo)

      return new NextResponse(`Image not found: ${error.message}`, { status: 404 })
    }

    if (!data) {
      console.error("No data returned from Supabase storage")
      return new NextResponse("Image not found: No data returned", { status: 404 })
    }

    // Convert the file to an array buffer
    const arrayBuffer = await data.arrayBuffer()

    // Determine content type based on file extension
    let contentType = "image/jpeg" // Default
    if (filePath.endsWith(".png")) contentType = "image/png"
    if (filePath.endsWith(".gif")) contentType = "image/gif"
    if (filePath.endsWith(".svg")) contentType = "image/svg+xml"
    if (filePath.endsWith(".webp")) contentType = "image/webp"

    // Return the image with appropriate headers
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error in image proxy:", error)
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    })
  }
}
