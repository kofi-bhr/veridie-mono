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

export default function CommonAppPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("upload")

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)

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

    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsUploading(false)
      setIsProcessing(true)

      // Simulate PDF processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock extracted data
      const mockData = {
        activities: [
          {
            title: "Student Government",
            role: "Class President",
            organization: "Lincoln High School",
            description:
              "Led student council meetings, organized school events, and represented student interests to administration.",
            timeCommitment: "4 hrs/week, 36 weeks/yr",
            years: "10, 11, 12",
          },
          {
            title: "Debate Team",
            role: "Team Captain",
            organization: "Lincoln High School",
            description:
              "Participated in regional and state competitions, led team practices, and mentored new members.",
            timeCommitment: "6 hrs/week, 30 weeks/yr",
            years: "9, 10, 11, 12",
          },
          {
            title: "Community Service",
            role: "Volunteer",
            organization: "Local Food Bank",
            description: "Sorted donations, packed food boxes, and assisted with distribution to families in need.",
            timeCommitment: "3 hrs/week, 40 weeks/yr",
            years: "11, 12",
          },
        ],
        awards: [
          {
            title: "National Merit Finalist",
            awarding_organization: "National Merit Scholarship Corporation",
            level: "National",
            year: "12",
          },
          {
            title: "AP Scholar with Distinction",
            awarding_organization: "College Board",
            level: "National",
            year: "11",
          },
          {
            title: "First Place, Regional Science Fair",
            awarding_organization: "State Science Association",
            level: "Regional",
            year: "10",
          },
        ],
      }

      setExtractedData(mockData)
      setIsProcessing(false)
      setActiveTab("review")
    } catch (err) {
      console.error("Error processing file:", err)
      setError("An error occurred while processing your file. Please try again.")
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  // Apply extracted data to profile
  const applyToProfile = async () => {
    if (!extractedData || !user) return

    setIsProcessing(true)

    try {
      // Simulate updating profile
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Here you would actually update the database
      // For activities
      for (const activity of extractedData.activities) {
        // This is a mock - in a real app you'd insert into your database
        console.log("Adding activity:", activity)
      }

      // For awards
      for (const award of extractedData.awards) {
        // This is a mock - in a real app you'd insert into your database
        console.log("Adding award:", award)
      }

      setIsProcessing(false)

      // Redirect to profile page
      router.push("/dashboard/profile")
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("An error occurred while updating your profile. Please try again.")
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
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={processCommonApp} disabled={!file || isUploading || isProcessing}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isUploading && !isProcessing && <Upload className="mr-2 h-4 w-4" />}
                {isUploading ? "Uploading..." : isProcessing ? "Processing..." : "Process Common App"}
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
                      <div className="grid gap-4">
                        {extractedData.activities.map((activity: any, index: number) => (
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
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Awards ({extractedData.awards.length})</h3>
                      <div className="grid gap-4">
                        {extractedData.awards.map((award: any, index: number) => (
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
