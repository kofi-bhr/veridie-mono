"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ConsultantDashboard } from "@/components/consultant-dashboard"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [mentorData, setMentorData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Create a fresh Supabase client for this component
  const supabase = createClientComponentClient()

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!authLoading && !user) {
      console.log("No user found, redirecting to login")
      router.push("/auth/login")
      return
    }

    // If user is not a consultant, redirect to mentors page
    if (!authLoading && user && user.role !== "consultant") {
      console.log("User is not a consultant, redirecting to mentors")
      router.push("/mentors")
      return
    }

    // Fetch mentor data if user is a consultant
    const fetchMentorData = async () => {
      if (user && user.role === "consultant") {
        try {
          console.log("Fetching mentor data...")

          // Set a timeout for the fetch operation
          const fetchPromise = supabase.from("mentors").select("*").eq("id", user.id).single()
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Mentor data fetch timeout")), 5000),
          )

          const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as any

          if (error) {
            console.error("Error fetching mentor data:", error)
            setError("Failed to load your mentor profile. Please try again.")
          } else {
            console.log("Mentor data fetched successfully")
            setMentorData(data)
          }
        } catch (err) {
          console.error("Error in fetchMentorData:", err)
          setError("An unexpected error occurred. Please try again.")
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchMentorData()
    }

    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Dashboard loading timed out, resetting state")
        setIsLoading(false)
        if (!mentorData && !error) {
          setError("Loading timed out. Please try refreshing the page.")
        }
      }
    }, 8000) // 8 second timeout

    return () => clearTimeout(loadingTimeout)
  }, [user, authLoading, router, retryCount, supabase])

  // Create mentor profile if it doesn't exist
  const createMentorProfile = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("mentors").insert([
        {
          id: user.id,
          title: "",
          university: "",
          bio: "",
          rating: 0,
          review_count: 0,
          languages: ["English"],
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error("Error creating mentor profile:", error)
        setError("Failed to create your mentor profile. Please try again.")
      } else {
        // Refresh the page to load the new profile
        window.location.reload()
      }
    } catch (err) {
      console.error("Error in createMentorProfile:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    setRetryCount((prev) => prev + 1)
  }

  // Show a simplified loading state
  if (authLoading || (isLoading && !error)) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          <Button variant="ghost" className="mt-4" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Error Loading Dashboard</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            <Button variant="outline" onClick={handleRetry}>
              Try Again
            </Button>
            <Button variant="ghost" onClick={() => router.push("/")}>
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If mentor profile doesn't exist, show creation button
  if (!mentorData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">Complete Your Profile Setup</h2>
          <p className="text-yellow-700 mb-6">
            We need to create your mentor profile before you can start using the dashboard.
          </p>
          <Button onClick={createMentorProfile} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create My Mentor Profile
          </Button>
        </div>
      </div>
    )
  }

  return <ConsultantDashboard user={user} mentorData={mentorData} />
}
