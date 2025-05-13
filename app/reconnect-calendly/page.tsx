"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ReconnectCalendlyPage() {
  const { user } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // First, clear the existing tokens
      const res = await fetch("/api/calendly/clear-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to clear tokens")
      }

      // Redirect to the OAuth flow
      window.location.href = "/api/calendly/oauth"
    } catch (err: any) {
      console.error("Error reconnecting:", err)
      setError(err.message || "Failed to reconnect")
      setIsConnecting(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Reconnect Calendly</h1>
        <p>Please log in to reconnect your Calendly account.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/login">Log In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Reconnect Calendly</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reconnect Your Calendly Account
          </CardTitle>
          <CardDescription>
            Your Calendly authentication has expired. Please reconnect your account to continue using Calendly
            integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <h3 className="font-medium mb-2 text-amber-800">Why do I need to reconnect?</h3>
            <p className="text-sm text-amber-700 mb-2">
              Calendly authentication tokens can expire for several reasons:
            </p>
            <ul className="text-sm text-amber-700 list-disc pl-5 mb-4 space-y-1">
              <li>You revoked access from Calendly's side</li>
              <li>The token refresh process failed</li>
              <li>Your Calendly account settings changed</li>
            </ul>
            <p className="text-sm text-amber-700">
              Reconnecting will create a new secure connection between our platform and your Calendly account.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full md:w-auto">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Reconnect to Calendly
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard/calendly">Back to Calendly Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
