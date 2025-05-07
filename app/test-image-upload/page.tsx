"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"

export default function TestImageUpload() {
  const { user } = useAuth()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) {
      setUploadStatus("No file selected or user not logged in")
      return
    }

    setIsUploading(true)
    setUploadStatus("Starting upload...")

    try {
      // Log bucket existence
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        setUploadStatus(`Error checking buckets: ${bucketsError.message}`)
        return
      }

      setUploadStatus(`Available buckets: ${buckets.map((b) => b.name).join(", ")}`)

      // Check if profiles bucket exists
      const profilesBucket = buckets.find((b) => b.name === "profiles")
      if (!profilesBucket) {
        setUploadStatus("Profiles bucket not found! Please create it in Supabase dashboard.")
        return
      }

      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      setUploadStatus(`Uploading to path: ${filePath}`)

      // Upload the file
      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        setUploadStatus(`Upload error: ${uploadError.message}`)
        return
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("profiles").getPublicUrl(filePath)
      const avatarUrl = publicUrlData.publicUrl

      setImageUrl(avatarUrl)
      setUploadStatus(`Upload successful! URL: ${avatarUrl}`)

      // Test updating the database
      const { error: dbError } = await supabase
        .from("mentors")
        .update({ profile_image_url: avatarUrl })
        .eq("id", user.id)

      if (dbError) {
        setUploadStatus(`Database update error: ${dbError.message}`)
      } else {
        setUploadStatus(`Database updated successfully with new image URL`)
      }
    } catch (error: any) {
      setUploadStatus(`Unexpected error: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Image Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            {imageUrl && (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                <Image src={imageUrl || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover" />
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Select Image"}
            </Button>

            <div className="w-full mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Upload Status:</h3>
              <pre className="text-xs whitespace-pre-wrap break-words">{uploadStatus}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
