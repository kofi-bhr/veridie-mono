"use client"

import { useState } from "react"
import { setupDatabase } from "@/lib/setup-database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function SetupDatabaseNowPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: any } | null>(null)

  const handleSetupDatabase = async () => {
    setLoading(true)
    try {
      const setupResult = await setupDatabase()
      setResult(setupResult)
    } catch (error) {
      setResult({ success: false, error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Setup Supabase Database</CardTitle>
          <CardDescription>Create helper functions in your Supabase database</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will create the necessary helper functions in your Supabase database to enable the database explorer
            and manager tools.
          </p>
          {result && (
            <div
              className={`p-4 mb-4 rounded-md ${
                result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <p className={result.success ? "text-green-700" : "text-red-700"}>
                  {result.success
                    ? "Database setup completed successfully!"
                    : "Error setting up database. Please check the console for details."}
                </p>
              </div>
              {result.error && (
                <p className="mt-2 text-sm text-red-600">
                  {typeof result.error === "string" ? result.error : JSON.stringify(result.error)}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetupDatabase} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Setup Database Now"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
