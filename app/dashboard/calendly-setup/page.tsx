"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export default function CalendlySetupPage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [eventTypes, setEventTypes] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user && profile?.id) {
      fetchData(profile.id)
    }
  }, [user, profile])

  const fetchData = async (mentorId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Fetch mentor's Calendly token
      const { data: mentor, error: mentorError } = await supabase
        .from("mentors")
        .select("calendly_access_token")
        .eq("id", mentorId)
        .single()

      if (mentorError || !mentor?.calendly_access_token) {
        setError("Calendly is not connected. Please connect your Calendly account first.")
        setLoading(false)
        return
      }

      // Fetch event types from Calendly
      const eventTypesResponse = await fetch("/api/calendly/event-types", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!eventTypesResponse.ok) {
        throw new Error("Failed to fetch Calendly event types")
      }

      const eventTypesData = await eventTypesResponse.json()
      setEventTypes(eventTypesData.eventTypes || [])

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("mentor_id", mentorId)

      if (servicesError) {
        throw new Error("Failed to fetch services")
      }

      setServices(servicesData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const assignEventType = async (serviceId: string, eventTypeUri: string) => {
    if (!profile?.id) return

    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from("services")
        .update({ calendly_event_uri: eventTypeUri })
        .eq("id", serviceId)
        .eq("mentor_id", profile.id)

      if (error) {
        throw new Error("Failed to update service")
      }

      // Update local state
      setServices(
        services.map((service) =>
          service.id === serviceId ? { ...service, calendly_event_uri: eventTypeUri } : service,
        ),
      )

      setSuccess(`Successfully assigned event type to service`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Calendly Event Types Setup</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
              <Check className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}

          <p className="mb-4">Assign your Calendly event types to your services to enable scheduling.</p>

          {eventTypes.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              No Calendly event types found. Please create event types in your Calendly account.
            </div>
          ) : (
            <div className="space-y-6">
              {services.map((service) => (
                <div key={service.id} className="border rounded-md p-4">
                  <h3 className="font-medium text-lg mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {service.calendly_event_uri ? (
                      <span className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        Event type assigned
                      </span>
                    ) : (
                      "No event type assigned"
                    )}
                  </p>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Select an event type:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {eventTypes.map((eventType) => (
                        <Button
                          key={eventType.uri}
                          variant={service.calendly_event_uri === eventType.uri ? "default" : "outline"}
                          size="sm"
                          className="justify-start"
                          disabled={updating}
                          onClick={() => assignEventType(service.id, eventType.uri)}
                        >
                          {service.calendly_event_uri === eventType.uri && <Check className="h-4 w-4 mr-2" />}
                          {eventType.name} ({eventType.duration} min)
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">If you're having trouble with Calendly integration, try these steps:</p>

          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Make sure your Calendly account is connected</li>
            <li>Ensure you have active event types in your Calendly account</li>
            <li>Assign event types to your services using the interface above</li>
            <li>Check that your Calendly availability is set up correctly</li>
          </ol>

          <Button onClick={() => fetchData(profile?.id || "")} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Refresh Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
