import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "migrations", "create-profiles-bucket-fixed.sql")
    const sql = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL
    const { error } = await supabaseAdmin.sql.query(sql)

    if (error) {
      console.error("Error setting up profiles bucket:", error)
      return NextResponse.json({ error: `Failed to set up profiles bucket: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ message: "Profiles bucket set up successfully!" })
  } catch (error: any) {
    console.error("Error in setup-storage-bucket route:", error)
    return NextResponse.json({ error: `An unexpected error occurred: ${error.message}` }, { status: 500 })
  }
}
