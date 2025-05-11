"use client"

import type React from "react"
import { getSupabaseClient, resetSupabaseClient } from "@/lib/supabase-client"
import { createContext, useState, useEffect, useCallback } from "react"
import type { User } from "@/lib/types"

// Define the AuthContext type
interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>
  signUp: (userData: Partial<User>, password: string) => Promise<{ success: boolean; error?: any }>
  signOut: () => Promise<{ success: boolean; error?: any }>
  loading: boolean
  refreshSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Function to fetch user profile with proper error handling
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabaseClient()

      // Use a custom fetch to handle rate limiting and other errors
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
        {
          method: "GET",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
        },
      )

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error fetching profile (${response.status}):`, errorText)

        // If rate limited, wait and retry
        if (response.status === 429) {
          console.log("Rate limited, waiting before retry...")
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return await fetchUserProfile(userId) // Retry once after waiting
        }

        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      // Only parse JSON if response is OK
      const profiles = await response.json()

      if (!profiles || profiles.length === 0) {
        console.error("No profile found for user:", userId)
        return null
      }

      return profiles[0]
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      return null
    }
  }, [])

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      console.log("Refreshing session...")
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Error refreshing session:", error)
        setUser(null)
        return
      }

      if (data.session?.user) {
        const profile = await fetchUserProfile(data.session.user.id)

        if (profile) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || "",
            name: profile.name || "",
            role: profile.role || "client",
            avatar: profile.avatar || "",
          })
        } else {
          console.log("No profile found during refresh, logging out")
          await supabase.auth.signOut()
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error in refreshSession:", error)
      setUser(null)
    }
  }, [fetchUserProfile])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const supabase = getSupabaseClient()

        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          if (mounted) {
            setLoading(false)
            setAuthInitialized(true)
          }
          return
        }

        if (sessionData?.session?.user) {
          try {
            const profile = await fetchUserProfile(sessionData.session.user.id)

            if (profile && mounted) {
              setUser({
                id: sessionData.session.user.id,
                email: sessionData.session.user.email || "",
                name: profile.name || "",
                role: profile.role || "client",
                avatar: profile.avatar || "",
              })
            }
          } catch (profileError) {
            console.error("Error fetching profile during initialization:", profileError)
          }
        }

        if (mounted) {
          setLoading(false)
          setAuthInitialized(true)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        if (mounted) {
          setLoading(false)
          setAuthInitialized(true)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [fetchUserProfile])

  // Set up auth state change listener
  useEffect(() => {
    if (!authInitialized) return

    const supabase = getSupabaseClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_IN" && session?.user) {
        try {
          const profile = await fetchUserProfile(session.user.id)

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
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        setUser(null)
      } else if (event === "TOKEN_REFRESHED") {
        if (session?.user) {
          try {
            const profile = await fetchUserProfile(session.user.id)

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
            console.error("Error fetching profile on token refresh:", error)
          }
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [authInitialized, fetchUserProfile])

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login failed:", error)
        return { success: false, error }
      }

      if (data.user) {
        try {
          const profile = await fetchUserProfile(data.user.id)

          if (!profile) {
            return { success: false, error: new Error("Profile not found") }
          }

          setUser({
            id: data.user.id,
            email: data.user.email || "",
            name: profile.name || "",
            role: profile.role || "client",
            avatar: profile.avatar || "",
          })

          console.log("Login successful, redirecting based on role:", profile.role)

          // Use a small timeout to ensure state is updated before redirect
          setTimeout(() => {
            if (profile.role === "consultant") {
              window.location.href = "/dashboard"
            } else {
              window.location.href = "/mentors"
            }
          }, 100)

          return { success: true }
        } catch (profileError) {
          console.error("Error fetching profile after login:", profileError)
          return { success: false, error: profileError }
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

      const supabase = getSupabaseClient()

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
          email: data.user.email || "",
          name: userData.name || "",
          role: userData.role || "client",
          avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
        })

        // Use a small timeout to ensure state is updated before redirect
        setTimeout(() => {
          if (userData.role === "consultant") {
            window.location.href = "/onboarding"
          } else {
            window.location.href = "/mentors"
          }
        }, 100)

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
      const supabase = getSupabaseClient()

      // Clear any local storage items
      localStorage.removeItem("supabase.auth.token")

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
        return { success: false, error }
      }

      // Reset user state
      setUser(null)

      // Reset the Supabase client to clear any cached state
      resetSupabaseClient()

      // Force a full page reload to clear any cached state
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
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
