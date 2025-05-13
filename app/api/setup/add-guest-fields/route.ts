import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST() {
  try {
    // SQL to add guest_name and guest_email columns if they don't exist
    const sql = `
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_name') THEN
              ALTER TABLE bookings ADD COLUMN guest_name TEXT;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_email') THEN
              ALTER TABLE bookings ADD COLUMN guest_email TEXT;
          END IF;
      END
      $$;
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error adding guest fields:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check if the columns were added successfully
    const { data: columns, error: checkError } = await supabase.rpc("exec_sql", {
      sql_query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name IN ('guest_name', 'guest_email');
      `,
    })

    if (checkError) {
      console.error("Error checking columns:", checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Guest fields added to bookings table",
      columns,
    })
  } catch (error) {
    console.error("Error in add-guest-fields route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
