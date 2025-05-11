"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/star-rating"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { addReview } from "@/lib/actions"
import { supabase } from "@/lib/supabase-client"
import { Skeleton } from "@/components/ui/skeleton"

interface MentorReviewsProps {
  mentorId: string
}

export function MentorReviews({ mentorId }: MentorReviewsProps) {
  const [visibleReviews, setVisibleReviews] = useState(3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [service, setService] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [services, setServices] = useState<any[]>([])
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch reviews for this mentor
  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true)

        // Check if reviews table exists by attempting to fetch from it
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("mentor_id", mentorId)
          .order("created_at", { ascending: false })

        // If there's an error with the table not existing, we'll handle it
        if (error && error.message.includes('relation "reviews" does not exist')) {
          // Table doesn't exist, use empty array
          setReviews([])
        } else if (error) {
          // Some other error occurred
          throw error
        } else {
          // Table exists and we got data
          setReviews(data || [])
        }

        // Also fetch services for the dropdown
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("name")
          .eq("mentor_id", mentorId)

        if (!servicesError) {
          setServices(servicesData || [])
        }
      } catch (err: any) {
        console.error("Error fetching reviews:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [mentorId])

  const showMore = () => {
    setVisibleReviews((prev) => Math.min(prev + 3, reviews.length))
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to leave a review",
        variant: "destructive",
      })
      return
    }

    if (!reviewText || !service) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Try to insert directly into the reviews table
      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            mentor_id: mentorId,
            client_id: user.id,
            name: user.name,
            rating: rating,
            service: service,
            text: reviewText,
          },
        ])
        .select()

      if (error) {
        // If direct insert fails, fall back to the server action
        const formData = new FormData()
        formData.append("mentorId", mentorId)
        formData.append("name", user.name)
        formData.append("rating", rating.toString())
        formData.append("service", service)
        formData.append("text", reviewText)

        const result = await addReview(formData)

        if (!result.success) {
          throw new Error(result.message)
        }
      }

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      setReviewText("")
      setService("")
      setRating(5)
      setDialogOpen(false)

      // Refresh reviews
      const { data: refreshedData } = await supabase
        .from("reviews")
        .select("*")
        .eq("mentor_id", mentorId)
        .order("created_at", { ascending: false })

      if (refreshedData) {
        setReviews(refreshedData)
      }
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your review",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Loading Reviews...</h3>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b pb-6 last:border-0">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Reviews</h3>
        </div>
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-500">Error loading reviews: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Write a Review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl focus:outline-none"
                    >
                      {star <= rating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Service Used</Label>
                <select
                  id="service"
                  className="w-full p-2 border rounded-md"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                >
                  <option value="">Select a service</option>
                  {services.map((service, index) => (
                    <option key={index} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="review">Your Review</Label>
                <Textarea
                  id="review"
                  placeholder="Share your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center p-6 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.slice(0, visibleReviews).map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={"/placeholder-40px-height.png?height=40&width=40"} alt={review.name} />
                  <AvatarFallback>
                    {review.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{review.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={review.rating} />
                  <p className="text-sm text-muted-foreground">{review.service}</p>
                  <p className="mt-2">{review.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {visibleReviews < reviews.length && (
        <div className="text-center">
          <Button variant="outline" onClick={showMore}>
            Show More Reviews
          </Button>
        </div>
      )}
    </div>
  )
}
