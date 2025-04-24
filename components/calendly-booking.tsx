"use client"

import { useEffect } from "react"
import { InlineWidget } from "react-calendly"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CalendlyBookingProps {
  mentorId: string
  mentorName: string
  calendlyUsername: string
  serviceId?: string
  serviceName?: string
  className?: string
  eventTypeUri?: string
}

export function CalendlyBooking({
  mentorId,
  mentorName,
  calendlyUsername,
  serviceId,
  serviceName,
  className = "",
  eventTypeUri,
}: CalendlyBookingProps) {
  const { user } = useAuth()

  useEffect(() => {
    // Track page view for analytics
    console.log("Calendly booking widget loaded for mentor:", mentorName)
  }, [mentorName])

  // Check if Calendly username is provided
  if (!calendlyUsername) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle>Booking Not Available</CardTitle>
          <CardDescription>This consultant hasn't set up their booking calendar yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please check back later or contact them directly.</p>
        </CardContent>
      </Card>
    )
  }

  // Prefill data for Calendly
  const prefill = {
    name: user?.name || "",
    email: user?.email || "",
    customAnswers: {
      a1: `Mentor ID: ${mentorId}`,
      a2: serviceId ? `Service ID: ${serviceId}` : "",
      a3: serviceName ? `Service: ${serviceName}` : "",
    },
  }

  // URL params for Calendly
  const utm = {
    utmCampaign: "college_consulting",
    utmSource: "veridie",
    utmMedium: "website",
  }

  // Determine the URL to use
  let calendlyUrl = `https://calendly.com/${calendlyUsername}`

  // If an event type URI is provided, extract the event type path
  if (eventTypeUri) {
    const eventTypePath = eventTypeUri.split("/").pop()
    if (eventTypePath) {
      calendlyUrl = `https://calendly.com/${calendlyUsername}/${eventTypePath}`
    }
  }

  return (
    <div className={`min-h-[650px] ${className}`}>
      <InlineWidget
        url={calendlyUrl}
        prefill={prefill}
        utm={utm}
        styles={{
          height: "630px",
          width: "100%",
        }}
      />
    </div>
  )
}
