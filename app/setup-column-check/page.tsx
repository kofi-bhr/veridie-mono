"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SetupColumnCheckPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const { toast } = useToast()

  const runMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup/column-check", {
        method: "POST",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to run migration: ${errorText}`)
      }

      const data = await response.json()
      setResult(data.message)

      toast({
        title: "Success",
        description: "Column check function created successfully",
      })
    } catch (error) {
      console.error("Error running migration:", error)
      setResult(error instanceof Error ? error.message : "Unknown error")

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run migration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Setup Column Check Function</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Column Check Function</CardTitle>
          <CardDescription>
            This will create a SQL function to check column names in your database tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This function is needed for the Stripe diagnostics tool to check your database schema.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <Button onClick={runMigration} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Migration...
              </>
            ) : (
              "Create Function"
            )}
          </Button>

          {result && (
            <div className="w-full p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <p className="text-sm">{result}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
