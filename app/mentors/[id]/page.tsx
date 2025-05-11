"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { MentorEssays } from "@/components/mentor-essays"
import { MentorActivities } from "@/components/mentor-activities"
import { MentorAwards } from "@/components/mentor-awards"
import { MentorServices } from "@/components/mentor-services"
import { MentorReviews } from "@/components/mentor-reviews"
import { MentorAvailability } from "@/components/mentor-availability"
import { CalendlyBooking } from "@/components/calendly-booking"
import { CheckoutButton } from "@/components/checkout-button"
import { supabase } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

export default function MentorPage() {
  const { id } = useParams()
  const [mentor, setMentor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMentor() {
      try {
        setLoading(true)
        setError(null)

        // Fetch mentor directly by ID
        const { data: mentorData, error: mentorError } = await supabase
          .from("mentors")
          .select("*")
          .eq("id", id)
          .single()

        if (mentorError) {
          console.error("Error fetching mentor:", mentorError)
          setError("Mentor not found. Please check the URL and try again.")
          return
        }

        // Fetch related data separately to avoid relationship issues
        const { data: services } = await supabase.from("services").select("*").eq("mentor_id", id)

        const { data: essays } = await supabase.from("essays").select("*").eq("mentor_id", id)

        const { data: activities } = await supabase.from("activities").select("*").eq("mentor_id", id)

        const { data: awards } = await supabase.from("awards").select("*").eq("mentor_id", id)

        // Combine all data
        const completeData = {
          ...mentorData,
          services: services || [],
          essays: essays || [],
          activities: activities || [],
          awards: awards || [],
        }

        setMentor(completeData)
      } catch (err) {
        console.error("Error in fetchMentor:", err)
        setError("An unexpected error occurred. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMentor()
    }
  }, [id])

  const handleServiceSelect = (service: any) => {
    setSelectedService(service)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading mentor profile...</span>
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Error</h2>
          <p className="text-red-700 mb-6">{error || "Mentor not found"}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Mentor info */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 mb-4"></div>
                <CardTitle className="text-2xl">{mentor.name}</CardTitle>
                <p className="text-muted-foreground">{mentor.title}</p>
                <p className="text-muted-foreground">{mentor.university}</p>
                <div className="mt-2 flex items-center">
                  <StarRating rating={mentor.rating || 0} />
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({mentor.review_count || 0} {mentor.review_count === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">About</h3>
                  <p className="text-sm">{mentor.bio || "No bio available."}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Languages</h3>
                  <div className="flex flex-wrap gap-1">
                    {mentor.languages && mentor.languages.length > 0 ? (
                      mentor.languages.map((lang: string) => (
                        <span key={lang} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {lang}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No languages specified</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="services">
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="essays">Essays</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="awards">Awards</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>Services offered by {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorServices
                    services={mentor.services}
                    onSelectService={handleServiceSelect}
                    selectedService={selectedService}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="essays">
              <Card>
                <CardHeader>
                  <CardTitle>Essays</CardTitle>
                  <CardDescription>College essays written by {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorEssays essays={mentor.essays} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <CardTitle>Activities</CardTitle>
                  <CardDescription>Extracurricular activities of {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorActivities activities={mentor.activities} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="awards">
              <Card>
                <CardHeader>
                  <CardTitle>Awards</CardTitle>
                  <CardDescription>Awards and achievements of {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorAwards awards={mentor.awards} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>Book a session with {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {mentor.calendly_username ? (
                    <CalendlyBooking
                      username={mentor.calendly_username}
                      eventTypeUri={mentor.calendly_event_type_uri}
                      onDateSelect={handleDateSelect}
                      onTimeSelect={handleTimeSelect}
                    />
                  ) : (
                    <MentorAvailability
                      onDateSelect={handleDateSelect}
                      onTimeSelect={handleTimeSelect}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                  <CardDescription>What others say about {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorReviews mentorId={mentor.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Booking section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
              <CardDescription>Select a service, date, and time to book a session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Selected Service</h3>
                  {selectedService ? (
                    <div className="bg-primary/10 p-3 rounded-md">
                      <div className="font-medium">{selectedService.name}</div>
                      <div className="text-sm text-muted-foreground">${selectedService.price}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No service selected</div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Selected Date & Time</h3>
                  {selectedDate && selectedTime ? (
                    <div className="bg-primary/10 p-3 rounded-md">
                      <div className="font-medium">{selectedDate}</div>
                      <div className="text-sm text-muted-foreground">{selectedTime}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No date and time selected</div>
                  )}
                </div>

                <CheckoutButton
                  mentorId={mentor.id}
                  serviceId={selectedService?.id || ""}
                  serviceName={selectedService?.name || ""}
                  servicePrice={selectedService?.price || 0}
                  stripePriceId={selectedService?.stripe_price_id}
                  date={selectedDate}
                  time={selectedTime}
                  disabled={!selectedService || !selectedDate || !selectedTime}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
