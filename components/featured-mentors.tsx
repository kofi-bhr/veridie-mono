"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export function FeaturedMentors() {
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchFeaturedMentors() {
      try {
        setLoading(true)

        // First try to fetch from mentors table
        const { data: mentorsData, error: mentorsError } = await supabase.from("mentors").select("*").limit(3)

        if (mentorsError) {
          console.error("Error fetching mentors:", mentorsError)
          throw new Error(mentorsError.message)
        }

        if (mentorsData && mentorsData.length > 0) {
          setMentors(mentorsData)
        } else {
          // Fallback to sample data
          setMentors([
            {
              id: 1,
              name: "Dr. Sarah Johnson",
              university: "Harvard University",
              title: "College Admissions Expert",
              avatar_url: "/diverse-group-city.png",
            },
            {
              id: 2,
              name: "Prof. Michael Chen",
              university: "Stanford University",
              title: "Essay Specialist",
              avatar_url: "/diverse-group-city.png",
            },
            {
              id: 3,
              name: "Dr. Emily Rodriguez",
              university: "Yale University",
              title: "Interview Coach",
              avatar_url: "/diverse-group-city.png",
            },
          ])
        }
      } catch (err) {
        console.error("Error in fetchFeaturedMentors:", err)
        setError("Failed to load featured consultants")
        // Fallback to sample data
        setMentors([
          {
            id: 1,
            name: "Dr. Sarah Johnson",
            university: "Harvard University",
            title: "College Admissions Expert",
            avatar_url: "/diverse-group-city.png",
          },
          {
            id: 2,
            name: "Prof. Michael Chen",
            university: "Stanford University",
            title: "Essay Specialist",
            avatar_url: "/diverse-group-city.png",
          },
          {
            id: 3,
            name: "Dr. Emily Rodriguez",
            university: "Yale University",
            title: "Interview Coach",
            avatar_url: "/diverse-group-city.png",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedMentors()
  }, [supabase])

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Consultants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-lg shadow-md p-6 flex flex-col items-center text-center animate-pulse"
            >
              <div className="w-24 h-24 rounded-full bg-muted mb-4"></div>
              <div className="h-6 bg-muted w-3/4 mb-2 rounded"></div>
              <div className="h-4 bg-muted w-1/2 mb-2 rounded"></div>
              <div className="h-4 bg-muted w-2/3 mb-4 rounded"></div>
              <div className="h-8 bg-muted w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    console.error("Rendering error state:", error)
    // Continue with fallback data that was set in the catch block
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8 text-center">Featured Consultants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="bg-card rounded-lg shadow-md p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-muted mb-4 overflow-hidden">
              <img
                src={mentor.avatar_url || "/placeholder.svg?height=96&width=96&query=person"}
                alt={mentor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/diverse-group-city.png"
                }}
              />
            </div>
            <h3 className="font-semibold text-lg mb-1">{mentor.name}</h3>
            <p className="text-muted-foreground mb-2">{mentor.university}</p>
            <p className="text-sm mb-4">{mentor.title}</p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/mentors/${mentor.id}`}>View Profile</Link>
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/mentors">View All Consultants</Link>
        </Button>
      </div>
    </div>
  )
}
