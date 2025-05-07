import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST() {
  try {
    // Check if the column exists
    const { data: columnExists, error: columnCheckError } = await supabase.rpc("column_exists", {
      table_name: "mentors",
      column_name: "calendly_user_uri",
    })

    if (columnCheckError) {
      console.error("Error checking if column exists:", columnCheckError)
      return NextResponse.json({ error: "Failed to check if column exists" }, { status: 500 })
    }

    if (!columnExists) {
      // Add the column
      const { error: addColumnError } = await supabase.rpc("exec_sql", {
        sql_string: "ALTER TABLE mentors ADD COLUMN calendly_user_uri text",
      })

      if (addColumnError) {
        console.error("Error adding column:", addColumnError)
        return NextResponse.json({ error: "Failed to add column" }, { status: 500 })
      }

      // Update existing records
      const { error: updateError } = await supabase.rpc("exec_sql", {
        sql_string:
          "UPDATE mentors SET calendly_user_uri = calendly_event_type_uri WHERE calendly_event_type_uri LIKE '%/users/%'",
      })

      if (updateError) {
        console.error("Error updating records:", updateError)
        return NextResponse.json({ error: "Failed to update records" }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "Migration completed successfully" })
  } catch (error) {
    console.error("Error running migration:", error)
    return NextResponse.json({ error: "Failed to run migration" }, { status: 500 })
  }
}
