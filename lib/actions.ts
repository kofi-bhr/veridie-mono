"use server"

import { revalidatePath } from "next/cache"
import {
  addReview as supabaseAddReview,
  createBooking,
  updateAvailability as supabaseUpdateAvailability,
  updateMentorProfile as supabaseUpdateMentorProfile,
  addActivity as supabaseAddActivity,
  addAward as supabaseAddAward,
  addEssay as supabaseAddEssay,
  addService as supabaseAddService,
  deleteActivity as supabaseDeleteActivity,
} from "./supabase"
import type { Review } from "./types"
// Function to add a new review
export async function addReview(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const mentorId = formData.get("mentorId") as string
    const clientId = (formData.get("clientId") as string) || null
    const name = formData.get("name") as string
    const rating = Number.parseInt(formData.get("rating") as string)
    const service = formData.get("service") as string
    const text = formData.get("text") as string

    // Validate inputs
    if (!mentorId || !name || !rating || !service || !text) {
      return { success: false, message: "All fields are required" }
    }

    const { data, error } = await supabaseAddReview({
      mentorId,
      clientId,
      name,
      rating,
      service,
      text,
    })

    if (error) {
      throw error
    }

    // Revalidate the mentor page to show the new review
    revalidatePath(`/mentors/${mentorId}`)

    return { success: true, message: "Review submitted successfully" }
  } catch (error) {
    console.error("Error adding review:", error)
    return { success: false, message: "Failed to submit review" }
  }
}

// Function to book a session
export async function bookSession(
  formData: FormData,
): Promise<{ success: boolean; message: string; bookingId?: string }> {
  try {
    const mentorId = formData.get("mentorId") as string
    const clientId = formData.get("clientId") as string
    const serviceId = formData.get("serviceId") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const paymentIntentId = (formData.get("paymentIntentId") as string) || null

    // Validate inputs
    if (!mentorId || !clientId || !serviceId || !date || !time) {
      return { success: false, message: "All fields are required" }
    }

    const { data, error } = await createBooking({
      clientId,
      mentorId,
      serviceId,
      date,
      time,
      paymentIntentId,
    })

    if (error) {
      throw error
    }

    // Revalidate relevant paths
    revalidatePath(`/mentors/${mentorId}`)
    revalidatePath(`/dashboard`)

    return {
      success: true,
      message: "Session booked successfully",
      bookingId: data?.[0]?.id,
    }
  } catch (error) {
    console.error("Error booking session:", error)
    return { success: false, message: "Failed to book session" }
  }
}

// Function to get reviews for a mentor
export async function getReviews(mentorId: string): Promise<Review[]> {
  // In a real app, this would fetch from a database
  // For now, we'll filter the sample data
  return []
}

// Function to get a mentor by ID
export async function getMentor(mentorId: string) {
  // In a real app, this would fetch from a database
  // For now, we'll filter the sample data
  return null
}

// Function to update mentor availability
export async function updateAvailability(
  mentorId: string,
  availability: { day: string; slots: string[] }[],
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabaseUpdateAvailability(mentorId, availability)

    if (error) {
      throw error
    }

    // Revalidate paths
    revalidatePath(`/mentors/${mentorId}`)
    revalidatePath(`/dashboard`)

    return { success: true, message: "Availability updated successfully" }
  } catch (error) {
    console.error("Error updating availability:", error)
    return { success: false, message: "Failed to update availability" }
  }
}

// Function to update mentor profile
export async function updateMentorProfile(
  mentorId: string,
  profileData: any,
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabaseUpdateMentorProfile(mentorId, profileData)

    if (error) {
      throw error
    }

    // Revalidate paths
    revalidatePath(`/mentors/${mentorId}`)
    revalidatePath(`/dashboard`)
    revalidatePath(`/dashboard/profile`)

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, message: "Failed to update profile" }
  }
}

// Function to add a new activity
export async function addActivity(
  mentorId: string,
  activity: { title: string; organization: string; years: string; description: string },
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabaseAddActivity(mentorId, activity)

    if (error) {
      throw error
    }

    // Revalidate paths
    revalidatePath(`/mentors/${mentorId}`)
    revalidatePath(`/dashboard/activities`)

    return { success: true, message: "Activity added successfully" }
  } catch (error) {
    console.error("Error adding activity:", error)
    return { success: false, message: "Failed to add activity" }
  }
}

// Function to add a new award
export async function addAward(
  mentorId: string,
  award: { title: string; issuer: string; year: string; description: string },
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabaseAddAward(mentorId, award)

    if (error) {
      throw error
    }

    // Revalidate paths
    revalidatePath(`/mentors/${mentorId}`)
    revalidatePath(`/dashboard/awards`)

    return { success: true, message: "Award added successfully" }
  } catch (error) {
    console.error("Error adding award:", error)
    return { success: false, message: "Failed to add award" }
  }
}

// Function to add a new essay
export async function addEssay(
  mentorId: string,
  essay: { title: string; prompt: string; text: string; university: string },
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabaseAddEssay(mentorId, essay)

    if (error) {
      throw error
    }

    // Revalidate paths
    revalidatePath(`/mentors/${mentorId}`)
    revalidatePath(`/dashboard/essays`)

    return { success: true, message: "Essay added successfully" }
  } catch (error) {
    console.error("Error adding essay:", error)
    return { success: false, message: "Failed to add essay" }
  }
}

// Function to add a new service
export async function addService(
  mentorId: string,
  service: { name: string; description: string; price: number },
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabaseAddService(mentorId, service)

    if (error) {
      throw error
    }

    // Revalidate paths
    revalidatePath(`/mentors/${mentorId}`)
    revalidatePath(`/dashboard/services`)

    return { success: true, message: "Service added successfully" }
  } catch (error) {
    console.error("Error adding service:", error)
    return { success: false, message: "Failed to add service" }
  }
}

// Function to delete an activity
export async function deleteActivity(
  mentorId: string,
  activityId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabaseDeleteActivity(activityId)

    if (error) {
      throw error
    }

    // Revalidate paths
    revalidatePath(`/mentors/${mentorId}`)
    revalidatePath(`/dashboard/activities`)

    return { success: true, message: "Activity deleted successfully" }
  } catch (error) {
    console.error("Error deleting activity:", error)
    return { success: false, message: "Failed to delete activity" }
  }
}
