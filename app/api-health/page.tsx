"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"

export default function ApiHealthPage() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/health-check")

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setHealth(data)
    } catch (err) {
      console.error("Health check error:", err)
      setError(err instanceof Error ? err.message : "Failed to check API health")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const getStatusIcon = (status: string) => {
    if (status === "available") {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (status === "error") {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getEnvIcon = (status: string) => {
    if (status === "set") {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Health Check</h1>

      <div className="mb-4">
        <Button onClick={checkHealth} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Refresh Health Status"
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Services Status</CardTitle>
              <CardDescription>Current status of backend services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Stripe</span>
                  <div className="flex items-center">
                    {getStatusIcon(health.services.stripe)}
                    <span className="ml-2">{health.services.stripe}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Supabase</span>
                  <div className="flex items-center">
                    {getStatusIcon(health.services.supabase)}
                    <span className="ml-2">{health.services.supabase}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mt-4">
                  Last checked: {new Date(health.timestamp).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Status of required environment variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(health.environment).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="font-medium">{key}</span>
                    <div className="flex items-center">
                      {getEnvIcon(value)}
                      <span className="ml-2">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
