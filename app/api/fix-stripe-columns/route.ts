import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import fs from "fs"
import path from "path"

export async function GET(request: Request) {
  try {
    // Get the current user from the session
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // For security, we'll check if the user is logged in
    // In production, you might want to restrict this to admin users only
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "migrations", "fix-stripe-columns.sql")
    const migrationSQL = fs.readFileSync(sqlFilePath, "utf8")

    // Run the migration SQL
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL })

    if (error) {
      console.error("Error running migration:", error)
      return NextResponse.json({ error: "Failed to run migration" }, { status: 500 })
    }

    // Check if the mentor record exists for the current user
    const { data: mentorData, error: mentorError } = await supabase
      .from("mentors")
      .select("id")
      .eq("id", session.user.id)
      .single()

    // If the mentor record doesn't exist, create it
    if (mentorError && mentorError.code === "PGRST116") {
      // No rows returned
      const { error: insertError } = await supabase.from("mentors").insert([{ id: session.user.id }])

      if (insertError) {
        console.error("Error creating mentor record:", insertError)
        return NextResponse.json({ error: "Failed to create mentor record" }, { status: 500 })
      }
    } else if (mentorError) {
      console.error("Error checking mentor record:", mentorError)
      return NextResponse.json({ error: "Failed to check mentor record" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Stripe columns fixed successfully" })
  } catch (error) {
    console.error("Error in fix-stripe-columns route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
