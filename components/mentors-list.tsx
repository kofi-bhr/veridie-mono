"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MentorCard } from "@/components/mentor-card"
import { Pagination } from "@/components/pagination"
import { supabase } from "@/lib/supabase-client"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MentorsList() {
  const [sortBy, setSortBy] = useState("rating")
  const [currentPage, setCurrentPage] = useState(1)
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const itemsPerPage = 9

  // Fetch mentors from Supabase
  useEffect(() => {
    async function fetchMentors() {
      try {
        setLoading(true)

        // First check if the mentors table exists
        const { error: tableCheckError } = await supabase.from("mentors").select("id").limit(1)

        if (tableCheckError) {
          console.log("Mentors table might not exist:", tableCheckError.message)
          setTableExists(false)
          setMentors([])
          setLoading(false)
          return
        }

        // Get mentors data
        const { data: mentorsData, error: mentorsError } = await supabase
          .from("mentors")
          .select("*")
          .order("rating", { ascending: false })

        if (mentorsError) throw mentorsError

        // Get profiles data for these mentors
        const mentorIds = mentorsData.map((mentor) => mentor.id)
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", mentorIds)

        if (profilesError) throw profilesError

        // Get services for these mentors
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("*")
          .in("mentor_id", mentorIds)

        if (servicesError) throw servicesError

        // Get awards for these mentors
        const { data: awardsData, error: awardsError } = await supabase
          .from("awards")
          .select("*")
          .in("mentor_id", mentorIds)

        if (awardsError) throw awardsError

        // Get specialties for these mentors
        const { data: specialtiesData, error: specialtiesError } = await supabase
          .from("specialties")
          .select("*")
          .in("mentor_id", mentorIds)

        if (specialtiesError) throw specialtiesError

        // Transform data to match the expected format
        const transformedData = mentorsData.map((mentor) => {
          const profile = profilesData.find((p) => p.id === mentor.id) || {}
          const services = servicesData.filter((s) => s.mentor_id === mentor.id) || []
          const awards = awardsData.filter((a) => a.mentor_id === mentor.id) || []
          const specialties = specialtiesData.filter((s) => s.mentor_id === mentor.id).map((s) => s.name) || []

          return {
            id: mentor.id,
            name: profile.name || "Unknown",
            title: mentor.title || "Consultant",
            university: mentor.university || "University not specified",
            avatar: profile.avatar || "/placeholder.svg?height=200&width=200",
            rating: mentor.rating || 4.5,
            reviewCount: mentor.review_count || 0,
            services: services,
            awards: awards,
            specialties: specialties,
          }
        })

        setMentors(transformedData)
      } catch (err: any) {
        console.error("Error fetching mentors:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  // Sort mentors based on selected option
  const sortedMentors = [...mentors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "price-low":
        return (a.services[0]?.price || 0) - (b.services[0]?.price || 0)
      case "price-high":
        return (b.services[0]?.price || 0) - (a.services[0]?.price || 0)
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedMentors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMentors = sortedMentors.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">Loading mentors...</p>
          <div className="w-[180px]">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!tableExists) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Database Setup Required</AlertTitle>
        <AlertDescription>
          The mentors table doesn't seem to exist yet. Please set up your database first.
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load mentors: {error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {mentors.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedMentors.length)}
              </span>{" "}
              of <span className="font-medium">{sortedMentors.length}</span> consultants
            </>
          ) : (
            "No consultants available at this time"
          )}
        </p>

        {mentors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {mentors.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No consultants found. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}
