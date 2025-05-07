import { NextResponse } from "next/server"
import { debugSignUp, checkDatabaseTables } from "@/lib/debug-auth"

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json()

    // First check if required tables exist
    const tablesCheck = await checkDatabaseTables()

    // Attempt signup
    const result = await debugSignUp(email, password, { name, role })

    return NextResponse.json({
      ...result,
      tablesCheck,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const tablesCheck = await checkDatabaseTables()

    return NextResponse.json({
      tablesCheck,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
