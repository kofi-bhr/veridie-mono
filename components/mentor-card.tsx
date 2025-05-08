"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/star-rating"
import { useEffect, useState } from "react"

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
  const { id, name, avatar, profile_image_url, university, rating, reviewCount, services, awards } = mentor
  const [imageUrl, setImageUrl] = useState<string>("/placeholder.svg?height=200&width=200")

  // Client-side image URL processing
  useEffect(() => {
    // Log all possible image sources for debugging
    console.log(`MentorCard ${id} (${name}) image sources:`, {
      profile_image_url,
      avatar,
    })

    // Prioritize profile_image_url, then fall back to avatar
    if (profile_image_url) {
      setImageUrl(profile_image_url)
    } else if (avatar) {
      setImageUrl(avatar)
    }
  }, [id, name, profile_image_url, avatar])

  // Get the lowest priced service
  const lowestPrice = services.reduce(
    (min, service) => (service.price < min ? service.price : min),
    services[0]?.price || 0,
  )

  // Get the top award if available
  const topAward = awards && awards.length > 0 ? awards[0] : null

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/mentors/${id}`} className="block">
        <div className="h-3 bg-primary"></div>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-muted">
              <AvatarImage
                src={imageUrl || "/placeholder.svg"}
                alt={name}
                onError={(e) => {
                  console.error(`Failed to load image for ${name}:`, imageUrl)
                  e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                }}
              />
              <AvatarFallback>
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
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
