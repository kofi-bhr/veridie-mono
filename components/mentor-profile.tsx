"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { CalendlyBooking } from "@/components/calendly-booking"

export function MentorProfile({ mentor }: { mentor: any }) {
  const [activeTab, setActiveTab] = useState("about")
  const [selectedService, setSelectedService] = useState<any>(null)

  if (!mentor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Mentor data not found. Please try again later.</p>
        </div>
      </div>
    )
  }

  const handleBookNow = (service: any) => {
    setSelectedService(service)
    window.scrollTo({ top: document.getElementById("booking-section")?.offsetTop || 0, behavior: "smooth" })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <Image
                src={mentor.profile?.avatar || "/placeholder.svg?height=96&width=96&query=avatar"}
                alt={mentor.profile?.name || "Mentor"}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{mentor.profile?.name || "Unnamed Mentor"}</h1>
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
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Activities & Experience</h2>
                  {mentor.activities && mentor.activities.length > 0 ? (
                    <div className="space-y-6">
                      {mentor.activities.map((activity: any) => (
                        <div key={activity.id} className="border-b pb-6 last:border-0">
                          <h3 className="text-xl font-bold">{activity.title || activity.name}</h3>
                          <p className="text-gray-600">{activity.organization}</p>
                          <p className="text-gray-500 mb-2">
                            {activity.years || `${activity.start_date} - ${activity.end_date || "Present"}`}
                          </p>
                          <p className="text-gray-700">{activity.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No activities listed.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Awards Tab */}
            <TabsContent value="awards">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Awards & Honors</h2>
                  {mentor.awards && mentor.awards.length > 0 ? (
                    <div className="space-y-6">
                      {mentor.awards.map((award: any) => (
                        <div key={award.id} className="border-b pb-6 last:border-0">
                          <h3 className="text-xl font-bold">{award.title || award.name}</h3>
                          <p className="text-gray-600">{award.organization || award.issuer}</p>
                          <p className="text-gray-500 mb-2">{award.year || award.date}</p>
                          <p className="text-gray-700">{award.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No awards listed.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Essays Tab */}
            <TabsContent value="essays">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Sample Essays</h2>
                  {mentor.essays && mentor.essays.length > 0 ? (
                    <div className="space-y-6">
                      {mentor.essays.map((essay: any) => (
                        <div key={essay.id} className="border-b pb-6 last:border-0">
                          <h3 className="text-xl font-bold">{essay.title}</h3>
                          <p className="text-blue-600">{essay.university || essay.school}</p>
                          <div className="bg-gray-50 p-4 rounded my-3">
                            <p className="italic text-gray-700">{essay.prompt}</p>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{essay.text || essay.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No sample essays available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                  <p className="text-gray-500">No reviews yet.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Services Section */}
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent>
              {mentor.services && mentor.services.length > 0 ? (
                <div className="space-y-4">
                  {mentor.services.map((service: any) => (
                    <div key={service.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-gray-700 text-sm mb-2">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">${service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No services available.</p>
              )}
            </CardContent>
          </Card>

          {/* Book a Session Card */}
          <Card>
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
            </CardHeader>
            <CardContent>
              {mentor.services && mentor.services.length > 0 ? (
                <div className="space-y-4">
                  {mentor.services.map((service: any) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{service.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold">${service.price}</span>
                        <Button size="sm" onClick={() => handleBookNow(service)}>
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No services available for booking.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendly Booking Section */}
      {mentor.calendly_username && (
        <div id="booking-section" className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">
            {selectedService ? `Book: ${selectedService.name}` : "Schedule a Session"}
          </h2>
          <CalendlyBooking
            mentorId={mentor.id}
            mentorName={mentor.profile?.name || "Consultant"}
            calendlyUsername={mentor.calendly_username}
            serviceId={selectedService?.id}
            serviceName={selectedService?.name}
          />
        </div>
      )}
    </div>
  )
}
