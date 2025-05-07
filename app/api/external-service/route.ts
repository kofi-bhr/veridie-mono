import { NextResponse } from "next/server"

// Access the API key securely on the server
const apiKey = process.env.API_KEY

export async function GET(request: Request) {
  try {
    // Example of using the API key to make a request to an external service
    const response = await fetch("https://api.example.com/data", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`)
    }

    const data = await response.json()

    // Return the data to the client
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error fetching from external API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
