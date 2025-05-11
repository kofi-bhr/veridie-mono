"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { MentorActivities } from "@/components/mentor-activities"
import { MentorAwards } from "@/components/mentor-awards"
import { MentorReviews } from "@/components/mentor-reviews"
import { Calendar } from "@/components/ui/calendar"
import { supabase } from "@/lib/supabase-client"
import { Loader2, CalendarDays, GraduationCap, Award, MessageSquare, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getProfileImageUrl, getInitials } from "@/lib/image-utils"
import { CheckoutButton } from "@/components/checkout-button"

export default function MentorPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [mentor, setMentor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [timeSource, setTimeSource] = useState<string | null>(null)
  const [imageLoadFailed, setImageLoadFailed] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

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

        // Fetch profile data to get the name
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name, avatar")
          .eq("id", id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
        }

        // Fetch related data separately to avoid relationship issues
        const { data: services } = await supabase.from("services").select("*").eq("mentor_id", id)
        const { data: essays } = await supabase.from("essays").select("*").eq("mentor_id", id)
        const { data: activities } = await supabase.from("activities").select("*").eq("mentor_id", id)
        const { data: awards } = await supabase.from("awards").select("*").eq("mentor_id", id)

        // Combine all data
        const completeData = {
          ...mentorData,
          name: profileData?.name || "Consultant",
          profile_image_url: mentorData.profile_image_url || profileData?.avatar || null,
          services: services || [],
          essays: essays || [],
          activities: activities || [],
          awards: awards || [],
        }

        // Log image sources for debugging
        console.log("Mentor profile image sources:", {
          id: completeData.id,
          name: completeData.name,
          profile_image_url: mentorData.profile_image_url,
          avatar: profileData?.avatar,
        })

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

  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime(null)
    if (selectedDate && selectedService) {
      fetchAvailableTimes(selectedDate, selectedService.id)
    }
  }, [selectedDate, selectedService])

  // Function to fetch available times from Calendly API
  const fetchAvailableTimes = async (date: Date, serviceId: string) => {
    setIsLoadingTimes(true)
    setDebugInfo(null)
    try {
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split("T")[0]
      console.log("Fetching available times for:", { mentorId: mentor.id, date: formattedDate, serviceId })

      // Call our backend API that interfaces with Calendly
      const response = await fetch("/api/calendly/available-times", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorId: mentor.id,
          date: formattedDate,
          serviceId: serviceId,
        }),
      })

      // Get the response as text first for debugging
      const responseText = await response.text()
      console.log(`API response (${response.status}):`, responseText)

      // Try to parse the response as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Error parsing API response:", e)
        throw new Error(`Invalid API response: ${responseText.substring(0, 100)}...`)
      }

      // Handle error responses
      if (!response.ok) {
        console.error(`API error (${response.status}):`, data)

        // Handle specific error cases
        if (response.status === 401 && data.needsReconnect) {
          toast({
            title: "Calendly Authentication Error",
            description: "The consultant needs to reconnect their Calendly account.",
            variant: "destructive",
          })
        } else if (data.missingEventUri) {
          toast({
            title: "Calendly Configuration Error",
            description: "This service is not properly configured with Calendly.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error Loading Times",
            description: data.error || `Failed to fetch available times: ${response.status}`,
            variant: "destructive",
          })
        }

        throw new Error(data.error || `Failed to fetch available times: ${response.status}`)
      }

      console.log("Available times response:", data)
      setDebugInfo(data.debug || null)

      // Store the time source for internal tracking but don't display it
      setTimeSource(data.source || "unknown")

      setAvailableTimes(data.times || [])
    } catch (error) {
      console.error("Error fetching available times:", error)
      setAvailableTimes([])
      setTimeSource("error")
    } finally {
      setIsLoadingTimes(false)
    }
  }

  const handleLoginPrompt = () => {
    toast({
      title: "Please log in",
      description: "You need to be logged in to book a session",
      variant: "destructive",
    })
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 font-medium">Loading consultant profile...</span>
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Error</h2>
          <p className="text-red-700 mb-6">{error || "Consultant not found"}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  // Get the profile image URL
  const profileImageUrl = getProfileImageUrl(mentor.profile_image_url)

  // Get initials for fallback
  const initials = getInitials(mentor.name)

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Mentor info and booking */}
        <div className="md:col-span-1 space-y-8">
          {/* Profile Card */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="h-32 bg-[#1C2127]"></div>
            <CardContent className="pt-0 relative pb-6">
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 -mt-12 rounded-full overflow-hidden border-4 border-white shadow-md bg-primary/10">
                  {imageLoadFailed ? (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">
                      {initials}
                    </div>
                  ) : (
                    <img
                      src={profileImageUrl || "/placeholder.svg"}
                      alt={mentor.name}
                      className="w-full h-full object-cover scale-110 transform" // Added scale-110 to zoom in
                      onError={(e) => {
                        console.error(`Failed to load mentor profile image: ${profileImageUrl}`)
                        setImageLoadFailed(true)
                      }}
                    />
                  )}
                </div>
                <h1 className="text-2xl font-bold mt-4 text-center">{mentor.name}</h1>
                <p className="text-muted-foreground font-medium">{mentor.title || "College Consultant"}</p>
                <div className="flex items-center mt-1 mb-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground mr-1" />
                  <p className="text-muted-foreground">{mentor.university || "University not specified"}</p>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  <StarRating rating={mentor.rating || 0} />
                  <span className="text-sm text-muted-foreground">
                    ({mentor.review_count || 0} {mentor.review_count === 1 ? "review" : "reviews"})
                  </span>
                </div>

                {mentor.specialties && mentor.specialties.length > 0 && (
                  <div className="w-full">
                    <Separator className="my-4" />
                    <h3 className="font-medium text-sm mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.specialties.map((specialty: any) => (
                        <Badge key={specialty.id} variant="secondary" className="font-normal">
                          {specialty.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-4" />
                <div className="w-full">
                  <h3 className="font-medium text-sm mb-2">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{mentor.bio || "No bio available."}</p>
                </div>

                {mentor.languages && mentor.languages.length > 0 && (
                  <div className="w-full mt-4">
                    <h3 className="font-medium text-sm mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.languages.map((lang: string) => (
                        <Badge key={lang} variant="outline" className="font-normal">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Book a Session Card */}
          <Card className="border-0 shadow-md" id="booking-section">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                Book a Session
              </CardTitle>
              <CardDescription>Select a service and schedule a time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Selection */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  Available Services
                </h3>
                <div className="space-y-3">
                  {mentor.services && mentor.services.length > 0 ? (
                    mentor.services.map((service: any) => (
                      <div
                        key={service.id}
                        className={`rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedService?.id === service.id
                            ? "bg-[#1C2127] border-2 border-gray-600 text-white shadow-sm"
                            : "bg-white border border-gray-200 text-gray-800 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex justify-between items-start">
                          <h4
                            className={`font-medium ${selectedService?.id === service.id ? "text-white" : "text-gray-800"}`}
                          >
                            {service.name}
                          </h4>
                          <span
                            className={`font-bold ${selectedService?.id === service.id ? "text-white" : "text-gray-800"}`}
                          >
                            ${service.price}
                          </span>
                        </div>
                        <p
                          className={`text-sm mt-1 ${selectedService?.id === service.id ? "text-white/90" : "text-gray-600"}`}
                        >
                          {service.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">No services available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Time Selection - Only show if a service is selected */}
              {selectedService && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-3">Select a Date</h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate || undefined}
                      onSelect={(date) => setSelectedDate(date)}
                      className="rounded-md border mx-auto"
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date < today
                      }}
                    />
                  </div>

                  {/* Time Selection - Only show if a date is selected */}
                  {selectedDate && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium mb-3">Select a Time</h3>
                        {isLoadingTimes ? (
                          <div className="flex items-center justify-center py-6 bg-muted/30 rounded-lg">
                            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                            <span>Loading available times...</span>
                          </div>
                        ) : availableTimes.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {availableTimes.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTime(time)}
                                className="text-sm"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-muted/30 rounded-lg">
                            <p className="text-muted-foreground">No available times on this day</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Booking Summary - Only show if a service is selected */}
              {selectedService && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-3">Booking Summary</h3>
                    <div className="bg-muted/30 p-4 rounded-lg mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Service:</span>
                        <span className="text-sm">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Date:</span>
                        <span className="text-sm">
                          {selectedDate ? selectedDate.toLocaleDateString() : "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Time:</span>
                        <span className="text-sm">{selectedTime || "Not selected"}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${selectedService.price}</span>
                      </div>
                    </div>

                    {user ? (
                      <CheckoutButton
                        mentorId={mentor.id}
                        serviceId={selectedService.id}
                        serviceName={selectedService.name}
                        servicePrice={selectedService.price}
                        stripePriceId={selectedService.stripe_price_id}
                        date={selectedDate ? selectedDate.toISOString().split("T")[0] : null}
                        time={selectedTime}
                        disabled={!selectedService || !selectedDate || !selectedTime || isBooking}
                      />
                    ) : (
                      <Button onClick={handleLoginPrompt} className="w-full" size="lg">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Log in to Book
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="activities" className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                <span>Activities</span>
              </TabsTrigger>
              <TabsTrigger value="awards" className="flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                <span>Awards</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                <span>Reviews</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activities">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Activities</CardTitle>
                  <CardDescription>Extracurricular activities of {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorActivities activities={mentor.activities} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="awards">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Awards</CardTitle>
                  <CardDescription>Awards and achievements of {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorAwards awards={mentor.awards} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Reviews</CardTitle>
                  <CardDescription>What others say about {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorReviews mentorId={mentor.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
