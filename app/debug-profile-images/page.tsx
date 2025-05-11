"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DebugProfileImagesPage() {
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [testUrl, setTestUrl] = useState("")
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    async function fetchMentors() {
      try {
        setLoading(true)

        // Fetch mentors with their profiles
        const { data, error } = await supabase
          .from("mentors")
          .select(`
            id, 
            profile_image_url,
            profiles(name, avatar)
          `)
          .limit(10)

        if (error) throw error

        console.log("Fetched mentor data:", data)
        setMentors(data || [])
      } catch (err) {
        console.error("Error fetching mentors:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  const testImageUrl = async () => {
    if (!testUrl) return

    try {
      // Test if the image URL is valid
      const img = new Image()
      img.onload = () => {
        setTestResult({
          success: true,
          message: `Image loaded successfully! Size: ${img.width}x${img.height}`,
        })
      }
      img.onerror = () => {
        setTestResult({
          success: false,
          message: "Failed to load image. The URL might be invalid or inaccessible.",
        })
      }
      img.src = testUrl
    } catch (err) {
      setTestResult({
        success: false,
        message: `Error testing image: ${err}`,
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Debug Profile Images</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Image URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter image URL to test"
              className="flex-1"
            />
            <Button onClick={testImageUrl}>Test URL</Button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-md ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              <p>{testResult.message}</p>
              {testResult.success && testUrl && (
                <div className="mt-4 flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={testUrl || "/placeholder.svg"} />
                    <AvatarFallback>Test</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mentor Profile Images</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading mentor data...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="border p-4 rounded-md">
                  <h3 className="font-medium mb-2">{mentor.profiles?.name || mentor.id}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">profile_image_url:</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={mentor.profile_image_url || "/placeholder.svg"}
                            onError={(e) => {
                              console.error("Failed to load profile_image_url:", mentor.profile_image_url)
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <div className="text-xs break-all">{mentor.profile_image_url || "null"}</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">profiles.avatar:</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={mentor.profiles?.avatar || "/placeholder.svg"}
                            onError={(e) => {
                              console.error("Failed to load avatar:", mentor.profiles?.avatar)
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <div className="text-xs break-all">{mentor.profiles?.avatar || "null"}</div>
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
