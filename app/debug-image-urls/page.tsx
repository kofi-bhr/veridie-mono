"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase-client"
import { getProxiedImageUrl } from "@/lib/image-utils"

export default function DebugImageUrlsPage() {
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storageInfo, setStorageInfo] = useState<any>(null)
  const [loadingStorage, setLoadingStorage] = useState(false)

  useEffect(() => {
    async function fetchMentors() {
      try {
        setLoading(true)

        // Fetch mentors with profile_image_url
        const { data, error } = await supabase
          .from("mentors")
          .select("id, profile_image_url")
          .not("profile_image_url", "is", null)
          .limit(10)

        if (error) throw error

        // Fetch corresponding profiles
        const mentorIds = data.map((m) => m.id)
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, avatar")
          .in("id", mentorIds)

        if (profilesError) throw profilesError

        // Combine the data
        const combined = data.map((mentor) => {
          const profile = profiles.find((p) => p.id === mentor.id)
          return {
            ...mentor,
            name: profile?.name || "Unknown",
            avatar: profile?.avatar || null,
          }
        })

        setMentors(combined)
      } catch (err) {
        console.error("Error fetching mentors:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  const fetchStorageInfo = async () => {
    try {
      setLoadingStorage(true)
      const response = await fetch("/api/debug/storage")
      const data = await response.json()
      setStorageInfo(data)
    } catch (err) {
      console.error("Error fetching storage info:", err)
    } finally {
      setLoadingStorage(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Debug Image URLs</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Storage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchStorageInfo} disabled={loadingStorage} className="mb-4">
            {loadingStorage ? "Loading..." : "Fetch Storage Info"}
          </Button>

          {storageInfo && (
            <div className="mt-4 p-4 bg-muted rounded-md overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(storageInfo, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mentor Image URLs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading mentors...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-6">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="border p-4 rounded-md">
                  <h3 className="font-bold mb-2">
                    {mentor.name} ({mentor.id})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Original profile_image_url:</p>
                      <div className="p-2 bg-muted rounded text-xs break-all">{mentor.profile_image_url || "None"}</div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Original avatar:</p>
                      <div className="p-2 bg-muted rounded text-xs break-all">{mentor.avatar || "None"}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Proxied profile_image_url:</p>
                      <div className="p-2 bg-muted rounded text-xs break-all">
                        {getProxiedImageUrl(mentor.profile_image_url) || "None"}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Proxied avatar:</p>
                      <div className="p-2 bg-muted rounded text-xs break-all">
                        {getProxiedImageUrl(mentor.avatar) || "None"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Profile Image Test:</p>
                      <div className="h-20 w-20 relative border rounded-md overflow-hidden">
                        <img
                          src={getProxiedImageUrl(mentor.profile_image_url) || "/placeholder.svg"}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load image: ${e.currentTarget.src}`)
                            e.currentTarget.src = "/diverse-avatars.png"
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Avatar Test:</p>
                      <div className="h-20 w-20 relative border rounded-md overflow-hidden">
                        <img
                          src={getProxiedImageUrl(mentor.avatar) || "/placeholder.svg"}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load image: ${e.currentTarget.src}`)
                            e.currentTarget.src = "/diverse-avatars.png"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
