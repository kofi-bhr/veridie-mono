import { NextResponse } from "next/server"
import { fetchFromApi } from "@/lib/api-config"

export async function GET(request: Request) {
  try {
    // Use the API key securely on the server to fetch mentor data
    const data = await fetchFromApi("/mentors")

    // Return the data to the client without exposing the API key
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching external mentor data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
