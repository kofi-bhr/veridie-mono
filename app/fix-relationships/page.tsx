"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function FixRelationshipsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleFix = async () => {
    try {
      setStatus("loading")
      setMessage("Fixing relationships...")

      const response = await fetch("/api/fix-relationships")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Fix Database Relationships</CardTitle>
          <CardDescription>This will fix the relationship between mentors and profiles tables.</CardDescription>
        </CardHeader>
        <CardContent>
          {status !== "idle" && (
            <div
              className={`p-4 mb-4 rounded-md ${
                status === "loading"
                  ? "bg-blue-50 text-blue-700"
                  : status === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleFix} disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Fixing..." : "Fix Relationships"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
