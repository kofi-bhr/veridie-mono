import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get all query parameters
    const searchParams = request.nextUrl.searchParams
    const allParams: Record<string, string> = {}

    searchParams.forEach((value, key) => {
      allParams[key] = value
    })

    // Get headers
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Return all information for debugging
    return NextResponse.json({
      success: true,
      message: "Debug information captured",
      timestamp: new Date().toISOString(),
      url: request.url,
      params: allParams,
      headers: headers,
      // Don't include cookies for security reasons
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
