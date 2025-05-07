"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateMentorProfile, getUserProfile, getMentorProfile, updateUserProfile } from "@/lib/supabase"
import { supabase } from "@/lib/supabase-client"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Upload, Camera } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    university: "",
    bio: "",
    avatar: "",
    profile_image_url: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [bucketError, setBucketError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        // Get user profile
        const { profile } = await getUserProfile(user.id)

        if (profile) {
          setFormData((prev) => ({
            ...prev,
            name: profile.name || "",
            avatar: profile.avatar || "",
          }))
        }

        // If consultant, get mentor profile
        if (user.role === "consultant") {
          const { mentor } = await getMentorProfile(user.id)

          if (mentor) {
            setFormData((prev) => ({
              ...prev,
              title: mentor.title || "",
              university: mentor.university || "",
              bio: mentor.bio || "",
              profile_image_url: mentor.profile_image_url || profile?.avatar || "",
            }))
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error loading profile",
          description: "There was an error loading your profile information",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageClick = () => {
    // Trigger the hidden file input when the image is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Reset bucket error
    setBucketError(null)

    // Validate file type
    const fileType = file.type
    if (!fileType.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Check if the bucket exists by trying to list files
      const { data: bucketCheck, error: bucketCheckError } = await supabase.storage.from("profiles").list(user.id)

      if (bucketCheckError && bucketCheckError.message.includes("bucket not found")) {
        setBucketError("Storage bucket not found. Please set up the storage bucket first.")
        setIsUploading(false)
        return
      }

      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage.from("profiles").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        onUploadProgress: (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100)
          setUploadProgress(percent)
        },
      })

      if (uploadError) {
        if (uploadError.message.includes("bucket not found")) {
          setBucketError("Storage bucket not found. Please set up the storage bucket first.")
          return
        }
        throw uploadError
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("profiles").getPublicUrl(filePath)
      const avatarUrl = publicUrlData.publicUrl

      // Update the form data with the new avatar URL
      setFormData((prev) => ({
        ...prev,
        avatar: avatarUrl,
        profile_image_url: avatarUrl,
      }))

      // Update the user profile with the new avatar URL
      const { error: updateError } = await supabase.from("profiles").update({ avatar: avatarUrl }).eq("id", user.id)

      if (updateError) {
        throw updateError
      }

      // If user is a consultant, also update the mentor profile
      if (user.role === "consultant") {
        const { error: mentorUpdateError } = await supabase
          .from("mentors")
          .update({ profile_image_url: avatarUrl })
          .eq("id", user.id)

        if (mentorUpdateError) {
          console.error("Error updating mentor profile image:", mentorUpdateError)
          // Continue anyway since the profile avatar was updated
        }
      }

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      })
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)

      if (error.message?.includes("bucket not found")) {
        setBucketError("Storage bucket not found. Please set up the storage bucket first.")
      } else {
        toast({
          title: "Upload failed",
          description: error.message || "There was an error uploading your profile picture",
          variant: "destructive",
        })
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!user) throw new Error("User not authenticated")

      // Update user profile (name)
      const userUpdateResult = await updateUserProfile(user.id, {
        name: formData.name,
      })

      if (userUpdateResult.error) throw userUpdateResult.error

      // Update mentor profile if consultant
      if (user.role === "consultant") {
        const result = await updateMentorProfile(user.id, {
          title: formData.title,
          university: formData.university,
          bio: formData.bio,
          profile_image_url: formData.profile_image_url || formData.avatar,
        })

        if (result.error) throw result.error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please log in to view this page.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            {user.role === "consultant" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Junior, Computer Science"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={5} required />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Profile Picture</Label>

              {bucketError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Storage Error</AlertTitle>
                  <AlertDescription>
                    {bucketError}
                    <div className="mt-2">
                      <Link href="/setup-storage-bucket" className="underline font-medium">
                        Click here to set up the storage bucket
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex flex-col items-center">
                  <div
                    className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity bg-[#1C2127]"
                    onClick={handleImageClick}
                  >
                    {isUploading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                        <div className="text-sm font-medium mb-1">Uploading...</div>
                        <div className="w-4/5 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1C2127] rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs mt-1">{uploadProgress}%</div>
                      </div>
                    ) : (
                      <>
                        <Image
                          src={
                            formData.profile_image_url ||
                            formData.avatar ||
                            "/placeholder.svg?height=128&width=128&query=profile"
                          }
                          alt="Profile picture"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleImageClick}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {formData.avatar ? "Change Picture" : "Upload Picture"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">Click on the image to upload a new profile picture</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
