"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"

export default function UpdateReviewsSchema() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const updateSchema = async () => {
    setIsLoading(true)
    try {
      // Try to use the exec_sql RPC function if available
      const { error } = await supabase.rpc("exec_sql", {
        sql_query: `
          -- Make client_id nullable in reviews table
          ALTER TABLE reviews ALTER COLUMN client_id DROP NOT NULL;
        `,
      })

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Successfully updated reviews schema to make client_id nullable.",
      })
    } catch (error: any) {
      console.error("Error updating schema:", error)
      setResult({
        success: false,
        message: `Error: ${error.message || "Unknown error occurred"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Update Reviews Schema</CardTitle>
          <CardDescription>
            Make the client_id column nullable in the reviews table to allow anonymous reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <div
              className={`p-4 mb-4 rounded-md ${
                result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {result.message}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={updateSchema} disabled={isLoading} className="w-full">
            {isLoading ? "Updating Schema..." : "Update Schema"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
