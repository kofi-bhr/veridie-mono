interface PDFPage {
  content: { str: string; x: number; y: number; width: number; height: number }[]
  pageInfo: {
    num: number
    scale: number
    rotation: number
    offsetX: number
    offsetY: number
    width: number
    height: number
  }
}

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

// Helper function to find sections in the PDF
function findSection(text: string, sectionName: string): { start: number; end: number } | null {
  const sectionRegex = new RegExp(`${sectionName}[\\s\\n]+(.*?)(?=\\n\\s*[A-Z][A-Z\\s]+:|$)`, "s")
  const match = text.match(sectionRegex)

  if (!match) return null

  return {
    start: match.index || 0,
    end: (match.index || 0) + match[0].length,
  }
}

// Extract activities from the Common App PDF
export function extractActivities(text: string, pages: PDFPage[]): Activity[] {
  const activities: Activity[] = []

  // Find the activities section
  const activitiesSection = findSection(text, "ACTIVITIES")
  if (!activitiesSection) return activities

  // Extract the activities section text
  const activitiesText = text.substring(activitiesSection.start, activitiesSection.end)

  // Common App typically lists activities with numbers (1., 2., etc.)
  const activityRegex = /(\d+)\.\s+(.*?)(?=\d+\.|$)/gs
  let match

  while ((match = activityRegex.exec(activitiesText)) !== null) {
    const activityText = match[2].trim()

    // Parse the activity details
    // This is a simplified version - real implementation would be more robust
    const titleMatch = activityText.match(/^(.*?)(?:\n|\s{2,})/i)
    const roleMatch = activityText.match(/Position\/Leadership[^\n]*:\s*(.*?)(?:\n|\s{2,}|$)/i)
    const orgMatch = activityText.match(/Organization[^\n]*:\s*(.*?)(?:\n|\s{2,}|$)/i)
    const descMatch = activityText.match(/Description[^\n]*:\s*(.*?)(?:\n|\s{2,}|$)/i)
    const timeMatch = activityText.match(/(\d+)\s*hrs\/wk,\s*(\d+)\s*wks\/yr/i)
    const yearsMatch = activityText.match(/Grades:\s*(.*?)(?:\n|\s{2,}|$)/i)

    activities.push({
      title: titleMatch ? titleMatch[1].trim() : "Unknown Activity",
      role: roleMatch ? roleMatch[1].trim() : "",
      organization: orgMatch ? orgMatch[1].trim() : "",
      description: descMatch ? descMatch[1].trim() : "",
      timeCommitment: timeMatch ? `${timeMatch[1]} hrs/wk, ${timeMatch[2]} wks/yr` : "",
      years: yearsMatch ? yearsMatch[1].trim() : "",
    })
  }

  return activities
}

// Extract awards from the Common App PDF
export function extractAwards(text: string, pages: PDFPage[]): Award[] {
  const awards: Award[] = []

  // Find the honors section
  const honorsSection = findSection(text, "HONORS")
  if (!honorsSection) return awards

  // Extract the honors section text
  const honorsText = text.substring(honorsSection.start, honorsSection.end)

  // Common App typically lists honors with numbers (1., 2., etc.)
  const awardRegex = /(\d+)\.\s+(.*?)(?=\d+\.|$)/gs
  let match

  while ((match = awardRegex.exec(honorsText)) !== null) {
    const awardText = match[2].trim()

    // Parse the award details
    const titleMatch = awardText.match(/^(.*?)(?:\n|\s{2,})/i)
    const orgMatch = awardText.match(/Awarding Organization[^\n]*:\s*(.*?)(?:\n|\s{2,}|$)/i)
    const levelMatch = awardText.match(/Level[^\n]*:\s*(.*?)(?:\n|\s{2,}|$)/i)
    const gradeMatch = awardText.match(/Grade[^\n]*:\s*(.*?)(?:\n|\s{2,}|$)/i)

    awards.push({
      title: titleMatch ? titleMatch[1].trim() : "Unknown Award",
      awarding_organization: orgMatch ? orgMatch[1].trim() : "",
      level: levelMatch ? levelMatch[1].trim() : "",
      year: gradeMatch ? gradeMatch[1].trim() : "",
    })
  }

  return awards
}

// Function to clean and normalize extracted text
export function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").replace(/\n+/g, "\n").trim()
}
