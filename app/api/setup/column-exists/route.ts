import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "migrations", "add-column-exists-function.sql")
    const sql = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error executing SQL:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Column exists function created successfully" })
  } catch (error) {
    console.error("Error setting up column exists function:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
