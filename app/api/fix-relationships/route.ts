import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // First check if the foreign key already exists to avoid errors
    const { data: foreignKeys } = await supabaseAdmin.rpc("get_foreign_keys", {
      table_name: "mentors",
    })

    const hasProfilesForeignKey = foreignKeys?.some(
      (fk: any) => fk.constraint_name === "mentors_id_fkey" && fk.referenced_table === "profiles",
    )

    if (!hasProfilesForeignKey) {
      // Add foreign key constraint to mentors table
      await supabaseAdmin.query(`
        ALTER TABLE mentors
        ADD CONSTRAINT mentors_id_fkey
        FOREIGN KEY (id)
        REFERENCES profiles(id)
        ON DELETE CASCADE;
      `)
    }

    return NextResponse.json({
      success: true,
      message: "Relationship between mentors and profiles has been fixed",
    })
  } catch (error: any) {
    console.error("Error fixing relationships:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
