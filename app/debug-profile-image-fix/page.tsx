"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function DebugProfileImageFixPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profileData, setProfileData] = useState<any>(null)
  const [mentorData, setMentorData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [fixing, setFixing] = useState(false)
  const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null)
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)
  const [checkingBucket, setCheckingBucket] = useState(false)

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

  const checkStorageBucket = async () => {
    setCheckingBucket(true)
    setBucketExists(null)

    try {
      // Try to list the root of the profiles bucket
      const { data, error } = await supabase.storage.from("profiles").list()

      if (error) {
        if (error.message.includes("bucket not found")) {
          setBucketExists(false)
        } else {
          throw error
        }
      } else {
        setBucketExists(true)
      }
    } catch (error) {
      console.error("Error checking storage bucket:", error)
      toast({
        title: "Error checking storage bucket",
        description: "Could not verify if the profiles storage bucket exists",
        variant: "destructive",
      })
    } finally {
      setCheckingBucket(false)
    }
  }

  const createStorageBucket = async () => {
    try {
      // Create the profiles bucket
      const { data, error } = await supabase.storage.createBucket("profiles", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) throw error

      toast({
        title: "Storage bucket created",
        description: "The profiles storage bucket has been created successfully",
      })

      setBucketExists(true)
    } catch (error: any) {
      console.error("Error creating storage bucket:", error)
      toast({
        title: "Error creating storage bucket",
        description: error.message || "Could not create the profiles storage bucket",
        variant: "destructive",
      })
    }
  }

  const fixProfileImage = async () => {
    if (!user) return

    setFixing(true)
    setFixResult(null)

    try {
      // 1. Check if the profile_image_url field exists in mentors table
      const { data: columnCheck, error: columnCheckError } = await supabase.rpc("column_exists", {
        table_name: "mentors",
        column_name: "profile_image_url",
      })

      if (columnCheckError) throw columnCheckError

      if (!columnCheck) {
        // Add the column if it doesn't exist
        const addColumnSql = `
          ALTER TABLE public.mentors
          ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
        `
        const { error: addColumnError } = await supabase.rpc("exec_sql", { sql: addColumnSql })
        if (addColumnError) throw addColumnError
      }

      // 2. Sync the profile_image_url with avatar if needed
      if (
        profileData?.avatar &&
        (!mentorData?.profile_image_url || mentorData.profile_image_url !== profileData.avatar)
      ) {
        const { error: updateError } = await supabase
          .from("mentors")
          .update({ profile_image_url: profileData.avatar })
          .eq("id", user.id)

        if (updateError) throw updateError

        // Refresh mentor data
        const { data: updatedMentor, error: fetchError } = await supabase
          .from("mentors")
          .select("*")
          .eq("id", user.id)
          .single()

        if (!fetchError) {
          setMentorData(updatedMentor)
        }
      }

      // 3. Check storage permissions
      const permissionsSql = `
        GRANT SELECT ON storage.objects TO anon, authenticated;
        GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
      `
      const { error: permissionsError } = await supabase.rpc("exec_sql", { sql: permissionsSql })
      if (permissionsError) throw permissionsError

      setFixResult({
        success: true,
        message: "Profile image issues have been fixed. Your profile image should now display correctly.",
      })
    } catch (error: any) {
      console.error("Error fixing profile image:", error)
      setFixResult({
        success: false,
        message: error.message || "An error occurred while fixing profile image issues",
      })
    } finally {
      setFixing(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Fix Profile Image</CardTitle>
            <CardDescription>Please log in to fix your profile image issues</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Fix Profile Image Issues</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Profile Image Status</CardTitle>
          <CardDescription>Diagnostic information about your profile images</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p>Loading profile data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Profile Avatar:</h3>
                  <div className="flex items-start gap-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-muted">
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
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">URL in database:</p>
                      <p className="text-xs break-all bg-muted p-2 rounded">
                        {profileData?.avatar || "No avatar URL found"}
                      </p>
                    </div>
                  </div>
                </div>

                {user.role === "consultant" && (
                  <div>
                    <h3 className="font-medium mb-2">Mentor Profile Image:</h3>
                    <div className="flex items-start gap-4">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-muted">
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
                          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">URL in database:</p>
                        <p className="text-xs break-all bg-muted p-2 rounded">
                          {mentorData?.profile_image_url || "No profile image URL found"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Storage Bucket Status:</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Button onClick={checkStorageBucket} disabled={checkingBucket} variant="outline" size="sm">
                    {checkingBucket ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Checking...
                      </>
                    ) : (
                      "Check Storage Bucket"
                    )}
                  </Button>

                  {bucketExists === true && (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Bucket exists
                    </span>
                  )}

                  {bucketExists === false && (
                    <span className="text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Bucket not found
                    </span>
                  )}
                </div>

                {bucketExists === false && (
                  <Button onClick={createStorageBucket} size="sm">
                    Create Storage Bucket
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button onClick={fixProfileImage} disabled={fixing || loading} className="mb-4">
            {fixing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing...
              </>
            ) : (
              "Fix Profile Image Issues"
            )}
          </Button>

          {fixResult && (
            <div
              className={`p-4 rounded-md w-full ${
                fixResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              <div className="flex items-center">
                {fixResult.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                )}
                <p>{fixResult.message}</p>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
          <CardDescription>Troubleshooting steps for profile image problems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Issue: Image uploads but doesn't display</h3>
              <p className="text-sm text-muted-foreground mb-2">
                This usually happens when the image URL is saved to the profiles table but not to the mentors table.
              </p>
              <p className="text-sm">
                Solution: The "Fix Profile Image Issues" button above will sync your profile avatar with your mentor
                profile image.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Issue: Storage bucket not found</h3>
              <p className="text-sm text-muted-foreground mb-2">
                The "profiles" storage bucket might not exist in your Supabase project.
              </p>
              <p className="text-sm">
                Solution: Use the "Check Storage Bucket" button to verify if the bucket exists, and create it if needed.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Issue: Permission errors</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Your Supabase storage might have incorrect permissions settings.
              </p>
              <p className="text-sm">
                Solution: The fix button will update the storage permissions to allow proper access to profile images.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
