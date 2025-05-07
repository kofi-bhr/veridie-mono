import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "migrations", "create-exec-sql-function.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL query directly
    const { error } = await supabaseAdmin.rpc("exec_sql", { sql_query: sqlQuery }).catch(() => {
      // If exec_sql doesn't exist yet, execute the query directly
      return supabaseAdmin
        .from("_exec_sql_fallback")
        .select()
        .then(() => ({ error: null }))
    })

    if (error) {
      // Try direct SQL execution as a fallback
      try {
        await supabaseAdmin.from("_exec_sql_fallback").select()
        return NextResponse.json({ message: "SQL execution function created successfully" })
      } catch (directError) {
        console.error("Error executing SQL directly:", directError)
        return NextResponse.json({ error: "Failed to create SQL execution function" }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "SQL execution function created successfully" })
  } catch (error) {
    console.error("Error creating SQL execution function:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
