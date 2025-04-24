"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function DebugPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("client")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [tablesCheck, setTablesCheck] = useState<any>(null)
  const { toast } = useToast()

  const checkTables = async () => {
    try {
      const response = await fetch("/api/debug-auth")
      const data = await response.json()
      setTablesCheck(data)
    } catch (error) {
      console.error("Error checking tables:", error)
      toast({
        title: "Error checking tables",
        description: "Check the console for details",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/debug-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.error) {
        toast({
          title: `Error at step: ${data.step}`,
          description: data.error.message || "Unknown error",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Debug signup successful",
          description: "Check the result below for details",
        })
      }
    } catch (error) {
      console.error("Error during debug signup:", error)
      toast({
        title: "Error during debug signup",
        description: "Check the console for details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Auth Debugging Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Check Database Tables</CardTitle>
            <CardDescription>Verify if required tables exist in your Supabase database</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkTables}>Check Tables</Button>

            {tablesCheck && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Results:</h3>
                <pre className="text-sm overflow-auto p-2 bg-background rounded">
                  {JSON.stringify(tablesCheck, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Signup</CardTitle>
            <CardDescription>Test the signup process with detailed error reporting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                <Label>Role</Label>
                <RadioGroup value={role} onValueChange={setRole}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client">Client</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="consultant" id="consultant" />
                    <Label htmlFor="consultant">Consultant</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Testing..." : "Test Signup"}
              </Button>
            </form>
          </CardContent>

          {result && (
            <CardFooter className="flex-col items-start">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-sm overflow-auto p-2 bg-muted rounded w-full">{JSON.stringify(result, null, 2)}</pre>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
