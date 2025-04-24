"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function SetupStripeConnectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSetup = async () => {
    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/setup-stripe-connect")
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setStatus("success")
      setMessage(data.message || "Stripe Connect setup completed successfully")
    } catch (error: any) {
      console.error("Error setting up Stripe Connect:", error)
      setStatus("error")
      setMessage(error.message || "Failed to set up Stripe Connect")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Setup Stripe Connect</h1>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Database Migration</CardTitle>
          <CardDescription>Run this setup to add Stripe Connect fields to your database schema.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will add the necessary fields to your database tables to support Stripe Connect integration:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
            <li>Add Stripe Connect account fields to mentors table</li>
            <li>Add Stripe product and price fields to services table</li>
            <li>Create indexes for faster lookups</li>
          </ul>

          {status === "success" && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                <p className="text-green-800">{message}</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                <p className="text-red-800">{message}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetup} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Setting Up..." : "Run Setup"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
