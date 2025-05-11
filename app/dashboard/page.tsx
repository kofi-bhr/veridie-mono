"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ConsultantDashboard } from "@/components/consultant-dashboard"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [mentorData, setMentorData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    // If user is not a consultant, redirect to mentors page
    if (!loading && user && user.role !== "consultant") {
      router.push("/mentors")
      return
    }

    // Fetch mentor data if user is a consultant
    const fetchMentorData = async () => {
      if (user && user.role === "consultant") {
        try {
          const { data, error } = await supabase.from("mentors").select("*").eq("id", user.id).single()

          if (error) {
            console.error("Error fetching mentor data:", error)
            setError("Failed to load your mentor profile. Please try again.")
          } else {
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

    if (user) {
      fetchMentorData()
    }
  }, [user, loading, router])

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

  if (loading || isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Error Loading Dashboard</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
