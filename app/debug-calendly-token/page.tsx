"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export default function DebugCalendlyTokenPage() {
  const [mentorId, setMentorId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkToken = async () => {
    if (!mentorId) {
      setError("Please enter a mentor ID")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/calendly-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mentorId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check token")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Calendly Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Enter mentor ID" value={mentorId} onChange={(e) => setMentorId(e.target.value)} />
            <Button onClick={checkToken} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Check Token
            </Button>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

          {result && (
            <div className="p-4 bg-gray-50 rounded-md overflow-auto">
              <h3 className="font-medium mb-2">Token Status:</h3>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
