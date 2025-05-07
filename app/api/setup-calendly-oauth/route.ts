import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    // Initialize Supabase client with proper error checking
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase credentials are missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Read migration file
    const migrationFile = path.join(process.cwd(), "migrations", "add-calendly-oauth-fields.sql")
    const migrationSql = fs.readFileSync(migrationFile, "utf8")

    // Execute migration
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSql })

    if (error) {
      console.error("Error running Calendly OAuth migration:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error setting up Calendly OAuth:", error)
    return NextResponse.json({ error: error.message || "Failed to set up Calendly OAuth" }, { status: 500 })
  }
}
