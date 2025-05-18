"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MentorCard } from "@/components/mentor-card"
import { Pagination } from "@/components/pagination"
import { supabase } from "@/lib/supabase-client"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MentorsList() {
  const searchParams = useSearchParams()
  const [sortBy, setSortBy] = useState("rating")
  const [currentPage, setCurrentPage] = useState(1)
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [totalMentors, setTotalMentors] = useState(0)
  const itemsPerPage = 9

  // Get search and filter params
  const query = searchParams.get("q") || ""
  const minPrice = Number(searchParams.get("minPrice") || 50)
  const maxPrice = Number(searchParams.get("maxPrice") || 200)
  const universities = searchParams.get("universities")?.split(",") || []
  const specialties = searchParams.get("specialties")?.split(",") || []

  // This effect runs when the search params change
  useEffect(() => {
    async function fetchMentors() {
      try {
        setLoading(true)
        setCurrentPage(1) // Reset to first page when filters change

        // First check if the mentors table exists
        const { error: tableCheckError } = await supabase.from("mentors").select("id").limit(1)

        if (tableCheckError) {
          console.log("Mentors table might not exist:", tableCheckError.message)
          setTableExists(false)
          setMentors([])
          setLoading(false)
          return
        }

        // Get total count of mentors for reference
        const { count: totalCount, error: countError } = await supabase
          .from("mentors")
          .select("*", { count: "exact", head: true })

        if (!countError && totalCount !== null) {
          setTotalMentors(totalCount)
        }

        // Start building the query
        let mentorsQuery = supabase.from("mentors").select("*")

        // Apply university filter if selected
        if (universities.length > 0) {
          console.log("Filtering by universities:", universities)
          mentorsQuery = mentorsQuery.in("university", universities)
        }

        // Execute the query
        const { data: mentorsData, error: mentorsError } = await mentorsQuery

        if (mentorsError) {
          console.error("Error fetching mentors:", mentorsError)
          throw mentorsError
        }

        console.log(`Found ${mentorsData.length} mentors after university filter`)

        // If no mentors match the university filter, return early
        if (mentorsData.length === 0) {
          setMentors([])
          setLoading(false)
          return
        }

        // Get mentor IDs for related data queries
        const mentorIds = mentorsData.map((mentor) => mentor.id)

        // Get profiles data for these mentors
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

        // Get specialties for these mentors
        const { data: specialtiesData, error: specialtiesError } = await supabase
          .from("specialties")
          .select("*")
          .in("mentor_id", mentorIds)

        if (specialtiesError) throw specialtiesError

        // Get awards for these mentors
        const { data: awardsData, error: awardsError } = await supabase
          .from("awards")
          .select("*")
          .in("mentor_id", mentorIds)

        if (awardsError) throw awardsError

        // Transform data to match the expected format
        let transformedData = mentorsData.map((mentor) => {
          const profile = profilesData.find((p) => p.id === mentor.id) || {}
          const services = servicesData.filter((s) => s.mentor_id === mentor.id) || []
          const mentorSpecialties = specialtiesData.filter((s) => s.mentor_id === mentor.id).map((s) => s.name) || []
          const awards = awardsData.filter((a) => a.mentor_id === mentor.id) || []

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
            specialties: mentorSpecialties,
            bio: profile.bio || "",
          }
        })

        // Apply client-side filters

        // Filter by search query
        if (query) {
          const lowerQuery = query.toLowerCase()
          transformedData = transformedData.filter(
            (mentor) =>
              mentor.name.toLowerCase().includes(lowerQuery) ||
              mentor.university.toLowerCase().includes(lowerQuery) ||
              mentor.bio?.toLowerCase().includes(lowerQuery) ||
              mentor.specialties.some((s: string) => s.toLowerCase().includes(lowerQuery)),
          )
        }

        // Filter by price range
        if (minPrice > 0 || maxPrice < 500) {
          transformedData = transformedData.filter((mentor) => {
            // If mentor has no services, exclude if filtering by price
            if (!mentor.services.length) return false

            // Check if any service falls within the price range
            return mentor.services.some((service: any) => service.price >= minPrice && service.price <= maxPrice)
          })
        }

        // Filter by specialties
        if (specialties.length > 0) {
          transformedData = transformedData.filter((mentor) =>
            specialties.some((specialty) => mentor.specialties.includes(specialty)),
          )
        }

        setMentors(transformedData)
      } catch (err: any) {
        console.error("Error fetching mentors:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [searchParams])

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

  const isFiltered = query || universities.length > 0 || specialties.length > 0 || minPrice > 50 || maxPrice < 200

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
              {isFiltered && totalMentors > 0 && <span> (filtered from {totalMentors})</span>}
            </>
          ) : (
            "No consultants available with the selected filters"
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
          <p className="text-muted-foreground">
            {isFiltered ? (
              <>
                No consultants found with the selected filters. Try adjusting your search criteria.
                {universities.length > 0 && (
                  <div className="mt-2">
                    <strong>University filter:</strong> {universities.join(", ")}
                  </div>
                )}
              </>
            ) : (
              <>No consultants found. Check back later!</>
            )}
          </p>
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
