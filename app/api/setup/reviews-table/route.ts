import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  try {
    // Check if the reviews table exists
    const { error: checkError } = await supabaseAdmin.from("reviews").select("id").limit(1)

    // If the table doesn't exist, create it
    if (checkError && checkError.message.includes('relation "reviews" does not exist')) {
      // Create the reviews table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.reviews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          mentor_id UUID NOT NULL,
          client_id UUID,
          name TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          service TEXT NOT NULL,
          text TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Add indexes for faster lookups
        CREATE INDEX IF NOT EXISTS reviews_mentor_id_idx ON public.reviews(mentor_id);
        CREATE INDEX IF NOT EXISTS reviews_client_id_idx ON public.reviews(client_id);
        
        -- Add RLS policies
        ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
        
        -- Policy for selecting reviews (anyone can read reviews)
        DROP POLICY IF EXISTS reviews_select_policy ON public.reviews;
        CREATE POLICY reviews_select_policy ON public.reviews
            FOR SELECT USING (true);
        
        -- Policy for inserting reviews (authenticated users can create reviews)
        DROP POLICY IF EXISTS reviews_insert_policy ON public.reviews;
        CREATE POLICY reviews_insert_policy ON public.reviews
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
      `

      const { error: createError } = await supabaseAdmin.rpc("exec_sql", { sql: createTableSQL })

      if (createError) {
        console.error("Error creating reviews table:", createError)
        return NextResponse.json({ success: false, error: createError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error setting up reviews table:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
