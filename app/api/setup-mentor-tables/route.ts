import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    // Initialize Supabase client with admin privileges
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
    )

    // Create activities table if it doesn't exist
    const { error: activitiesError } = await supabase.rpc("create_activities_table")
    if (activitiesError) {
      console.error("Error creating activities table:", activitiesError)

      // If the function doesn't exist, create it and then call it
      if (activitiesError.message.includes("does not exist")) {
        // Create the function first
        const { error: createFunctionError } = await supabase.from("_exec").insert({
          query: `
            CREATE OR REPLACE FUNCTION create_activities_table()
            RETURNS void
            LANGUAGE plpgsql
            AS $$
            BEGIN
              -- Create activities table if it doesn't exist
              CREATE TABLE IF NOT EXISTS activities (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                organization TEXT NOT NULL,
                years TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );

              -- Create RLS policies
              ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

              -- Policy for mentors to see their own activities
              DROP POLICY IF EXISTS "Mentors can view their own activities" ON activities;
              CREATE POLICY "Mentors can view their own activities" 
                ON activities FOR SELECT 
                USING (auth.uid() = mentor_id);

              -- Policy for mentors to insert their own activities
              DROP POLICY IF EXISTS "Mentors can insert their own activities" ON activities;
              CREATE POLICY "Mentors can insert their own activities" 
                ON activities FOR INSERT 
                WITH CHECK (auth.uid() = mentor_id);

              -- Policy for mentors to update their own activities
              DROP POLICY IF EXISTS "Mentors can update their own activities" ON activities;
              CREATE POLICY "Mentors can update their own activities" 
                ON activities FOR UPDATE 
                USING (auth.uid() = mentor_id);

              -- Policy for mentors to delete their own activities
              DROP POLICY IF EXISTS "Mentors can delete their own activities" ON activities;
              CREATE POLICY "Mentors can delete their own activities" 
                ON activities FOR DELETE 
                USING (auth.uid() = mentor_id);
            END;
            $$;
          `,
        })

        if (createFunctionError) {
          console.error("Error creating function:", createFunctionError)
          return NextResponse.json({ error: "Failed to create function" }, { status: 500 })
        }

        // Now call the function
        const { error: callFunctionError } = await supabase.rpc("create_activities_table")
        if (callFunctionError) {
          console.error("Error calling function:", callFunctionError)
          return NextResponse.json({ error: "Failed to create activities table" }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: "Failed to create activities table" }, { status: 500 })
      }
    }

    // Create awards table if it doesn't exist
    const { error: awardsError } = await supabase.rpc("create_awards_table")
    if (awardsError) {
      console.error("Error creating awards table:", awardsError)

      // If the function doesn't exist, create it and then call it
      if (awardsError.message.includes("does not exist")) {
        // Create the function first
        const { error: createFunctionError } = await supabase.from("_exec").insert({
          query: `
            CREATE OR REPLACE FUNCTION create_awards_table()
            RETURNS void
            LANGUAGE plpgsql
            AS $$
            BEGIN
              -- Create awards table if it doesn't exist
              CREATE TABLE IF NOT EXISTS awards (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                issuer TEXT NOT NULL,
                year TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );

              -- Create RLS policies
              ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

              -- Policy for mentors to see their own awards
              DROP POLICY IF EXISTS "Mentors can view their own awards" ON awards;
              CREATE POLICY "Mentors can view their own awards" 
                ON awards FOR SELECT 
                USING (auth.uid() = mentor_id);

              -- Policy for mentors to insert their own awards
              DROP POLICY IF EXISTS "Mentors can insert their own awards" ON awards;
              CREATE POLICY "Mentors can insert their own awards" 
                ON awards FOR INSERT 
                WITH CHECK (auth.uid() = mentor_id);

              -- Policy for mentors to update their own awards
              DROP POLICY IF EXISTS "Mentors can update their own awards" ON awards;
              CREATE POLICY "Mentors can update their own awards" 
                ON awards FOR UPDATE 
                USING (auth.uid() = mentor_id);

              -- Policy for mentors to delete their own awards
              DROP POLICY IF EXISTS "Mentors can delete their own awards" ON awards;
              CREATE POLICY "Mentors can delete their own awards" 
                ON awards FOR DELETE 
                USING (auth.uid() = mentor_id);
            END;
            $$;
          `,
        })

        if (createFunctionError) {
          console.error("Error creating function:", createFunctionError)
          return NextResponse.json({ error: "Failed to create function" }, { status: 500 })
        }

        // Now call the function
        const { error: callFunctionError } = await supabase.rpc("create_awards_table")
        if (callFunctionError) {
          console.error("Error calling function:", callFunctionError)
          return NextResponse.json({ error: "Failed to create awards table" }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: "Failed to create awards table" }, { status: 500 })
      }
    }

    // Create services table if it doesn't exist
    const { error: servicesError } = await supabase.rpc("create_services_table")
    if (servicesError) {
      console.error("Error creating services table:", servicesError)

      // If the function doesn't exist, create it and then call it
      if (servicesError.message.includes("does not exist")) {
        // Create the function first
        const { error: createFunctionError } = await supabase.from("_exec").insert({
          query: `
            CREATE OR REPLACE FUNCTION create_services_table()
            RETURNS void
            LANGUAGE plpgsql
            AS $$
            BEGIN
              -- Create services table if it doesn't exist
              CREATE TABLE IF NOT EXISTS services (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                price INTEGER NOT NULL,
                stripe_product_id TEXT,
                stripe_price_id TEXT,
                calendly_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );

              -- Create RLS policies
              ALTER TABLE services ENABLE ROW LEVEL SECURITY;

              -- Policy for public to view services
              DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
              CREATE POLICY "Services are viewable by everyone" 
                ON services FOR SELECT 
                USING (true);

              -- Policy for mentors to insert their own services
              DROP POLICY IF EXISTS "Mentors can insert their own services" ON services;
              CREATE POLICY "Mentors can insert their own services" 
                ON services FOR INSERT 
                WITH CHECK (auth.uid() = mentor_id);

              -- Policy for mentors to update their own services
              DROP POLICY IF EXISTS "Mentors can update their own services" ON services;
              CREATE POLICY "Mentors can update their own services" 
                ON services FOR UPDATE 
                USING (auth.uid() = mentor_id);

              -- Policy for mentors to delete their own services
              DROP POLICY IF EXISTS "Mentors can delete their own services" ON services;
              CREATE POLICY "Mentors can delete their own services" 
                ON services FOR DELETE 
                USING (auth.uid() = mentor_id);
            END;
            $$;
          `,
        })

        if (createFunctionError) {
          console.error("Error creating function:", createFunctionError)
          return NextResponse.json({ error: "Failed to create function" }, { status: 500 })
        }

        // Now call the function
        const { error: callFunctionError } = await supabase.rpc("create_services_table")
        if (callFunctionError) {
          console.error("Error calling function:", callFunctionError)
          return NextResponse.json({ error: "Failed to create services table" }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: "Failed to create services table" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: "Mentor tables created successfully" })
  } catch (error) {
    console.error("Error setting up mentor tables:", error)
    return NextResponse.json({ error: "Failed to set up mentor tables" }, { status: 500 })
  }
}
