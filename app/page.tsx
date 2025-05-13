"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

// Define the consultant type based on what we need for display
interface Consultant {
  id: string
  name: string
  avatar: string
  university: string
  title: string
  rating: number
}

function TopConsultantsSection() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConsultants() {
      try {
        // First, fetch mentors data
        const { data: mentors, error: mentorsError } = await supabase
          .from("mentors")
          .select("id, title, university, rating, review_count")
          .order("rating", { ascending: false })
          .limit(5) // Increased to 5 consultants

        if (mentorsError) {
          console.error("Error fetching mentors:", mentorsError)
          setConsultants([])
          setLoading(false)
          return
        }

        // If we have mentors, fetch their profile data
        if (mentors && mentors.length > 0) {
          const consultantsWithProfiles = await Promise.all(
            mentors.map(async (mentor) => {
              // For each mentor, fetch their profile data
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("name, avatar")
                .eq("id", mentor.id)
                .single()

              if (profileError) {
                console.error(`Error fetching profile for mentor ${mentor.id}:`, profileError)
                return {
                  id: mentor.id,
                  name: "Unknown Consultant",
                  avatar: "/diverse-avatars.png",
                  university: mentor.university || "University not specified",
                  title: mentor.title || "College Consultant",
                  rating: mentor.rating || 0,
                }
              }

              return {
                id: mentor.id,
                name: profileData?.name || "Unknown Consultant",
                avatar: profileData?.avatar || "/diverse-avatars.png",
                university: mentor.university || "University not specified",
                title: mentor.title || "College Consultant",
                rating: mentor.rating || 0,
              }
            }),
          )

          setConsultants(consultantsWithProfiles)
        } else {
          setConsultants([])
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        setConsultants([])
      } finally {
        setLoading(false)
      }
    }

    fetchConsultants()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-nowrap overflow-x-auto pb-4 pt-3 gap-4 snap-x justify-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-none w-48 bg-card rounded-lg shadow-md p-4 pt-6 h-64 animate-pulse snap-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3"></div>
            <div className="h-3 bg-muted rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-2 bg-muted rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-2 bg-muted rounded w-2/3 mx-auto mb-3"></div>
            <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-nowrap overflow-x-auto pb-4 pt-3 gap-4 snap-x justify-center">
      {consultants.length > 0 ? (
        consultants.map((consultant, index) => (
          <div
            key={consultant.id}
            className="flex-none w-48 relative bg-card rounded-lg shadow-md p-4 pt-6 flex flex-col items-center text-center snap-center"
          >
            {/* Ranking badge - positioned higher to avoid being cut off */}
            <div className="absolute -top-3 -right-2 z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md text-sm">
              #{index + 1}
            </div>
            <div className="w-16 h-16 rounded-full bg-muted mb-3 overflow-hidden">
              <img
                src={consultant.avatar || "/placeholder.svg"}
                alt={consultant.name}
                className="w-full h-full object-cover scale-125 transform"
                onError={(e) => {
                  e.currentTarget.src = "/diverse-avatars.png"
                }}
              />
            </div>
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{consultant.name}</h3>
            <p className="text-muted-foreground text-xs mb-1 line-clamp-1">{consultant.university}</p>
            <p className="text-xs mb-2 line-clamp-1">{consultant.title}</p>
            {/* Display rating */}
            <div className="flex items-center mb-2">
              <span className="text-yellow-500 mr-1 text-xs">★</span>
              <span className="text-xs">{consultant.rating.toFixed(1)}</span>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full text-xs py-1 h-7">
              <Link href={`/mentors/${consultant.id}`}>View Profile</Link>
            </Button>
          </div>
        ))
      ) : (
        <div className="w-full text-center py-8">
          <p className="text-muted-foreground">Our consultants are getting ready to help you. Check back soon!</p>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <div className="py-16">
        <HowItWorks />
      </div>
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Consultant Leaderboard</h2>
          <p className="text-center text-muted-foreground mb-8">Our top-performing consultants ranked by total sales</p>
          <TopConsultantsSection />
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/mentors">View All Consultants</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="py-16">
        <Testimonials />
      </div>
      <div className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with experienced college consultants who can help you achieve your academic dreams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/mentors">Find a Consultant</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signup">Create an Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
