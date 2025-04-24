"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SetupDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const setupDatabase = async () => {
    setIsLoading(true)
    try {
      // First setup the database structure
      const setupResponse = await fetch("/api/setup-database")
      const setupData = await setupResponse.json()

      if (!setupResponse.ok) {
        throw new Error(setupData.error || "Failed to setup database")
      }

      // Then setup the mentor tables
      const tablesResponse = await fetch("/api/setup-mentor-tables")
      const tablesData = await tablesResponse.json()

      if (!tablesResponse.ok) {
        throw new Error(tablesData.error || "Failed to setup mentor tables")
      }

      toast({
        title: "Database Setup Complete",
        description: "All required tables have been created successfully.",
      })

      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Setup error:", error)
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={setupDatabase} disabled={isLoading} variant="outline" className="mt-4">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Setting up database...
        </>
      ) : (
        "Setup Database Tables"
      )}
    </Button>
  )
}
