"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { checkProfilesBucket, makeProfilesBucketPublic, createProfilesBucket } from "@/lib/storage-utils"

export default function FixStorageBucketPage() {
  const [status, setStatus] = useState<{
    checking: boolean
    bucketExists: boolean
    isPublic: boolean
    message: string
  }>({
    checking: true,
    bucketExists: false,
    isPublic: false,
    message: "Checking storage bucket...",
  })

  const [fixing, setFixing] = useState(false)

  useEffect(() => {
    checkBucket()
  }, [])

  async function checkBucket() {
    setStatus((prev) => ({ ...prev, checking: true, message: "Checking storage bucket..." }))

    const result = await checkProfilesBucket()

    if (result.success) {
      setStatus({
        checking: false,
        bucketExists: true,
        isPublic: result.isPublic || false,
        message: `Profiles bucket exists. Public: ${result.isPublic ? "Yes" : "No"}`,
      })
    } else {
      setStatus({
        checking: false,
        bucketExists: false,
        isPublic: false,
        message: result.message,
      })
    }
  }

  async function fixBucket() {
    setFixing(true)

    if (!status.bucketExists) {
      // Create the bucket
      const createResult = await createProfilesBucket()

      if (createResult.success) {
        setStatus((prev) => ({
          ...prev,
          bucketExists: true,
          isPublic: true,
          message: "Profiles bucket created successfully and is public",
        }))
      } else {
        setStatus((prev) => ({
          ...prev,
          message: createResult.message,
        }))
      }
    } else if (!status.isPublic) {
      // Make the bucket public
      const updateResult = await makeProfilesBucketPublic()

      if (updateResult.success) {
        setStatus((prev) => ({
          ...prev,
          isPublic: true,
          message: "Profiles bucket is now public",
        }))
      } else {
        setStatus((prev) => ({
          ...prev,
          message: updateResult.message,
        }))
      }
    }

    setFixing(false)
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Fix Storage Bucket</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Storage Bucket Status</CardTitle>
          <CardDescription>Check and fix the Supabase storage bucket for profile images</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="font-medium">Bucket Exists:</div>
              <div>{status.checking ? "Checking..." : status.bucketExists ? "Yes" : "No"}</div>

              <div className="font-medium">Bucket is Public:</div>
              <div>{status.checking ? "Checking..." : status.isPublic ? "Yes" : "No"}</div>
            </div>

            <div className="p-4 bg-muted rounded-md">
              <p className="font-medium">Status:</p>
              <p>{status.message}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={checkBucket} disabled={status.checking}>
            Refresh Status
          </Button>
          <Button
            onClick={fixBucket}
            disabled={fixing || status.checking || (status.bucketExists && status.isPublic)}
            variant="default"
          >
            {fixing ? "Fixing..." : "Fix Bucket"}
          </Button>
        </CardFooter>
      </Card>

      <div className="bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Troubleshooting Profile Images</h2>
        <p className="mb-4">
          If you're having issues with profile images not loading, it could be due to one of the following reasons:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The storage bucket doesn't exist or isn't public</li>
          <li>The image URL is incorrect or the image doesn't exist</li>
          <li>There are CORS issues with the Supabase storage</li>
          <li>The browser is caching old images</li>
        </ul>
        <p className="mt-4">After fixing the storage bucket, try refreshing the page or clearing your browser cache.</p>
      </div>
    </div>
  )
}
