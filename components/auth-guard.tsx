"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, refreshSession } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we're still loading, wait
        if (loading) {
          return
        }

        // If user is not authenticated, redirect to login
        if (!user) {
          if (retryCount < 2) {
            // Try refreshing the session once before redirecting
            console.log("No user found, attempting to refresh session...")
            await refreshSession()
            setRetryCount((prev) => prev + 1)
            return
          }

          console.log("No user after refresh attempts, redirecting to login")
          window.location.href = "/auth/login"
          return
        }

        // User is authenticated, stop checking
        setIsChecking(false)
      } catch (error) {
        console.error("Error in AuthGuard:", error)
        window.location.href = "/auth/login"
      }
    }

    checkAuth()
  }, [user, loading, router, refreshSession, retryCount])

  // Show loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verifying authentication...</span>
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}
