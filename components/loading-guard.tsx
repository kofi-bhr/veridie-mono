"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoadingGuardProps {
  children: React.ReactNode
}

export function LoadingGuard({ children }: LoadingGuardProps) {
  const [isStuck, setIsStuck] = useState(false)
  const [showChildren, setShowChildren] = useState(false)

  useEffect(() => {
    // Show content immediately if this is not a page refresh
    const isRefresh = performance.navigation && performance.navigation.type === 1
    if (!isRefresh) {
      setShowChildren(true)
      return
    }

    // Set a short timeout to show content
    const showTimeout = setTimeout(() => {
      setShowChildren(true)
    }, 500)

    // Set a longer timeout to detect if we're stuck
    const stuckTimeout = setTimeout(() => {
      setIsStuck(true)
    }, 5000)

    return () => {
      clearTimeout(showTimeout)
      clearTimeout(stuckTimeout)
    }
  }, [])

  // If we detect we're stuck, show a recovery UI
  if (isStuck) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Loading Taking Too Long</h2>
          <p className="mb-6">
            It seems like the page is taking too long to load. This might be due to a temporary issue.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Don't show anything until our short timeout completes
  if (!showChildren) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
