"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ExternalLink } from "lucide-react"

interface StripeConnectButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function StripeConnectButton({
  variant = "default",
  size = "default",
  className = "",
  children,
}: StripeConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSetupStripeConnect = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/connect-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        let errorMessage = "Failed to set up Stripe Connect account"

        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`
            }
          }
        } catch (e) {
          console.error("Error parsing error response:", e)
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url
      } else {
        throw new Error("No redirect URL returned from server")
      }
    } catch (error) {
      console.error("Error setting up Stripe Connect:", error)

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up Stripe Connect",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleSetupStripeConnect} disabled={isLoading}>
      {isLoading ? "Setting up..." : children || "Set Up Stripe Connect"}
      {!isLoading && <ExternalLink className="ml-2 h-4 w-4" />}
    </Button>
  )
}
