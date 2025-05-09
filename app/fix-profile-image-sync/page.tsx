"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function FixProfileImageSyncPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const runMigration = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      // SQL to fix profile image URLs
      const sql = `
        -- Ensure profile_image_url column exists in mentors table
        ALTER TABLE public.mentors
        ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
        
        -- Sync profile_image_url with avatar from profiles where it's missing
        UPDATE public.mentors m
        SET profile_image_url = p.avatar
        FROM public.profiles p
        WHERE m.id = p.id
        AND (m.profile_image_url IS NULL OR m.profile_image_url = '')
        AND p.avatar IS NOT NULL;
        
        -- Set proper permissions for storage access
        GRANT SELECT ON storage.objects TO anon, authenticated;
        GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
      `

      const { error } = await supabase.rpc("exec_sql", { sql })

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Profile image URLs have been synced successfully!",
      })
    } catch (error: any) {
      console.error("Error fixing profile images:", error)
      setResult({
        success: false,
        message: `Error: ${error.message || "An unknown error occurred"}`,
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Fix Profile Image Sync</CardTitle>
          <CardDescription>
            This utility will sync profile images between profiles and mentors tables and fix permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">If you're having issues with profile images not displaying, this utility will:</p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Ensure the profile_image_url column exists in the mentors table</li>
            <li>Sync any missing profile images from the profiles table to the mentors table</li>
            <li>Set the correct permissions for storage objects</li>
          </ul>
          <p className="text-sm text-muted-foreground">Note: This operation is safe to run multiple times.</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button onClick={runMigration} disabled={isRunning} className="mb-4">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              "Fix Profile Images"
            )}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-md w-full ${
                result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 text-red-600" />
                )}
                <p>{result.message}</p>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
