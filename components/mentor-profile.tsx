"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { MentorEssays } from "@/components/mentor-essays"
import { MentorActivities } from "@/components/mentor-activities"
import { MentorAwards } from "@/components/mentor-awards"
import { MentorReviews } from "@/components/mentor-reviews"
import { Calendar } from "@/components/ui/calendar"
import { CheckoutButton } from "@/components/checkout-button"
import { Loader2 } from "lucide-react"

export function MentorProfile({ mentor, reviews = [] }: { mentor: any; reviews?: any[] }) {
  const [activeTab, setActiveTab] = useState("about")
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)

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

      if (mentor.calendly_username && mentor.calendly_event_type_uri) {
        // In a real implementation, this would call your backend API that interfaces with Calendly
        // For now, we'll simulate some available times
        await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay
      }

      // Simulate different times based on the day of week
      const day = date.getDay()
      let times: string[] = []

      if (day === 0 || day === 6) {
        // Weekend
        times = ["10:00 AM", "11:00 AM", "2:00 PM"]
      } else {
        // Weekday
        times = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
      }

      setAvailableTimes(times)
    } catch (error) {
      console.error("Error fetching available times:", error)
      setAvailableTimes([])
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <Image
                src={mentor.profile_image_url || "/placeholder.svg?height=96&width=96&query=avatar"}
                alt={mentor.name || "Mentor"}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{mentor.name || "Unnamed Mentor"}</h1>
              <p className="text-lg text-gray-600">{mentor.title || "College Consultant"}</p>
              <p className="text-gray-500">{mentor.university || "University not specified"}</p>
              <div className="flex items-center mt-2">
                <StarRating rating={mentor.rating || 0} />
                <span className="ml-2 text-gray-500">
                  {mentor.review_count || 0} {mentor.review_count === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs - Reordered as requested */}
          <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="awards">Awards</TabsTrigger>
              <TabsTrigger value="essays">Essays</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">About Me</h2>
                  <p className="text-gray-700 mb-6">{mentor.bio || "No bio available."}</p>

                  <h3 className="text-xl font-bold mb-3">Education</h3>
                  <p className="text-gray-700 mb-6">{mentor.university || "University not specified"}</p>

                  <h3 className="text-xl font-bold mb-3">Specialties</h3>
                  {mentor.specialties && mentor.specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {mentor.specialties.map((specialty: any) => (
                        <span key={specialty.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {specialty.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No specialties listed.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activities Tab */}
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

            {/* Awards Tab */}
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

            {/* Essays Tab */}
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

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                  <CardDescription>What others say about {mentor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorReviews mentorId={mentor.id} reviews={reviews} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Book a Session */}
        <div className="space-y-6">
          {/* Services and Booking Card */}
          <Card>
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
              <CardDescription>Select a service and schedule a time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Selection */}
              <div>
                <h3 className="text-sm font-medium mb-3">Available Services</h3>
                {mentor.services && mentor.services.length > 0 ? (
                  <div className="space-y-3">
                    {mentor.services.map((service: any) => (
                      <div
                        key={service.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedService?.id === service.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{service.name}</h4>
                          <span className="font-bold">${service.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-2 text-muted-foreground">No services available</p>
                )}
              </div>

              {/* Date Selection - Only show if a service is selected */}
              {selectedService && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-2">Select a Date</h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
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
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-2">Select a Time</h3>
                      {isLoadingTimes ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                          <span>Loading available times...</span>
                        </div>
                      ) : availableTimes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
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
                        <p className="text-center py-2 text-muted-foreground">No available times on this day</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Summary and Book Button */}
              <div className="border-t pt-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Booking Summary</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Selected Service:</span>{" "}
                      {selectedService ? selectedService.name : "No service selected"}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Selected Date & Time:</span>{" "}
                      {selectedDate && selectedTime
                        ? `${selectedDate.toLocaleDateString()} at ${selectedTime}`
                        : "No date and time selected"}
                    </p>
                    {selectedService && (
                      <p className="text-sm mt-1 font-bold">Total: ${selectedService.price.toFixed(2)}</p>
                    )}
                  </div>
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
      </div>
    </div>
  )
}
