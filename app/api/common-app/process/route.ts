import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import * as pdfjs from "pdfjs-dist"

// Set the worker source for pdf.js
const pdfjsWorker = require("pdfjs-dist/build/pdf.worker.entry")
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get the form data with the PDF file
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file || !file.name.endsWith(".pdf")) {
      return NextResponse.json({ success: false, error: "Invalid file. Please upload a PDF." }, { status: 400 })
    }

    // Convert the file to an ArrayBuffer for processing
    const arrayBuffer = await file.arrayBuffer()

    // Process the PDF and extract real data
    const extractedData = await extractDataFromPDF(arrayBuffer)

    return NextResponse.json({
      success: true,
      data: extractedData,
    })
  } catch (error: any) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process PDF",
      },
      {
        status: 500,
      },
    )
  }
}

async function extractDataFromPDF(arrayBuffer: ArrayBuffer) {
  try {
    // Load the PDF document
    const pdfData = new Uint8Array(arrayBuffer)
    const loadingTask = pdfjs.getDocument({ data: pdfData })
    const pdfDocument = await loadingTask.promise

    // Initialize containers for extracted data
    const activities: any[] = []
    const awards: any[] = []

    // Extract text from each page
    const numPages = pdfDocument.numPages
    let fullText = ""

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")

      fullText += pageText + "\n"
    }

    // Extract activities section
    const activitiesMatch = fullText.match(/ACTIVITIES[\s\S]*?(?=HONORS|$)/i)
    if (activitiesMatch) {
      const activitiesText = activitiesMatch[0]

      // Look for numbered activities (1., 2., etc.)
      const activityMatches = activitiesText.matchAll(/(\d+)\.\s+([\s\S]*?)(?=\d+\.|$)/g)

      for (const match of activityMatches) {
        const activityText = match[2].trim()

        // Extract activity details using regex patterns
        const titleMatch = activityText.match(/^([^:]+?)(?::|$)/m)
        const roleMatch = activityText.match(/Position\/Leadership[^:]*:\s*([^:]+?)(?:Organization|$)/i)
        const orgMatch = activityText.match(/Organization[^:]*:\s*([^:]+?)(?:Description|$)/i)
        const descMatch = activityText.match(/Description[^:]*:\s*([^:]+?)(?:Participation|$)/i)
        const timeMatch = activityText.match(/(\d+)\s*hrs\/wk[^:]*?(\d+)\s*wks\/yr/i)
        const yearsMatch = activityText.match(/Grade[s]?[^:]*:\s*([^:]+?)(?:\n|$)/i)

        activities.push({
          title: titleMatch ? titleMatch[1].trim() : "Unknown Activity",
          role: roleMatch ? roleMatch[1].trim() : "",
          organization: orgMatch ? orgMatch[1].trim() : "",
          description: descMatch ? descMatch[1].trim() : "",
          timeCommitment: timeMatch ? `${timeMatch[1]} hrs/week, ${timeMatch[2]} wks/year` : "",
          years: yearsMatch ? yearsMatch[1].trim() : "",
        })
      }
    }

    // Extract awards section
    const awardsMatch = fullText.match(/HONORS[\s\S]*?(?=EDUCATION|$)/i)
    if (awardsMatch) {
      const awardsText = awardsMatch[0]

      // Look for numbered awards (1., 2., etc.)
      const awardMatches = awardsText.matchAll(/(\d+)\.\s+([\s\S]*?)(?=\d+\.|$)/g)

      for (const match of awardMatches) {
        const awardText = match[2].trim()

        // Extract award details using regex patterns
        const titleMatch = awardText.match(/^([^:]+?)(?::|$)/m)
        const orgMatch = awardText.match(/Awarding Organization[^:]*:\s*([^:]+?)(?:Grade|$)/i)
        const levelMatch = awardText.match(/Level[^:]*:\s*([^:]+?)(?:\n|$)/i)
        const gradeMatch = awardText.match(/Grade[^:]*:\s*([^:]+?)(?:\n|$)/i)

        awards.push({
          title: titleMatch ? titleMatch[1].trim() : "Unknown Award",
          awarding_organization: orgMatch ? orgMatch[1].trim() : "",
          level: levelMatch ? levelMatch[1].trim() : "",
          year: gradeMatch ? gradeMatch[1].trim() : "",
        })
      }
    }

    // If no activities or awards were found, try a different approach
    if (activities.length === 0) {
      // Look for activity-like patterns in the text
      const potentialActivities = fullText.match(
        /(?:Club|Team|Organization|Volunteer|Leadership|Work|Internship|Research)[\s\S]*?(?=\n\n)/gi,
      )
      if (potentialActivities) {
        for (let i = 0; i < Math.min(potentialActivities.length, 5); i++) {
          const text = potentialActivities[i].trim()
          const lines = text.split("\n").filter((line) => line.trim().length > 0)

          activities.push({
            title: lines[0] || "Activity " + (i + 1),
            role: lines.length > 1 ? lines[1] : "",
            organization: lines.length > 2 ? lines[2] : "",
            description: lines.length > 3 ? lines.slice(3).join(" ") : "",
            timeCommitment: "",
            years: "",
          })
        }
      }
    }

    if (awards.length === 0) {
      // Look for award-like patterns in the text
      const potentialAwards = fullText.match(
        /(?:Award|Honor|Scholar|Recognition|Prize|Medal|Certificate)[\s\S]*?(?=\n\n)/gi,
      )
      if (potentialAwards) {
        for (let i = 0; i < Math.min(potentialAwards.length, 5); i++) {
          const text = potentialAwards[i].trim()
          const lines = text.split("\n").filter((line) => line.trim().length > 0)

          awards.push({
            title: lines[0] || "Award " + (i + 1),
            awarding_organization: lines.length > 1 ? lines[1] : "",
            level: "",
            year: lines.length > 2 ? lines[2] : "",
          })
        }
      }
    }

    return {
      activities,
      awards,
      // Include a portion of the raw text for debugging
      debug: {
        textSample: fullText.substring(0, 500) + "...",
      },
    }
  } catch (error) {
    console.error("PDF extraction error:", error)
    throw new Error("Failed to extract data from PDF: " + (error as Error).message)
  }
}
