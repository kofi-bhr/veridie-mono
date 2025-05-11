"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Caught in error boundary:", error)
      setError(error.error)
      setHasError(true)
    }

    window.addEventListener("error", handleError)

    return () => {
      window.removeEventListener("error", handleError)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border border-red-100">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-center mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6 text-center">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setHasError(false)
                setError(null)
              }}
              className="w-full"
            >
              Try Again
            </Button>
            <Button variant="link" onClick={() => (window.location.href = "/")} className="w-full">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
