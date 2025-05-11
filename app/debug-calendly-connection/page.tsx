"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DebugCalendlyConnectionPage() {
  const { user } = useAuth()
  const [dbData, setDbData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      checkConnection()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const checkConnection = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch("/api/debug/calendly-db-check")
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()
      setDbData(data)
    } catch (err: any) {
      console.error("Error checking connection:", err)
      setError(err.message || "Failed to check connection")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Debug Calendly Connection</h1>
        <p>Please log in to debug your Calendly connection.</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Debug Calendly Connection</h1>

      <Card>
        <CardHeader>
          <CardTitle>Database Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Checking database...</p>
            </div>
          ) : error ? (
            <div>
              <p className="text-red-500">Error: {error}</p>
              <Button onClick={checkConnection} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : dbData ? (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Username:</p>
                <p>{dbData.username || "Not set"}</p>
              </div>
              <div>
                <p className="font-semibold">Access Token:</p>
                <p>{dbData.hasAccessToken ? "Present" : "Missing"}</p>
              </div>
              <div>
                <p className="font-semibold">Refresh Token:</p>
                <p>{dbData.hasRefreshToken ? "Present" : "Missing"}</p>
              </div>
              <div>
                <p className="font-semibold">Last Updated:</p>
                <p>{dbData.lastUpdated || "Never"}</p>
              </div>
              <div>
                <p className="font-semibold">Connection Status:</p>
                <p className={dbData.isConnected ? "text-green-500" : "text-red-500"}>
                  {dbData.isConnected ? "Connected" : "Not Connected"}
                </p>
              </div>
              <Button onClick={checkConnection}>Refresh</Button>
            </div>
          ) : (
            <p>No data found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
