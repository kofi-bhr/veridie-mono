import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for client-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a Supabase client with the anonymous key for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication functions
export async function signUp(email: string, password: string, userData: any) {
  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        },
      },
    })

    if (authError) throw authError

    if (authData.user) {
      // Insert the user profile data
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          name: userData.name,
          email: email,
          role: userData.role,
          avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
          created_at: new Date().toISOString(),
        },
      ])

      if (profileError) throw profileError

      // If the user is a consultant, create a mentor profile
      if (userData.role === "consultant") {
        const { error: mentorError } = await supabase.from("mentors").insert([
          {
            id: authData.user.id,
            title: "",
            university: "",
            bio: "",
            rating: 0,
            review_count: 0,
            languages: [],
            created_at: new Date().toISOString(),
          },
        ])

        if (mentorError) throw mentorError
      }
    }

    return { user: authData.user, error: null }
  } catch (error) {
    console.error("Error signing up:", error)
    return { user: null, error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { session: data.session, user: data.user, error }
  } catch (error) {
    console.error("Error signing in:", error)
    return { session: null, user: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error("Error signing out:", error)
    return { error }
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    return { profile: data, error }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return { profile: null, error }
  }
}

// Get mentor profile
export async function getMentorProfile(mentorId: string) {
  try {
    const { data, error } = await supabase.from("mentors").select("*").eq("id", mentorId).single()

    return { mentor: data, error }
  } catch (error) {
    console.error("Error getting mentor profile:", error)
    return { mentor: null, error }
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId)

    return { data, error }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { data: null, error }
  }
}

// Mentor profile functions
export async function getAllMentors() {
  try {
    const { data, error } = await supabase
      .from("mentors")
      .select(`
        *,
        profiles!inner(*),
        specialties(*),
        services(*),
        awards(*)
      `)
      .order("rating", { ascending: false })

    return { mentors: data || [], error }
  } catch (error) {
    console.error("Error fetching mentors:", error)
    return { mentors: [], error }
  }
}

export async function updateMentorProfile(mentorId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from("mentors")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mentorId)

    return { data, error }
  } catch (error) {
    console.error("Error updating mentor profile:", error)
    return { data: null, error }
  }
}

// Activity functions
export async function addActivity(mentorId: string, activity: any) {
  try {
    const { data, error } = await supabase
      .from("activities")
      .insert([
        {
          mentor_id: mentorId,
          title: activity.title,
          organization: activity.organization,
          years: activity.years,
          description: activity.description,
        },
      ])
      .select()

    return { data, error }
  } catch (error) {
    console.error("Error adding activity:", error)
    return { data: null, error }
  }
}

export async function deleteActivity(activityId: string) {
  try {
    const { data, error } = await supabase.from("activities").delete().eq("id", activityId)

    return { data, error }
  } catch (error) {
    console.error("Error deleting activity:", error)
    return { data: null, error }
  }
}

// Award functions
export async function addAward(mentorId: string, award: any) {
  try {
    const { data, error } = await supabase
      .from("awards")
      .insert([
        {
          mentor_id: mentorId,
          title: award.title,
          issuer: award.issuer,
          year: award.year,
          description: award.description,
        },
      ])
      .select()

    return { data, error }
  } catch (error) {
    console.error("Error adding award:", error)
    return { data: null, error }
  }
}

export async function deleteAward(awardId: string) {
  try {
    const { data, error } = await supabase.from("awards").delete().eq("id", awardId)

    return { data, error }
  } catch (error) {
    console.error("Error deleting award:", error)
    return { data: null, error }
  }
}

// Essay functions
export async function addEssay(mentorId: string, essay: any) {
  try {
    const { data, error } = await supabase
      .from("essays")
      .insert([
        {
          mentor_id: mentorId,
          title: essay.title,
          prompt: essay.prompt,
          text: essay.text,
          university: essay.university,
        },
      ])
      .select()

    return { data, error }
  } catch (error) {
    console.error("Error adding essay:", error)
    return { data: null, error }
  }
}

export async function deleteEssay(essayId: string) {
  try {
    const { data, error } = await supabase.from("essays").delete().eq("id", essayId)

    return { data, error }
  } catch (error) {
    console.error("Error deleting essay:", error)
    return { data: null, error }
  }
}

// Availability functions
export async function updateAvailability(mentorId: string, availability: any[]) {
  try {
    // First delete existing availability
    await supabase.from("availability").delete().eq("mentor_id", mentorId)

    // Then insert new availability
    const { data, error } = await supabase
      .from("availability")
      .insert(
        availability.map((item) => ({
          mentor_id: mentorId,
          day: item.day,
          slots: item.slots,
        })),
      )
      .select()

    return { data, error }
  } catch (error) {
    console.error("Error updating availability:", error)
    return { data: null, error }
  }
}

// Review functions
export async function addReview(review: any) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          mentor_id: review.mentorId,
          client_id: review.clientId,
          name: review.name,
          rating: review.rating,
          service: review.service,
          text: review.text,
        },
      ])
      .select()

    // Update mentor rating
    if (!error) {
      await updateMentorRating(review.mentorId)
    }

    return { data, error }
  } catch (error) {
    console.error("Error adding review:", error)
    return { data: null, error }
  }
}

async function updateMentorRating(mentorId: string) {
  try {
    // Get all reviews for this mentor
    const { data: reviews, error } = await supabase.from("reviews").select("rating").eq("mentor_id", mentorId)

    if (error || !reviews) return

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    // Update mentor rating
    await supabase
      .from("mentors")
      .update({
        rating: averageRating,
        review_count: reviews.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mentorId)
  } catch (error) {
    console.error("Error updating mentor rating:", error)
  }
}

// Create booking
export async function createBooking(bookingData: {
  clientId: string
  mentorId: string
  serviceId: string
  date: string
  time: string
  paymentIntentId: string
}) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          client_id: bookingData.clientId,
          mentor_id: bookingData.mentorId,
          service_id: bookingData.serviceId,
          date: bookingData.date,
          time: bookingData.time,
          payment_intent_id: bookingData.paymentIntentId,
          status: "pending",
        },
      ])
      .select()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error creating booking:", error)
    return { data: null, error }
  }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()

    return { data, error }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return { data: null, error }
  }
}

export async function getClientBookings(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        mentors!inner(
          *,
          profiles!inner(*)
        ),
        services(*)
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    return { bookings: data || [], error }
  } catch (error) {
    console.error("Error fetching client bookings:", error)
    return { bookings: [], error }
  }
}

export async function getMentorBookings(mentorId: string) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        profiles!client_id(*),
        services(*)
      `)
      .eq("mentor_id", mentorId)
      .order("created_at", { ascending: false })

    return { bookings: data || [], error }
  } catch (error) {
    console.error("Error fetching mentor bookings:", error)
    return { bookings: [], error }
  }
}

// Add Calendly integration
export async function updateMentorCalendlyUsername(mentorId: string, calendlyUsername: string) {
  try {
    const { data, error } = await supabase
      .from("mentors")
      .update({
        calendly_username: calendlyUsername,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mentorId)

    return { data, error }
  } catch (error) {
    console.error("Error updating Calendly username:", error)
    return { data: null, error }
  }
}

export async function updateServiceCalendlyUrl(serviceId: string, calendlyUrl: string) {
  try {
    const { data, error } = await supabase
      .from("services")
      .update({
        calendly_url: calendlyUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", serviceId)

    return { data, error }
  } catch (error) {
    console.error("Error updating service Calendly URL:", error)
    return { data: null, error }
  }
}

// Add the missing addService function
export async function addService(mentorId: string, service: { name: string; description: string; price: number }) {
  try {
    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          mentor_id: mentorId,
          name: service.name,
          description: service.description,
          price: service.price,
        },
      ])
      .select()

    return { data, error }
  } catch (error) {
    console.error("Error adding service:", error)
    return { data: null, error }
  }
}

// Add deleteService function
export async function deleteService(serviceId: string) {
  try {
    const { data, error } = await supabase.from("services").delete().eq("id", serviceId).select()

    return { data, error }
  } catch (error) {
    console.error("Error deleting service:", error)
    return { data: null, error }
  }
}

export default supabase
