"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function SetupDatabasePage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const setupDatabase = async () => {
    setLoading(true)
    try {
      // Create the get_table_columns function
      const { error: functionError } = await supabase.rpc("create_get_table_columns_function")

      if (functionError) {
        // If the function already exists, try creating it directly
        const { error: directFunctionError } = await supabase.rpc("exec_sql", {
          sql: `
            CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
            RETURNS TABLE (
              column_name text,
              data_type text,
              is_nullable text,
              column_default text,
              is_identity text
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
              RETURN QUERY
              SELECT
                c.column_name::text,
                c.data_type::text,
                c.is_nullable::text,
                c.column_default::text,
                c.is_identity::text
              FROM
                information_schema.columns c
              WHERE
                c.table_schema = 'public'
                AND c.table_name = $1
              ORDER BY
                c.ordinal_position;
            END;
            $$;
          `,
        })

        if (directFunctionError) {
          throw directFunctionError
        }
      }

      toast({
        title: "Database setup complete",
        description: "Successfully set up database helper functions",
      })
    } catch (error: any) {
      console.error("Error setting up database:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to set up database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Set up helper functions for the database explorer</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will create helper functions in your Supabase database to enable the database explorer and manager. You
            only need to run this once.
          </p>

          <Button onClick={setupDatabase} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Set Up Database"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
