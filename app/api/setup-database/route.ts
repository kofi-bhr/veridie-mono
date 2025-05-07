import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Create SQL functions for creating tables
    await supabaseAdmin.rpc("exec_sql", {
      sql: `
        -- Function to create services table
        CREATE OR REPLACE FUNCTION create_services_table_if_not_exists()
        RETURNS void AS $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'services') THEN
            CREATE TABLE services (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
              name TEXT NOT NULL,
              description TEXT,
              price DECIMAL(10, 2) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Add RLS policies
            ALTER TABLE services ENABLE ROW LEVEL SECURITY;
            
            -- Policy for mentors to manage their own services
            CREATE POLICY "Mentors can manage their own services"
              ON services
              USING (mentor_id = auth.uid())
              WITH CHECK (mentor_id = auth.uid());
              
            -- Policy for anyone to view services
            CREATE POLICY "Anyone can view services"
              ON services
              FOR SELECT
              USING (true);
          END IF;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Function to create activities table
        CREATE OR REPLACE FUNCTION create_activities_table_if_not_exists()
        RETURNS void AS $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'activities') THEN
            CREATE TABLE activities (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
              title TEXT NOT NULL,
              organization TEXT,
              years TEXT,
              description TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Add RLS policies
            ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
            
            -- Policy for mentors to manage their own activities
            CREATE POLICY "Mentors can manage their own activities"
              ON activities
              USING (mentor_id = auth.uid())
              WITH CHECK (mentor_id = auth.uid());
              
            -- Policy for anyone to view activities
            CREATE POLICY "Anyone can view activities"
              ON activities
              FOR SELECT
              USING (true);
          END IF;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Function to create awards table
        CREATE OR REPLACE FUNCTION create_awards_table_if_not_exists()
        RETURNS void AS $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'awards') THEN
            CREATE TABLE awards (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
              title TEXT NOT NULL,
              issuer TEXT,
              year TEXT,
              description TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Add RLS policies
            ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
            
            -- Policy for mentors to manage their own awards
            CREATE POLICY "Mentors can manage their own awards"
              ON awards
              USING (mentor_id = auth.uid())
              WITH CHECK (mentor_id = auth.uid());
              
            -- Policy for anyone to view awards
            CREATE POLICY "Anyone can view awards"
              ON awards
              FOR SELECT
              USING (true);
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    return NextResponse.json({ success: true, message: "Database setup completed successfully" })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
