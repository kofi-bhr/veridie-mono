"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getInitials } from "@/lib/image-utils"

export default function TestDirectImagePage() {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [testUrl, setTestUrl] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [showImage, setShowImage] = useState(false)

  const handleTest = () => {
    setTestUrl(imageUrl)
    setShowImage(true)
    setError(null)
  }

  // Sample Supabase URL for testing
  const sampleUrl =
    "https://bpisinjfdcwxnlfonykf.supabase.co/storage/v1/object/public/profiles/06c19e1d-e0ae-4ca2-a9aa-0b85fc9c7d2a/06c19e1d-e0ae-4ca2-a9aa-0b85fc9c7d2a-1746736202769.png"

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Test Direct Image Loading</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test an Image URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">Enter an image URL to test:</p>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="mb-2"
              />
              <Button onClick={() => setImageUrl(sampleUrl)} variant="outline" size="sm" className="mr-2">
                Use Sample URL
              </Button>
              <Button onClick={handleTest} disabled={!imageUrl}>
                Test Image
              </Button>
            </div>

            {showImage && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Image Test Result:</h3>
                <div className="flex items-start gap-8">
                  <div>
                    <p className="text-sm mb-2">Direct Image:</p>
                    <div className="h-40 w-40 border rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      {testUrl ? (
                        <img
                          src={testUrl || "/placeholder.svg"}
                          alt="Test"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load direct image: ${testUrl}`)
                            setError(`Failed to load image directly. This is likely due to CORS restrictions.`)
                            e.currentTarget.style.display = "none"
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              const initials = document.createElement("div")
                              initials.className = "text-2xl font-bold text-primary"
                              initials.textContent = "TS"
                              parent.appendChild(initials)
                            }
                          }}
                        />
                      ) : (
                        <span className="text-muted-foreground">No image</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm mb-2">Fallback Initials:</p>
                    <div className="h-40 w-40 border rounded-md overflow-hidden bg-primary/10 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">{getInitials("Test Sample")}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-4">
                  <h4 className="font-medium mb-2">URL Details:</h4>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs break-all">{testUrl}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
