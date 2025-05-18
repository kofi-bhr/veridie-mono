import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

// Simple mock extraction for demonstration
function mockExtractFromPDF() {
  return {
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
        description: "Participated in regional and state competitions, led team practices, and mentored new members.",
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
}

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

    // For now, use mock extraction instead of actual PDF processing
    // In a production environment, you would process the PDF here
    const extractedData = mockExtractFromPDF()

    // Return the extracted data
    return NextResponse.json({
      success: true,
      data: extractedData,
    })
  } catch (error: any) {
    console.error("Error processing PDF:", error)

    // Always return a proper JSON response, even for errors
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
