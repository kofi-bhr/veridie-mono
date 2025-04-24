"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/star-rating"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase-client"
import { Skeleton } from "@/components/ui/skeleton"

interface Testimonial {
  id: string
  name: string
  avatar?: string
  university: string
  text: string
  rating: number
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [visibleTestimonials, setVisibleTestimonials] = useState(3)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch testimonials from Supabase
  useEffect(() => {
    async function fetchTestimonials() {
      try {
        setLoading(true)

        // Try to fetch from testimonials table first
        let { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("featured", true)
          .order("rating", { ascending: false })
          .limit(10)

        // If testimonials table doesn't exist or has no data, try reviews table
        if (error || !data || data.length === 0) {
          const { data: reviewsData, error: reviewsError } = await supabase
            .from("reviews")
            .select("*")
            .gte("rating", 4) // Only get reviews with rating of 4 or higher
            .order("rating", { ascending: false })
            .limit(10)

          if (!reviewsError && reviewsData && reviewsData.length > 0) {
            data = reviewsData
          }
        }

        // If we have data from either table, use it
        if (data && data.length > 0) {
          setTestimonials(data)
        } else {
          // Fall back to hardcoded data if no database data is available
          setTestimonials(fallbackTestimonials)
        }
      } catch (err: any) {
        console.error("Error fetching testimonials:", err)
        setError(err.message)
        // Fall back to hardcoded data on error
        setTestimonials(fallbackTestimonials)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const showMore = () => {
    setVisibleTestimonials(Math.min(visibleTestimonials + 3, testimonials.length))
  }

  // Fallback testimonials data
  const fallbackTestimonials = [
    {
      id: "1",
      name: "Alex Thompson",
      avatar: "/placeholder.svg?height=80&width=80",
      university: "Stanford University",
      text: "Working with my consultant was transformative. Their guidance on my essays and application strategy was invaluable. I got accepted to my dream school!",
      rating: 5,
    },
    {
      id: "2",
      name: "Maya Patel",
      avatar: "/placeholder.svg?height=80&width=80",
      university: "Yale University",
      text: "My consultant helped me showcase my unique strengths and experiences. Their feedback was always constructive and helped me improve my application significantly.",
      rating: 5,
    },
    {
      id: "3",
      name: "Jordan Lee",
      avatar: "/placeholder.svg?height=80&width=80",
      university: "MIT",
      text: "The personalized attention I received was exceptional. My consultant understood exactly what top engineering programs are looking for and helped me position myself effectively.",
      rating: 4,
    },
    {
      id: "4",
      name: "Emma Rodriguez",
      avatar: "/placeholder.svg?height=80&width=80",
      university: "Harvard University",
      text: "I was struggling with my personal statement until I connected with my consultant. They helped me find my authentic voice and tell my story in a compelling way.",
      rating: 5,
    },
    {
      id: "5",
      name: "David Kim",
      avatar: "/placeholder.svg?height=80&width=80",
      university: "Princeton University",
      text: "The insights from someone who recently went through the application process were invaluable. My consultant knew exactly what admissions officers are looking for.",
      rating: 5,
    },
    {
      id: "6",
      name: "Sophia Chen",
      avatar: "/placeholder.svg?height=80&width=80",
      university: "Columbia University",
      text: "Working with a current student gave me perspective I couldn't get anywhere else. My consultant helped me highlight aspects of my application I would have overlooked.",
      rating: 4,
    },
  ]

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">What Our Students Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from students who have achieved their college dreams with the help of our consultants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">What Our Students Say</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Hear from students who have achieved their college dreams with the help of our consultants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.slice(0, visibleTestimonials).map((testimonial) => (
          <Card key={testimonial.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar>
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.university}</p>
                </div>
              </div>
              <StarRating rating={testimonial.rating} />
              <p className="mt-4 text-muted-foreground">{testimonial.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {visibleTestimonials < testimonials.length && (
        <div className="mt-10 text-center">
          <Button onClick={showMore} variant="outline">
            Show More Testimonials
          </Button>
        </div>
      )}
    </section>
  )
}
