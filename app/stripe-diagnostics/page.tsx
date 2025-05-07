"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function StripeDiagnosticsPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [userId, setUserId] = useState("")
  const { toast } = useToast()

  const runDiagnostics = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/stripe/diagnostics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId || undefined }),
      })

      if (!response.ok) {
        throw new Error(`Diagnostics failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)

      toast({
        title: "Diagnostics Complete",
        description: data.success ? "All tests passed!" : "Some tests failed. See details below.",
        variant: data.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Diagnostics error:", error)
      toast({
        title: "Diagnostics Error",
        description: error instanceof Error ? error.message : "Failed to run diagnostics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Stripe Integration Diagnostics</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Run Diagnostics</CardTitle>
          <CardDescription>This tool will check your Stripe integration and identify any issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID (Optional)</Label>
              <Input
                id="userId"
                placeholder="Enter user ID to check specific user"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Leave blank to run general diagnostics</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={runDiagnostics} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              "Run Diagnostics"
            )}
          </Button>
        </CardFooter>
      </Card>

      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {results.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                )}
                Diagnostics Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Environment Variables */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Environment Variables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Object.entries(results.environment || {}).map(([key, value]: [string, any]) => (
                          <li key={key} className="flex justify-between items-center">
                            <span>{key}</span>
                            <span className="flex items-center">{getStatusIcon(value)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Database Schema */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Database Schema</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Object.entries(results.database || {}).map(([key, value]: [string, any]) => (
                          <li key={key} className="flex justify-between items-center">
                            <span>{key}</span>
                            <span className="flex items-center">{getStatusIcon(value)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Stripe API */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Stripe API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {Object.entries(results.stripe || {}).map(([key, value]: [string, any]) => (
                        <li key={key} className="flex justify-between items-center">
                          <span>{key}</span>
                          <span className="flex items-center">
                            {getStatusIcon(value.success)}
                            <span className="ml-2 text-sm text-muted-foreground">{value.message}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* User Specific Checks */}
                {results.user && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">User Checks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Object.entries(results.user).map(([key, value]: [string, any]) => (
                          <li key={key} className="flex justify-between items-center">
                            <span>{key}</span>
                            <span className="flex items-center">
                              {typeof value === "object" && value !== null ? (
                                <>
                                  {getStatusIcon(value.success)}
                                  <span className="ml-2 text-sm text-muted-foreground">{value.message}</span>
                                </>
                              ) : (
                                <span>{String(value)}</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 list-disc pl-5">
                        {results.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
