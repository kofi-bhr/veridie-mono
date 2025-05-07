import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const mentorId = params.id
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if the mentor exists
    const { data: mentorExists, error: mentorExistsError } = await supabase
      .from("mentors")
      .select("id")
      .eq("id", mentorId)
      .single()

    if (mentorExistsError) {
      return NextResponse.json(
        {
          error: "Mentor not found in initial check",
          details: mentorExistsError.message,
          query: `SELECT id FROM mentors WHERE id = '${mentorId}'`,
        },
        { status: 404 },
      )
    }

    // Get full mentor data
    const { data: mentorData, error: mentorDataError } = await supabase
      .from("mentors")
      .select(`
        *,
        profiles(*),
        services(*),
        awards(*),
        activities(*),
        essays(*),
        specialties(*)
      `)
      .eq("id", mentorId)
      .single()

    if (mentorDataError) {
      return NextResponse.json(
        {
          error: "Error fetching mentor data",
          details: mentorDataError.message,
          mentorExists: mentorExists,
        },
        { status: 500 },
      )
    }

    // Get all tables to check structure
    const { data: tables } = await supabase.from("pg_catalog.pg_tables").select("tablename").eq("schemaname", "public")

    return NextResponse.json({
      success: true,
      mentor: mentorData,
      tables: tables?.map((t) => t.tablename) || [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Unexpected error", details: error.message }, { status: 500 })
  }
}
