"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function DebugStripePage() {
  const [userId, setUserId] = useState("")
  const [accountId, setAccountId] = useState("")
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  const handleCreateAccount = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/stripe/connect-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create Stripe account")
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: "Stripe Connect account created successfully",
      })

      // Open the onboarding URL in a new tab
      if (data.url) {
        window.open(data.url, "_blank")
      }
    } catch (error) {
      console.error("Error creating Stripe account:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckAccount = async () => {
    if (!accountId) {
      toast({
        title: "Error",
        description: "Please enter an account ID",
        variant: "destructive",
      })
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch(`/api/debug-stripe/account?accountId=${accountId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check Stripe account")
      }

      const data = await response.json()
      setAccountStatus(data.account)
      toast({
        title: "Success",
        description: "Stripe account status retrieved successfully",
      })
    } catch (error) {
      console.error("Error checking Stripe account:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      setAccountStatus(null)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Stripe Connect Debugging</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Stripe Connect Account</CardTitle>
            <CardDescription>Create a Stripe Connect account for a user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID"
                />
              </div>

              <Button onClick={handleCreateAccount} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Stripe Connect Account"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check Stripe Connect Account</CardTitle>
            <CardDescription>Check the status of a Stripe Connect account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountId">Stripe Account ID</Label>
                <Input
                  id="accountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Enter Stripe account ID"
                />
              </div>

              <Button onClick={handleCheckAccount} disabled={isChecking} className="w-full">
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Account Status"
                )}
              </Button>

              {accountStatus && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Account Status:</h3>
                  <pre className="text-sm overflow-auto p-2 bg-background rounded">
                    {JSON.stringify(accountStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
