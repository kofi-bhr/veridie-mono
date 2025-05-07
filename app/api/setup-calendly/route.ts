import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceRole)

export async function POST() {
  try {
    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), "migrations", "add-calendly-fields.sql")
    const migration = fs.readFileSync(migrationPath, "utf8")

    // Execute the SQL migration
    const { error } = await supabase.rpc("exec_sql", { sql: migration })

    if (error) {
      console.error("Error running Calendly migration:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Calendly fields added successfully" })
  } catch (error) {
    console.error("Error setting up Calendly fields:", error)
    return NextResponse.json({ success: false, error: "Failed to set up Calendly fields" }, { status: 500 })
  }
}
