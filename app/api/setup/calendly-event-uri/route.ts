import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST() {
  try {
    // Check if the column exists
    const { data: columnExists, error: columnCheckError } = await supabase.rpc("column_exists", {
      table_name: "services",
      column_name: "calendly_event_uri",
    })

    if (columnCheckError) {
      console.error("Error checking if column exists:", columnCheckError)
      return NextResponse.json({ error: "Failed to check if column exists" }, { status: 500 })
    }

    if (!columnExists) {
      // Add the column
      const { error: addColumnError } = await supabase.rpc("exec_sql", {
        sql_string: "ALTER TABLE services ADD COLUMN calendly_event_uri text",
      })

      if (addColumnError) {
        console.error("Error adding column:", addColumnError)
        return NextResponse.json({ error: "Failed to add column" }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "Migration completed successfully" })
  } catch (error) {
    console.error("Error running migration:", error)
    return NextResponse.json({ error: "Failed to run migration" }, { status: 500 })
  }
}
