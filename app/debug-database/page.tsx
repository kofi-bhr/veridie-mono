"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export default function DebugDatabasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [query, setQuery] = useState("SELECT NOW()")
  const [error, setError] = useState<string | null>(null)

  const runQuery = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const startTime = performance.now()

      const response = await fetch("/api/debug/run-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      const endTime = performance.now()
      const responseTime = endTime - startTime

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run query")
      }

      setResults({
        data: data.result,
        responseTime: responseTime.toFixed(2),
      })
    } catch (err) {
      console.error("Error running query:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Performance Debug</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Run SQL Query</CardTitle>
          <CardDescription>Test database performance by running a SQL query</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">SQL Query</Label>
              <Textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={5}
                placeholder="Enter SQL query"
              />
            </div>

            <Button onClick={runQuery} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Run Query"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-red-50 p-4 rounded text-red-600 overflow-auto">{error}</pre>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Response time: {results.responseTime}ms</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded overflow-auto">{JSON.stringify(results.data, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
