"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { MentorActivities } from "@/components/mentor-activities"
import { MentorAwards } from "@/components/mentor-awards"
import { MentorReviews } from "@/components/mentor-reviews"
import { Calendar } from "@/components/ui/calendar"
import { CheckoutButton } from "@/components/checkout-button"
import { Loader2, Award, Activity, MessageSquare } from "lucide-react"
import { getProfileImageUrl, getInitials } from "@/lib/image-utils"

export function MentorProfile({ mentor, reviews = [] }: { mentor: any; reviews?: any[] }) {
  const [activeTab, setActiveTab] = useState("activities")
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [timeSource, setTimeSource] = useState<string | null>(null)
  const [imageLoadFailed, setImageLoadFailed] = useState(false)

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

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API error (${response.status}): ${errorText}`)
        throw new Error(`Failed to fetch available times: ${response.status}`)
      }

      const data = await response.json()
      console.log("Available times response:", data)

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

  if (!mentor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Mentor data not found. Please try again later.</p>
        </div>
      </div>
    )
  }

  // Get the profile image URL
  const profileImageUrl = getProfileImageUrl(mentor.profile_image_url || mentor.avatar)

  // Get initials for the avatar
  const initials = getInitials(mentor.name)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="overflow-hidden shadow-md">
            <div className="h-24 bg-[#1C2127]"></div>
            <CardContent className="pt-0 relative">
              <div className="flex justify-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white -mt-12 shadow-md">
                  {imageLoadFailed ? (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
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
              </div>
              <div className="text-center mt-4">
                <h1 className="text-2xl font-bold">{mentor.name}</h1>
                <p className="text-lg text-muted-foreground">{mentor.title || "College Consultant"}</p>
                <p className="text-muted-foreground">{mentor.university || "University not specified"}</p>
                <div className="flex items-center justify-center mt-2">
                  <StarRating rating={mentor.rating || 0} />
                  <span className="ml-2 text-muted-foreground">
                    {mentor.review_count || 0} {mentor.review_count === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <p className="text-sm text-muted-foreground">{mentor.bio || "No bio available."}</p>
              </div>

              {mentor.specialties && mentor.specialties.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-md font-semibold mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.specialties.map((specialty: any) => (
                      <span key={specialty.id} className="bg-[#1C2127] text-white px-3 py-1 rounded-full text-xs">
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Book a Session</CardTitle>
              <CardDescription>Select a service and schedule a time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Selection */}
              <div>
                <h3 className="text-sm font-medium mb-3">Available Services</h3>
                {mentor.services && mentor.services.length > 0 ? (
                  <div className="space-y-3">
                    {mentor.services.map((service: any) => (
                      <div
                        key={service.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                          selectedService?.id === service.id
                            ? "border-[#1C2127] bg-[#1C2127]/5 shadow-sm"
                            : "hover:border-[#1C2127]/30"
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm">{service.name}</h4>
                          <span className="font-bold text-sm">${service.price.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-2 text-muted-foreground text-sm">No services available</p>
                )}
              </div>

              {/* Date Selection - Only show if a service is selected */}
              {selectedService && (
                <>
                  <div className="pt-3 border-t">
                    <h3 className="text-sm font-medium mb-2">Select a Date</h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border mx-auto"
                      disabled={(date) => {
                        // Disable past dates
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date < today
                      }}
                    />
                  </div>

                  {/* Time Selection - Only show if a date is selected */}
                  {selectedDate && (
                    <div className="pt-3 border-t">
                      <h3 className="text-sm font-medium mb-2">Select a Time</h3>
                      {isLoadingTimes ? (
                        <div className="flex items-center justify-center py-3">
                          <Loader2 className="h-4 w-4 animate-spin text-[#1C2127] mr-2" />
                          <span className="text-sm">Loading available times...</span>
                        </div>
                      ) : availableTimes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1">
                          {availableTimes.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(time)}
                              className="text-xs"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-2 text-muted-foreground text-sm">No available times on this day</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Summary and Book Button */}
              <div className="pt-3 border-t">
                <h3 className="text-sm font-medium mb-2">Booking Summary</h3>
                <div className="bg-muted p-3 rounded-md mb-3">
                  <p className="text-xs">
                    <span className="font-medium">Selected Service:</span>{" "}
                    {selectedService ? selectedService.name : "No service selected"}
                  </p>
                  <p className="text-xs mt-1">
                    <span className="font-medium">Selected Date & Time:</span>{" "}
                    {selectedDate && selectedTime
                      ? `${selectedDate.toLocaleDateString()} at ${selectedTime}`
                      : "No date and time selected"}
                  </p>
                  {selectedService && (
                    <p className="text-xs mt-1 font-bold">Total: ${selectedService.price.toFixed(2)}</p>
                  )}
                </div>

                <CheckoutButton
                  mentorId={mentor.id}
                  serviceId={selectedService?.id || ""}
                  serviceName={selectedService?.name || ""}
                  servicePrice={selectedService?.price || 0}
                  stripePriceId={selectedService?.stripe_price_id}
                  date={selectedDate ? selectedDate.toLocaleDateString() : null}
                  time={selectedTime}
                  disabled={!selectedService || !selectedDate || !selectedTime}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {/* Tabs */}
          <Tabs defaultValue="activities" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 w-full">
              <TabsTrigger value="activities" className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span>Activities</span>
              </TabsTrigger>
              <TabsTrigger value="awards" className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>Awards</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>Reviews</span>
              </TabsTrigger>
            </TabsList>

            {/* Activities Tab */}
            <TabsContent value="activities">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activities
                  </CardTitle>
                  <CardDescription>Extracurricular activities of {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorActivities activities={mentor.activities} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Awards Tab */}
            <TabsContent value="awards">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Awards
                  </CardTitle>
                  <CardDescription>Awards and achievements of {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorAwards awards={mentor.awards} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Reviews
                  </CardTitle>
                  <CardDescription>What others say about {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorReviews mentorId={mentor.id} reviews={reviews} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
