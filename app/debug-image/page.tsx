"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

export default function DebugImagePage() {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [mentorData, setMentorData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testImageUrl, setTestImageUrl] = useState("")
  const [testImageLoaded, setTestImageLoaded] = useState(false)
  const [testImageError, setTestImageError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      try {
        setLoading(true)

        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError
        setProfileData(profile)

        // Fetch mentor data if user is a consultant
        if (user.role === "consultant") {
          const { data: mentor, error: mentorError } = await supabase
            .from("mentors")
            .select("*")
            .eq("id", user.id)
            .single()

          if (!mentorError) {
            setMentorData(mentor)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleTestImage = () => {
    setTestImageLoaded(false)
    setTestImageError(null)
  }

  const handleImageLoad = () => {
    setTestImageLoaded(true)
    setTestImageError(null)
  }

  const handleImageError = () => {
    setTestImageLoaded(false)
    setTestImageError("Failed to load image. The URL might be invalid or inaccessible.")
  }

  const updateProfileImageUrl = async () => {
    if (!user || !testImageUrl) return

    try {
      // Update profile avatar
      const { error: profileError } = await supabase.from("profiles").update({ avatar: testImageUrl }).eq("id", user.id)

      if (profileError) throw profileError

      // Update mentor profile_image_url if user is a consultant
      if (user.role === "consultant") {
        const { error: mentorError } = await supabase
          .from("mentors")
          .update({ profile_image_url: testImageUrl })
          .eq("id", user.id)

        if (mentorError) throw mentorError
      }

      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error("Error updating image URL:", error)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Debug Image</CardTitle>
            <CardDescription>Please log in to debug your profile image</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Debug Profile Image</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Profile Data</CardTitle>
            <CardDescription>Your current profile image information</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading profile data...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Profile Avatar URL:</h3>
                  <p className="text-sm break-all bg-muted p-2 rounded">
                    {profileData?.avatar || "No avatar URL found"}
                  </p>
                </div>

                {mentorData && (
                  <div>
                    <h3 className="font-medium mb-2">Mentor Profile Image URL:</h3>
                    <p className="text-sm break-all bg-muted p-2 rounded">
                      {mentorData?.profile_image_url || "No profile image URL found"}
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Profile Avatar Preview:</h3>
                  <div className="relative w-32 h-32 border-2 border-muted rounded-full overflow-hidden bg-[#1C2127]">
                    {profileData?.avatar ? (
                      <Image
                        src={profileData.avatar || "/placeholder.svg"}
                        alt="Profile Avatar"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/abstract-profile.png"
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white">No Image</div>
                    )}
                  </div>
                </div>

                {mentorData && (
                  <div>
                    <h3 className="font-medium mb-2">Mentor Profile Image Preview:</h3>
                    <div className="relative w-32 h-32 border-2 border-muted rounded-full overflow-hidden bg-[#1C2127]">
                      {mentorData?.profile_image_url ? (
                        <Image
                          src={mentorData.profile_image_url || "/placeholder.svg"}
                          alt="Mentor Profile Image"
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/abstract-profile.png"
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-white">No Image</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Image URL</CardTitle>
            <CardDescription>Test if an image URL works correctly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-image-url">Image URL to Test</Label>
                <Input
                  id="test-image-url"
                  value={testImageUrl}
                  onChange={(e) => setTestImageUrl(e.target.value)}
                  placeholder="Enter an image URL to test"
                />
              </div>

              <Button onClick={handleTestImage} disabled={!testImageUrl}>
                Test Image
              </Button>

              {testImageUrl && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Image Preview:</h3>
                  <div className="relative w-32 h-32 border-2 border-muted rounded-full overflow-hidden bg-[#1C2127]">
                    <Image
                      src={testImageUrl || "/placeholder.svg"}
                      alt="Test Image"
                      fill
                      className="object-cover"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </div>

                  {testImageLoaded && <p className="text-green-600 mt-2 text-sm">Image loaded successfully!</p>}
                  {testImageError && <p className="text-red-600 mt-2 text-sm">{testImageError}</p>}

                  {testImageLoaded && (
                    <Button onClick={updateProfileImageUrl} className="mt-4">
                      Use This Image for My Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
          <CardDescription>Follow these steps to fix image display issues</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Check if the image URL is valid:</strong> Use the test image tool above to verify your image URL
              works.
            </li>
            <li>
              <strong>Verify CORS settings:</strong> Make sure your Supabase storage bucket has CORS configured
              correctly.
            </li>
            <li>
              <strong>Check storage permissions:</strong> Ensure your storage bucket has public read access.
            </li>
            <li>
              <strong>Try a different image:</strong> Upload a different image or use a public image URL for testing.
            </li>
            <li>
              <strong>Clear browser cache:</strong> Try hard-refreshing your browser (Ctrl+F5 or Cmd+Shift+R).
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
