import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { MentorProfile } from "@/components/mentor-profile"

export default async function MentorPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const supabase = createServerComponentClient({ cookies })

  console.log("Fetching mentor with ID:", slug)

  try {
    // Step 1: Fetch the mentor data
    const { data: mentorData, error: mentorError } = await supabase.from("mentors").select("*").eq("id", slug).single()

    if (mentorError) {
      console.error("Error fetching mentor:", mentorError.message)
      return notFound()
    }

    if (!mentorData) {
      console.error("No mentor found with ID:", slug)
      return notFound()
    }

    // Step 2: Fetch the profile data separately
    // Note: The profile ID should match the mentor ID since they represent the same user
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", slug) // Using slug which is the mentor ID
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError.message)
      // Continue anyway, we'll just have incomplete data
    }

    // Step 3: Fetch services
    const { data: services, error: servicesError } = await supabase.from("services").select("*").eq("mentor_id", slug)

    if (servicesError) {
      console.error("Error fetching services:", servicesError.message)
    }

    // Step 4: Fetch awards
    const { data: awards, error: awardsError } = await supabase.from("awards").select("*").eq("mentor_id", slug)

    if (awardsError) {
      console.error("Error fetching awards:", awardsError.message)
    }

    // Step 5: Fetch activities
    const { data: activities, error: activitiesError } = await supabase
      .from("activities")
      .select("*")
      .eq("mentor_id", slug)

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError.message)
    }

    // Step 6: Fetch essays
    const { data: essays, error: essaysError } = await supabase.from("essays").select("*").eq("mentor_id", slug)

    if (essaysError) {
      console.error("Error fetching essays:", essaysError.message)
    }

    // Step 7: Fetch specialties
    const { data: specialties, error: specialtiesError } = await supabase
      .from("specialties")
      .select("*")
      .eq("mentor_id", slug)

    if (specialtiesError) {
      console.error("Error fetching specialties:", specialtiesError.message)
    }

    // Combine all the data
    const mentor = {
      ...mentorData,
      profile: profileData || { name: "Unknown", avatar: "/placeholder.svg?height=100&width=100" },
      services: services || [],
      awards: awards || [],
      activities: activities || [],
      essays: essays || [],
      specialties: specialties || [],
    }

    console.log("Mentor data found:", {
      id: mentor.id,
      name: mentor.profile?.name,
      services: mentor.services?.length || 0,
    })

    return <MentorProfile mentor={mentor} />
  } catch (error) {
    console.error("Unexpected error in mentor page:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>An unexpected error occurred. Please try again later.</p>
          <p className="text-sm mt-2">Error details: {error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    )
  }
}
