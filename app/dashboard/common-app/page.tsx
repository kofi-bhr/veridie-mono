"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, FileText, Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface Activity {
  title: string
  role: string
  organization: string
  description: string
  timeCommitment: string
  years: string
}

interface Award {
  title: string
  awarding_organization: string
  level: string
  year: string
}

interface ExtractedData {
  activities: Activity[]
  awards: Award[]
  debug?: {
    textSample: string
  }
}

export default function CommonAppPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [debugText, setDebugText] = useState<string | null>(null)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setDebugText(null)

    if (!selectedFile) {
      return
    }

    // Check if file is a PDF
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    setFile(selectedFile)
  }

  // Process the Common App PDF
  const processCommonApp = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setIsUploading(true)
    setError(null)
    setDebugText(null)
    setUploadProgress(0)

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append("file", file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Send the file to our API
      const response = await fetch("/api/common-app/process", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      // If the response is not OK, throw an error
      if (!response.ok) {
        // Try to get error details from the response
        let errorMessage = "Failed to process PDF"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Parse the response as JSON
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to extract data from PDF")
      }

      // Set the extracted data
      setExtractedData(result.data)

      // Store debug text if available
      if (result.data.debug?.textSample) {
        setDebugText(result.data.debug.textSample)
      }

      // If no activities or awards were found, show a warning
      if (result.data.activities.length === 0 && result.data.awards.length === 0) {
        toast({
          title: "No data found",
          description:
            "We couldn't find any activities or awards in your PDF. Please check if you uploaded the correct file.",
          variant: "destructive",
        })
      } else {
        setActiveTab("review")
        toast({
          title: "PDF Processed Successfully",
          description: `Extracted ${result.data.activities.length} activities and ${result.data.awards.length} awards.`,
        })
      }
    } catch (err: any) {
      console.error("Error processing file:", err)
      setError(err.message || "An error occurred while processing your file. Please try again.")
      toast({
        title: "Processing Failed",
        description: err.message || "Failed to process your PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Apply extracted data to profile
  const applyToProfile = async () => {
    if (!extractedData || !user) return

    setIsProcessing(true)

    try {
      // Send the extracted data to update the profile
      const response = await fetch("/api/common-app/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activities: extractedData.activities,
          awards: extractedData.awards,
        }),
      })

      if (!response.ok) {
        // Try to get error details from the response
        let errorMessage = "Failed to update profile"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated with data from your Common Application.",
      })

      // Redirect to profile page
      router.push("/dashboard/profile")
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "An error occurred while updating your profile. Please try again.")
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Common Application Import</h1>
        <p className="text-muted-foreground">
          Upload your Common Application PDF to automatically import your activities, awards, and other information to
          your profile.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="review" disabled={!extractedData}>
            Review & Apply
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Common App PDF</CardTitle>
              <CardDescription>
                We'll extract your activities, awards, and other information from your Common Application PDF.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="pdf">Common Application PDF</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="pdf"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={isUploading || isProcessing}
                      className="flex-1"
                    />
                  </div>
                  {file && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Selected: {file.name}
                    </p>
                  )}
                  {error && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  )}

                  {isUploading && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uploading and processing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2.5" />
                    </div>
                  )}

                  {debugText && (
                    <div className="mt-4 p-3 bg-slate-100 rounded-md">
                      <p className="text-xs font-mono text-slate-700 overflow-auto max-h-32">
                        <strong>Extracted text sample:</strong>
                        <br />
                        {debugText}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={processCommonApp} disabled={!file || isUploading || isProcessing}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isUploading && !isProcessing && <Upload className="mr-2 h-4 w-4" />}
                {isUploading ? "Processing..." : isProcessing ? "Processing..." : "Process Common App"}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">How it works</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">1. Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Upload your Common Application PDF file. This is the same PDF you submitted to colleges.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">2. Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our system will extract your activities, awards, and other information from the PDF.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">3. Review & Apply</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Review the extracted information and apply it to your profile with one click.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="review">
          {extractedData && (
            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Review Extracted Information</CardTitle>
                  <CardDescription>
                    Review the information extracted from your Common Application PDF before applying it to your
                    profile.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Activities ({extractedData.activities.length})</h3>
                      {extractedData.activities.length > 0 ? (
                        <div className="grid gap-4">
                          {extractedData.activities.map((activity, index) => (
                            <Card key={index}>
                              <CardContent className="pt-6">
                                <div className="grid gap-2">
                                  <div className="flex justify-between">
                                    <h4 className="font-semibold">{activity.title}</h4>
                                    <span className="text-sm text-muted-foreground">Grades: {activity.years}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {activity.role} • {activity.organization}
                                  </p>
                                  <p className="text-sm">{activity.description}</p>
                                  <p className="text-sm text-muted-foreground">{activity.timeCommitment}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          No activities were found in your Common Application PDF.
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Awards ({extractedData.awards.length})</h3>
                      {extractedData.awards.length > 0 ? (
                        <div className="grid gap-4">
                          {extractedData.awards.map((award, index) => (
                            <Card key={index}>
                              <CardContent className="pt-6">
                                <div className="grid gap-2">
                                  <div className="flex justify-between">
                                    <h4 className="font-semibold">{award.title}</h4>
                                    <span className="text-sm text-muted-foreground">Grade: {award.year}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{award.awarding_organization}</p>
                                  <p className="text-sm">Level: {award.level}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No awards were found in your Common Application PDF.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    Back to Upload
                  </Button>
                  <Button onClick={applyToProfile} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Apply to Profile
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
