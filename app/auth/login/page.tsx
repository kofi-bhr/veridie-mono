"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<any>(null)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setDebug(null)

    try {
      // Direct Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setDebug({ error })
        return
      }

      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

        toast({
          title: "Login successful",
          description: "Welcome back!",
        })

        // Direct navigation based on role
        if (profile?.role === "consultant") {
          console.log("Redirecting to dashboard...")
          // Use a slight delay to ensure the toast is visible
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 500)
        } else {
          console.log("Redirecting to mentors...")
          setTimeout(() => {
            window.location.href = "/mentors"
          }, 500)
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
      setDebug({ err })
    } finally {
      setIsLoading(false)
    }
  }

  // Create a test user for easy login
  const createTestUser = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // First check if test user exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "password123",
      })

      if (existingUser.user) {
        setEmail("test@example.com")
        setPassword("password123")
        toast({
          title: "Test user exists",
          description: "Credentials filled in. Click Login to continue.",
        })
        setIsLoading(false)
        return
      }

      // Create new test user
      const { data, error } = await supabase.auth.signUp({
        email: "test@example.com",
        password: "password123",
      })

      if (error) throw error

      if (data.user) {
        // Create profile
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: "test@example.com",
          name: "Test User",
          role: "consultant",
          avatar: "/placeholder.svg?height=40&width=40",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        // Create mentor profile
        await supabase.from("mentors").insert({
          id: data.user.id,
          title: "Test Mentor",
          university: "Test University",
          bio: "This is a test mentor profile",
          rating: 5,
          review_count: 1,
          languages: ["English"],
          created_at: new Date().toISOString(),
        })

        setEmail("test@example.com")
        setPassword("password123")

        toast({
          title: "Test user created",
          description: "Credentials filled in. Click Login to continue.",
        })
      }
    } catch (err: any) {
      setError(err.message || "Failed to create test user")
      setDebug({ err })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Log in to your account</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {debug && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
                <p className="font-bold">Debug Info:</p>
                <pre>{JSON.stringify(debug, null, 2)}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
            <div className="text-center">
              <Button type="button" variant="outline" onClick={createTestUser} className="text-xs" disabled={isLoading}>
                Create Test Account
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
