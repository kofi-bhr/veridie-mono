"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

interface CalendlySetupProps {
  mentorId: string
  initialUsername?: string
}

export function CalendlySetup({ mentorId, initialUsername = "" }: CalendlySetupProps) {
  const [username, setUsername] = useState(initialUsername)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess(false)
    setError("")

    try {
      const response = await fetch("/api/calendly/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorId,
          username,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect Calendly account")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Your Calendly Account</CardTitle>
        <CardDescription>Link your Calendly account to allow clients to book sessions with you.</CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your Calendly account has been connected successfully.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="calendly-username" className="block text-sm font-medium mb-1">
                Calendly Username
              </label>
              <div className="flex items-center">
                <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-muted-foreground">
                  calendly.com/
                </span>
                <Input
                  id="calendly-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  className="rounded-l-none"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Enter just your username, not the full URL</p>
            </div>
          </div>

          <div className="mt-6">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Connecting..." : "Connect Calendly Account"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-6">
        <h4 className="text-sm font-semibold mb-2">Don't have a Calendly account?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Calendly is a free scheduling tool that lets you set your availability preferences and share a booking link
          with your clients.
        </p>
        <Button variant="outline" asChild>
          <a href="https://calendly.com/signup" target="_blank" rel="noopener noreferrer">
            Sign up for Calendly
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
