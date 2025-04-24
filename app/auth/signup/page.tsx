"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase-client"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("client")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<any>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setDebug(null)
    setSuccess(false)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    try {
      // Step 1: Create the user account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setDebug({ signUpError })
        return
      }

      if (!data.user) {
        setError("Failed to create user")
        return
      }

      // Step 2: Create the user profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name,
        email,
        role,
        avatar: "/placeholder.svg?height=40&width=40",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        setError(`Failed to create profile: ${profileError.message}`)
        setDebug({ profileError })
        return
      }

      // Step 3: If consultant, create mentor profile
      if (role === "consultant") {
        const { error: mentorError } = await supabase.from("mentors").insert({
          id: data.user.id,
          title: "",
          university: "",
          bio: "",
          rating: 0,
          review_count: 0,
          languages: [],
          created_at: new Date().toISOString(),
        })

        if (mentorError) {
          // Log but don't block - we can create this later
          console.error("Failed to create mentor profile:", mentorError)
        }
      }

      toast({
        title: "Account created successfully",
        description: "Welcome to Veridie!",
      })

      // Step 4: Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(`Login failed after signup: ${signInError.message}`)
        setDebug({ signInError })
        return
      }

      // Set success state
      setSuccess(true)

      // Step 5: Redirect based on role with a delay to ensure state is updated
      setTimeout(() => {
        if (role === "consultant") {
          window.location.href = "/dashboard"
        } else {
          window.location.href = "/mentors"
        }
      }, 1000)
    } catch (err: any) {
      setError(err.message || "An error occurred during signup")
      setDebug({ err })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Account created successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>I am a:</Label>
              <RadioGroup defaultValue="client" value={role} onValueChange={setRole}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client">Student looking for a consultant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="consultant" id="consultant" />
                  <Label htmlFor="consultant">Consultant looking to offer services</Label>
                </div>
              </RadioGroup>
            </div>

            {debug && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
                <p className="font-bold">Debug Info:</p>
                <pre>{JSON.stringify(debug, null, 2)}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || success}>
              {isLoading ? "Creating account..." : success ? "Redirecting..." : "Create account"}
            </Button>
            {success && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.href = role === "consultant" ? "/dashboard" : "/mentors"
                }}
              >
                Go to {role === "consultant" ? "Dashboard" : "Mentors"} Now
              </Button>
            )}
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
