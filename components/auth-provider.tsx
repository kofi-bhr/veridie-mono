"use client"

import type React from "react"

// Update the import at the top to use our new client
import { supabase } from "@/lib/supabase-client"
import { createContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"

// Define the AuthContext type
interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>
  signUp: (userData: Partial<User>, password: string) => Promise<{ success: boolean; error?: any }>
  signOut: () => Promise<{ success: boolean; error?: any }>
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on initial load
  useEffect(() => {
    // Update the fetchUser function in the useEffect to properly handle your database structure
    const fetchUser = async () => {
      try {
        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Get the user profile data
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              name: profile.name || "",
              role: profile.role || "client",
              avatar: profile.avatar || "",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        try {
          // Get the user profile data
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              name: profile.name || "",
              role: profile.role || "client",
              avatar: profile.avatar || "",
            })
          }
        } catch (error) {
          console.error("Error fetching user profile on auth change:", error)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login failed:", error)
        return { success: false, error }
      }

      if (data.user) {
        // Get the user profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          return { success: false, error: profileError }
        }

        if (profile) {
          setUser({
            id: data.user.id,
            email: data.user.email || "",
            name: profile.name || "",
            role: profile.role || "client",
            avatar: profile.avatar || "",
          })

          // Add console log to debug
          console.log("Login successful, redirecting based on role:", profile.role)

          // Force navigation using window.location for a full page refresh
          if (profile.role === "consultant") {
            window.location.href = "/dashboard"
          } else {
            window.location.href = "/mentors"
          }

          return { success: true }
        } else {
          return { success: false, error: new Error("Profile not found") }
        }
      }

      return { success: false, error: new Error("User not found") }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (userData: Partial<User>, password: string) => {
    setLoading(true)
    try {
      if (!userData.email) {
        return { success: false, error: new Error("Email is required") }
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
        },
      })

      if (error) {
        return { success: false, error }
      }

      if (data.user) {
        // Insert the user profile data
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            name: userData.name || "",
            email: userData.email,
            role: userData.role || "client",
            avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (profileError) {
          return { success: false, error: profileError }
        }

        // If the user is a consultant, create a mentor profile
        if (userData.role === "consultant") {
          const { error: mentorError } = await supabase.from("mentors").insert([
            {
              id: data.user.id,
              title: "",
              university: "",
              bio: "",
              rating: 0,
              review_count: 0,
              languages: [],
              created_at: new Date().toISOString(),
            },
          ])

          if (mentorError) {
            console.error("Error creating mentor profile:", mentorError)
            // Continue anyway, we can create the mentor profile later
          }
        }

        setUser({
          id: data.user.id,
          email: userData.email || "",
          name: userData.name || "",
          role: userData.role || "client",
          avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
        })

        // Use window.location for a full page refresh
        if (userData.role === "consultant") {
          window.location.href = "/onboarding"
        } else {
          window.location.href = "/mentors"
        }

        return { success: true }
      }

      return { success: false, error: new Error("Failed to create user") }
    } catch (error) {
      console.error("Registration failed:", error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { success: false, error }
      }

      setUser(null)
      window.location.href = "/"
      return { success: true }
    } catch (error) {
      console.error("Sign out failed:", error)
      return { success: false, error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
