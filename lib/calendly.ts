// Types for Calendly
export interface CalendlyEventData {
  event: string
  payload: {
    event_type: {
      uuid: string
      kind: string
      slug: string
      name: string
      duration: number
    }
    invitee: {
      uuid: string
      first_name: string
      last_name: string
      email: string
      text_reminder_number: string
      timezone: string
      created_at: string
      is_reschedule: boolean
      payments: any[]
      canceled: boolean
      cancellation: any
    }
    event: {
      uuid: string
      start_time: string
      end_time: string
      location: {
        type: string
        location?: string
      }
    }
    scheduled_event: {
      uuid: string
      start_time: string
      end_time: string
      location: {
        type: string
        location?: string
      }
    }
    questions_and_answers: Array<{
      question: string
      answer: string
    }>
    tracking: {
      utm_campaign: string
      utm_source: string
      utm_medium: string
      utm_content: string
      utm_term: string
      salesforce_uuid: string
    }
    old_event?: {
      uuid: string
      start_time: string
      end_time: string
      location: {
        type: string
        location?: string
      }
    }
    old_scheduled_event?: {
      uuid: string
      start_time: string
      end_time: string
      location: {
        type: string
        location?: string
      }
    }
    cancel_url: string
    reschedule_url: string
  }
}

// Function to extract mentor ID from Calendly event
export function extractMentorIdFromCalendlyEvent(event: CalendlyEventData): string | null {
  // Look for mentor ID in questions and answers
  const mentorQuestion = event.payload.questions_and_answers.find(
    (qa) => qa.question.toLowerCase().includes("mentor") || qa.question.toLowerCase().includes("consultant"),
  )

  if (mentorQuestion) {
    // Try to extract ID from answer
    const match = mentorQuestion.answer.match(/Mentor ID: ([a-zA-Z0-9-]+)/)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

// Function to extract client info from Calendly event
export function extractClientInfoFromCalendlyEvent(event: CalendlyEventData) {
  const { invitee } = event.payload

  return {
    name: `${invitee.first_name} ${invitee.last_name}`,
    email: invitee.email,
    phone: invitee.text_reminder_number || null,
  }
}

// Function to extract booking details from Calendly event
export function extractBookingDetailsFromCalendlyEvent(event: CalendlyEventData) {
  const { scheduled_event, event_type } = event.payload

  const startTime = new Date(scheduled_event.start_time)
  const endTime = new Date(scheduled_event.end_time)

  return {
    date: startTime.toISOString().split("T")[0],
    startTime: startTime.toTimeString().split(" ")[0].substring(0, 5),
    endTime: endTime.toTimeString().split(" ")[0].substring(0, 5),
    duration: event_type.duration,
    serviceName: event_type.name,
  }
}
