"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"

export default function CreateStorageBucket() {
  const [status, setStatus] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)

  const createBucket = async () => {
    setIsCreating(true)
    setStatus("Creating bucket...")

    try {
      // Check if bucket already exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()

      if (listError) {
        setStatus(`Error listing buckets: ${listError.message}`)
        return
      }

      const profilesBucket = buckets.find((b) => b.name === "profiles")

      if (profilesBucket) {
        setStatus("Profiles bucket already exists!")
        return
      }

      // Create the bucket
      const { data, error } = await supabase.storage.createBucket("profiles", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        setStatus(`Error creating bucket: ${error.message}`)
        return
      }

      setStatus("Profiles bucket created successfully!")

      // Create policy for public read access
      const { error: policyError } = await supabase.rpc("create_storage_policy", {
        bucket_name: "profiles",
        policy_name: "Public Read Access",
        definition: "true",
        operation: "SELECT",
      })

      if (policyError) {
        setStatus(`Bucket created but error setting read policy: ${policyError.message}`)
        return
      }

      // Create policy for authenticated uploads
      const { error: uploadPolicyError } = await supabase.rpc("create_storage_policy", {
        bucket_name: "profiles",
        policy_name: "Authenticated Upload Access",
        definition: "auth.role() = 'authenticated'",
        operation: "INSERT",
      })

      if (uploadPolicyError) {
        setStatus(`Bucket created but error setting upload policy: ${uploadPolicyError.message}`)
        return
      }

      setStatus("Profiles bucket and policies created successfully!")
    } catch (error: any) {
      setStatus(`Unexpected error: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Profiles Storage Bucket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This will create a "profiles" storage bucket in your Supabase project if it doesn't already exist.</p>

          <Button onClick={createBucket} disabled={isCreating} className="w-full">
            {isCreating ? "Creating..." : "Create Profiles Bucket"}
          </Button>

          {status && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Status:</h3>
              <p className="text-sm">{status}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
