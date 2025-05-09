"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function FixStoragePermissionsPage() {
  const [isChecking, setIsChecking] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [status, setStatus] = useState<{
    bucketExists: boolean
    isPublic: boolean
    message: string
    error?: string
  } | null>(null)

  const checkBucket = async () => {
    setIsChecking(true)
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        setStatus({
          bucketExists: false,
          isPublic: false,
          message: "Error checking buckets",
          error: bucketsError.message,
        })
        return
      }

      const profilesBucket = buckets.find((b) => b.name === "profiles")

      if (!profilesBucket) {
        setStatus({
          bucketExists: false,
          isPublic: false,
          message: "Profiles bucket does not exist",
        })
        return
      }

      setStatus({
        bucketExists: true,
        isPublic: profilesBucket.public || false,
        message: profilesBucket.public
          ? "Profiles bucket exists and is public"
          : "Profiles bucket exists but is not public",
      })
    } catch (error: any) {
      setStatus({
        bucketExists: false,
        isPublic: false,
        message: "Error checking bucket status",
        error: error.message,
      })
    } finally {
      setIsChecking(false)
    }
  }

  const fixBucket = async () => {
    setIsFixing(true)
    try {
      if (!status?.bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket("profiles", {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        })

        if (createError) {
          setStatus({
            bucketExists: false,
            isPublic: false,
            message: "Failed to create profiles bucket",
            error: createError.message,
          })
          return
        }

        setStatus({
          bucketExists: true,
          isPublic: true,
          message: "Successfully created public profiles bucket",
        })
      } else if (!status.isPublic) {
        // Update bucket to be public
        const { error: updateError } = await supabase.storage.updateBucket("profiles", {
          public: true,
        })

        if (updateError) {
          setStatus({
            ...status,
            message: "Failed to update bucket permissions",
            error: updateError.message,
          })
          return
        }

        setStatus({
          bucketExists: true,
          isPublic: true,
          message: "Successfully updated profiles bucket to be public",
        })
      }
    } catch (error: any) {
      setStatus({
        bucketExists: status?.bucketExists || false,
        isPublic: status?.isPublic || false,
        message: "Error fixing bucket",
        error: error.message,
      })
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Fix Storage Permissions</CardTitle>
          <CardDescription>
            Check and fix permissions for the Supabase storage bucket used for profile images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={checkBucket} disabled={isChecking || isFixing}>
              {isChecking ? "Checking..." : "Check Bucket Status"}
            </Button>

            <Button
              onClick={fixBucket}
              disabled={isFixing || isChecking || !status || (status.bucketExists && status.isPublic)}
              variant="outline"
            >
              {isFixing ? "Fixing..." : "Fix Bucket Permissions"}
            </Button>
          </div>

          {status && (
            <Alert
              variant={status.error ? "destructive" : status.bucketExists && status.isPublic ? "default" : "warning"}
            >
              {status.error ? (
                <AlertCircle className="h-4 w-4" />
              ) : status.bucketExists && status.isPublic ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {status.error ? "Error" : status.bucketExists && status.isPublic ? "Success" : "Warning"}
              </AlertTitle>
              <AlertDescription>
                {status.message}
                {status.error && <div className="mt-2 text-xs">Error details: {status.error}</div>}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-500 mt-4">
            <h3 className="font-medium mb-2">Troubleshooting Steps:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Check if the profiles bucket exists and is public</li>
              <li>If the bucket doesn't exist, create it with public access</li>
              <li>If the bucket exists but isn't public, update its permissions</li>
              <li>After fixing permissions, try uploading a profile image again</li>
              <li>Clear your browser cache or use incognito mode to test</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
