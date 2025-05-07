"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Loader2, PlusCircle } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Maximum number of activities allowed per consultant
const MAX_ACTIVITIES = 10

export default function ActivitiesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    years: "",
    description: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (user?.id) {
      checkTableAndFetchActivities()
    }
  }, [user?.id])

  const checkTableAndFetchActivities = async () => {
    setIsLoading(true)
    try {
      // First check if the activities table exists
      const { error: tableError } = await supabase.from("activities").select("count").limit(1)

      if (tableError && tableError.message.includes("does not exist")) {
        console.log("Activities table does not exist")
        setTableExists(false)
        setIsLoading(false)
        return
      }

      // If we get here, the table exists, so fetch activities
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("mentor_id", user.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      setActivities(data || [])
      setTableExists(true)
    } catch (error) {
      console.error("Error fetching activities:", error)
      toast({
        title: "Error",
        description: "Failed to load your activities. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createActivitiesTable = async () => {
    try {
      // Call the API endpoint to create the activities table
      const response = await fetch("/api/setup-mentor-tables", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create activities table")
      }

      toast({
        title: "Success",
        description: "Activities table created successfully. You can now add activities.",
      })

      setTableExists(true)
    } catch (error) {
      console.error("Error creating activities table:", error)
      toast({
        title: "Error",
        description: "Failed to create activities table. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Check if the user has reached the maximum number of activities
      if (activities.length >= MAX_ACTIVITIES) {
        throw new Error(
          `You can only add up to ${MAX_ACTIVITIES} activities. Please delete some existing activities first.`,
        )
      }

      // Validate form data
      if (!formData.title || !formData.organization || !formData.years || !formData.description) {
        throw new Error("All fields are required")
      }

      // Create activity with detailed logging
      console.log("Creating activity with data:", {
        mentor_id: user.id,
        title: formData.title,
        organization: formData.organization,
        years: formData.years,
        description: formData.description,
      })

      const { data, error } = await supabase
        .from("activities")
        .insert([
          {
            mentor_id: user.id,
            title: formData.title,
            organization: formData.organization,
            years: formData.years,
            description: formData.description,
            created_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) {
        console.error("Supabase error details:", error)
        throw error
      }

      console.log("Activity created successfully:", data)

      toast({
        title: "Activity added",
        description: "Your activity has been added successfully",
      })

      setFormData({
        title: "",
        organization: "",
        years: "",
        description: "",
      })

      setDialogOpen(false)
      checkTableAndFetchActivities()
    } catch (error) {
      console.error("Error adding activity:", error)
      toast({
        title: "Failed to add activity",
        description: error.message || "There was an error adding your activity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const { error } = await supabase.from("activities").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Activity deleted",
        description: "Your activity has been deleted successfully",
      })

      checkTableAndFetchActivities()
    } catch (error) {
      console.error("Error deleting activity:", error)
      toast({
        title: "Failed to delete activity",
        description: "There was an error deleting your activity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!user || user.role !== "consultant") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  if (!tableExists) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Activities</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
            <CardDescription>The activities table does not exist in your database yet.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <p>You need to set up the activities table before you can add activities.</p>
            <Button onClick={createActivitiesTable}>Create Activities Table</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasReachedLimit = activities.length >= MAX_ACTIVITIES

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Activities</h1>
        <div>
          {hasReachedLimit && (
            <p className="text-sm text-amber-600 mb-2">
              You have reached the maximum of {MAX_ACTIVITIES} activities. Delete some to add more.
            </p>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={hasReachedLimit}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
                <DialogDescription>
                  Add details about your extracurricular activities, leadership roles, or work experience.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Position/Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., President, Research Assistant"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization/Company</Label>
                  <Input
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science Club, Research Lab"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years">Time Period</Label>
                  <Input
                    id="years"
                    name="years"
                    value={formData.years}
                    onChange={handleChange}
                    placeholder="e.g., 2021-Present, Fall 2022"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your responsibilities, achievements, and impact"
                    rows={3}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Activity"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : activities.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No activities added yet. Click "Add Activity" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity: any) => (
            <Card key={activity.id} className="bg-[#1C2127] border-0">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{activity.title}</CardTitle>
                    <CardDescription className="text-gray-300">{activity.organization}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(activity.id)}
                    disabled={isDeleting}
                    className="text-white hover:text-white hover:bg-gray-800"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete activity</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 mb-2">{activity.years}</p>
                <p className="text-white">{activity.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
