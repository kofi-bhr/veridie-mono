"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function SetupColumnExistsFunctionPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const setupFunction = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      // SQL to create the column_exists function
      const sql = `
        -- Function to check if a column exists in a table
        CREATE OR REPLACE FUNCTION public.column_exists(
          table_name text,
          column_name text
        )
        RETURNS boolean
        LANGUAGE plpgsql
        AS $$
        DECLARE
          exists_bool boolean;
        BEGIN
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = $1
            AND column_name = $2
          ) INTO exists_bool;
          
          RETURN exists_bool;
        END;
        $$;

        -- Grant execute permission to authenticated users
        GRANT EXECUTE ON FUNCTION public.column_exists TO authenticated;
      `

      const { error } = await supabase.rpc("exec_sql", { sql })

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Column exists function has been created successfully!",
      })
    } catch (error: any) {
      console.error("Error creating function:", error)
      setResult({
        success: false,
        message: `Error: ${error.message || "An unknown error occurred"}`,
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Setup Column Exists Function</CardTitle>
          <CardDescription>
            This utility will create a SQL function to check if a column exists in a table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This function is needed for profile image fixes and other database operations.</p>
          <p className="text-sm text-muted-foreground">Note: This operation is safe to run multiple times.</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button onClick={setupFunction} disabled={isRunning} className="mb-4">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              "Setup Function"
            )}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-md w-full ${
                result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 text-red-600" />
                )}
                <p>{result.message}</p>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
