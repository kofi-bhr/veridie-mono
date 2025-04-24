"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function DebugMentorDataPage() {
  const [mentorId, setMentorId] = useState("")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchMentorData() {
    if (!mentorId) {
      setError("Please enter a mentor ID")
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      // Fetch mentor data
      const { data: mentorData, error: mentorError } = await supabase
        .from("mentors")
        .select("*")
        .eq("id", mentorId)
        .single()

      if (mentorError) throw new Error(`Mentor error: ${mentorError.message}`)

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", mentorId)
        .single()

      if (profileError) console.error(`Profile error: ${profileError.message}`)

      // Fetch services
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("mentor_id", mentorId)

      if (servicesError) console.error(`Services error: ${servicesError.message}`)

      setData({
        mentor: mentorData,
        profile: profileData || "Not found",
        services: services || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Mentor Data</h1>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Enter mentor ID"
          value={mentorId}
          onChange={(e) => setMentorId(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={fetchMentorData} disabled={loading}>
          {loading ? "Loading..." : "Fetch Data"}
        </Button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(data.mentor, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(data.profile, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Services ({data.services.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(data.services, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
