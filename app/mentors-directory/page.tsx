"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/star-rating"
import Link from "next/link"

interface Mentor {
  id: string
  title: string | null
  university: string | null
  bio: string | null
  rating: number
  review_count: number
  profile: {
    name: string
    email: string
    avatar: string | null
  }
  services: {
    name: string
    price: number
  }[]
}

export default function MentorsDirectoryPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMentors() {
      try {
        setLoading(true)

        // Fetch mentors with their profiles and services
        const { data, error } = await supabase
          .from("mentors")
          .select(`
            *,
            profile:profiles(*),
            services(*)
          `)
          .order("rating", { ascending: false })

        if (error) {
          throw error
        }

        // Transform the data to match our interface
        const transformedData =
          data?.map((mentor) => ({
            ...mentor,
            profile: mentor.profile,
            services: mentor.services || [],
          })) || []

        setMentors(transformedData)
      } catch (err: any) {
        console.error("Error fetching mentors:", err)
        setError(err.message || "Failed to load mentors")
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Consultants</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No consultants found</p>
        ) : (
          mentors.map((mentor) => (
            <Card key={mentor.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="h-3 bg-primary"></div>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-muted">
                  <AvatarImage
                    src={mentor.profile?.avatar || "/placeholder.svg?height=200&width=200"}
                    alt={mentor.profile?.name || "Mentor"}
                  />
                  <AvatarFallback>{(mentor.profile?.name || "?").charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{mentor.profile?.name || "Unnamed Mentor"}</CardTitle>
                  <CardDescription>{mentor.title || "Consultant"}</CardDescription>
                  <p className="text-sm font-medium">{mentor.university || "University not specified"}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={mentor.rating} />
                  <span className="text-sm text-muted-foreground">({mentor.review_count} reviews)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Services from</span>
                    <span className="font-bold text-lg ml-1">
                      ${mentor.services.length > 0 ? Math.min(...mentor.services.map((s) => s.price)) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 pb-4">
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/mentors/${mentor.id}`}>View Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
