"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Info, AlertCircle, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export default function CalendlyStatusPage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [mentor, setMentor] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && profile?.id) {
      fetchData(profile.id)
    }
  }, [user, profile])

  const fetchData = async (mentorId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Fetch mentor's Calendly token
      const { data, error } = await supabase
        .from("mentors")
        .select("calendly_access_token, calendly_username")
        .eq("id", mentorId)
        .single()

      if (error) {
        throw new Error("Failed to fetch mentor data")
      }

      setMentor(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Calendly Integration Status</CardTitle>
          <CardDescription>Current status of your Calendly integration</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700 flex items-start">
              <Info className="h-5 w-5 mr-3 mt-0.5" />
              <div>
                <p className="font-medium mb-2">About Calendly Integration</p>
                <p className="mb-2">
                  We're currently using a simplified integration with Calendly. When clients book sessions, they'll see
                  available time slots based on standard business hours.
                </p>
                <p>
                  After booking, you'll receive a notification and can then schedule the actual meeting in your Calendly
                  account.
                </p>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Calendly Connection Status
              </h3>

              {mentor?.calendly_access_token ? (
                <div className="text-green-600 flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                  <span>Connected to Calendly{mentor.calendly_username ? ` as ${mentor.calendly_username}` : ""}</span>
                </div>
              ) : (
                <div className="text-red-600 flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></div>
                  <span>Not connected to Calendly</span>
                </div>
              )}
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">How Booking Works</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Clients see available time slots based on standard business hours</li>
                <li>When a client books a session, you'll receive a notification</li>
                <li>You can then schedule the actual meeting in your Calendly account</li>
                <li>The client will receive the meeting details via email</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
