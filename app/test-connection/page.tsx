"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function TestConnectionPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)

  const testConnection = async () => {
    try {
      setStatus("loading")
      const response = await fetch("/api/test-supabase-connection")
      const data = await response.json()

      setResult(data)
      setStatus(data.connected ? "success" : "error")
    } catch (error) {
      console.error("Error testing connection:", error)
      setStatus("error")
      setResult({ error: "Failed to test connection" })
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Supabase Connection Test</CardTitle>
          <CardDescription>Testing connection to your Supabase database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex items-center justify-center p-6">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          )}

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Connected!</AlertTitle>
              <AlertDescription className="text-green-700">Successfully connected to Supabase</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>Could not connect to Supabase. Check the details below.</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm overflow-auto">
              <h3 className="font-medium mb-2">Connection Details:</h3>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">Environment Variables:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>NEXT_PUBLIC_SUPABASE_URL: {result?.env?.url || "Checking..."}</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {result?.env?.anonKey || "Checking..."}</li>
              <li>SUPABASE_SERVICE_ROLE_KEY: {result?.env?.serviceRole || "Checking..."}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={testConnection} disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Testing..." : "Test Connection Again"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
