"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { MentorEssays } from "@/components/mentor-essays"
import { MentorActivities } from "@/components/mentor-activities"
import { MentorAwards } from "@/components/mentor-awards"
import { MentorReviews } from "@/components/mentor-reviews"
import { Calendar } from "@/components/ui/calendar"
import { supabase } from "@/lib/supabase-client"
import { Loader2, CalendarDays } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

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

  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime(null)
    if (selectedDate) {
      fetchAvailableTimes(selectedDate)
    }
  }, [selectedDate])

  // Function to fetch available times
  const fetchAvailableTimes = async (date: Date) => {
    setIsLoadingTimes(true)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

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

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to book a session",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Incomplete booking",
        description: "Please select a service, date, and time",
        variant: "destructive",
      })
      return
    }

    setIsBooking(true)

    try {
      // In a real implementation, this would call your API to create a booking
      // and redirect to the Stripe checkout page
      console.log("Booking details:", {
        mentorId: mentor.id,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect to success page
      router.push(
        `/booking/success?mentor=${mentor.id}&service=${selectedService.id}&date=${
          selectedDate.toISOString().split("T")[0]
        }&time=${selectedTime}`,
      )
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
      setIsBooking(false)
    }
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
                  <div className="space-y-4">
                    {mentor.services && mentor.services.length > 0 ? (
                      mentor.services.map((service: any) => (
                        <div
                          key={service.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedService?.id === service.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedService(service)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{service.name}</h4>
                            <span className="font-bold">${service.price}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">
                        This consultant hasn't added any services yet.
                      </p>
                    )}
                  </div>
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
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a date and time to book a session with {mentor.name}.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Select a Date</h3>
                      <Calendar
                        mode="single"
                        selected={selectedDate || undefined}
                        onSelect={(date) => setSelectedDate(date)}
                        className="rounded-md border"
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Select a Time</h3>
                      {!selectedDate ? (
                        <p className="text-sm text-muted-foreground">Please select a date first</p>
                      ) : isLoadingTimes ? (
                        <div className="flex items-center justify-center py-4">
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
                        <p className="text-center py-2 text-muted-foreground">No available times on this day</p>
                      )}
                    </div>
                  </div>
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
          <Card className="mt-6" id="booking-section">
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
              <CardDescription>Select a service, date, and time to book a session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Service Selection */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Select a Service</h3>
                  <div className="space-y-3">
                    {mentor.services && mentor.services.length > 0 ? (
                      mentor.services.map((service: any) => (
                        <div
                          key={service.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedService?.id === service.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedService(service)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{service.name}</h4>
                            <span className="font-bold">${service.price}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-2 text-muted-foreground">No services available</p>
                    )}
                  </div>
                </div>

                {/* Date and Time Selection */}
                {selectedService && (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Select a Date</h3>
                        <Calendar
                          mode="single"
                          selected={selectedDate || undefined}
                          onSelect={(date) => setSelectedDate(date)}
                          className="rounded-md border"
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Select a Time</h3>
                        {!selectedDate ? (
                          <p className="text-sm text-muted-foreground">Please select a date first</p>
                        ) : isLoadingTimes ? (
                          <div className="flex items-center justify-center py-4">
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
                          <p className="text-center py-2 text-muted-foreground">No available times on this day</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Summary */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Booking Summary</h3>
                  <div className="bg-muted p-4 rounded-md mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Selected Service:</span>
                      <span>{selectedService ? selectedService.name : "No service selected"}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Date:</span>
                      <span>{selectedDate ? selectedDate.toLocaleDateString() : "No date selected"}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Time:</span>
                      <span>{selectedTime || "No time selected"}</span>
                    </div>
                    {selectedService && (
                      <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                        <span>Total:</span>
                        <span>${selectedService.price}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={!selectedService || !selectedDate || !selectedTime || isBooking}
                    className="w-full"
                    size="lg"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Book Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
