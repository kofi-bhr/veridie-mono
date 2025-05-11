"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/star-rating"
import { getProfileImageUrl, getInitials } from "@/lib/image-utils"

interface MentorCardProps {
  mentor: {
    id: string
    name: string
    avatar?: string
    profile_image_url?: string
    university: string
    rating: number
    reviewCount: number
    services: Array<{
      name: string
      description: string
      price: number
    }>
    awards?: Array<{
      title: string
      issuer: string
      year?: string
      description?: string
    }>
    specialties: string[]
  }
}

export function MentorCard({ mentor }: MentorCardProps) {
  const { id, name, university, rating, reviewCount, services, awards } = mentor

  // Get the lowest priced service
  const lowestPrice = services.reduce(
    (min, service) => (service.price < min ? service.price : min),
    services[0]?.price || 0,
  )

  // Get the top award if available
  const topAward = awards && awards.length > 0 ? awards[0] : null

  // Get the profile image URL
  const profileImageUrl = getProfileImageUrl(mentor.profile_image_url || mentor.avatar)

  // Get initials for fallback
  const initials = getInitials(name)

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/mentors/${id}`} className="block">
        <div className="h-3 bg-primary"></div>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-muted flex-shrink-0 relative">
              {/* Try to load the image, but have a fallback */}
              <img
                src={profileImageUrl || "/placeholder.svg"}
                alt={name}
                className="w-full h-full object-cover scale-110 transform" // Added scale-110 to zoom in
                onError={(e) => {
                  // If image fails to load, show initials
                  const target = e.currentTarget
                  target.style.display = "none"
                  target.parentElement?.classList.add("bg-primary/10")

                  // Create and append the initials element
                  const initialsEl = document.createElement("div")
                  initialsEl.className = "w-full h-full flex items-center justify-center text-primary font-bold"
                  initialsEl.textContent = initials
                  target.parentElement?.appendChild(initialsEl)
                }}
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm font-medium">{university}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={rating} />
            <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
          </div>

          {topAward && (
            <div className="mb-4">
              <div className="text-xs font-medium px-3 py-2 rounded-md bg-primary text-primary-foreground border border-primary/20">
                {topAward.title}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Services from</span>
              <span className="font-bold text-lg ml-1">${lowestPrice}</span>
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="bg-muted/30 pt-4 pb-4">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={`/mentors/${id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
