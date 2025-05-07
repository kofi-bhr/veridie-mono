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

export default function AwardsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [awards, setAwards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    year: "",
    description: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (user?.id) {
      checkTableAndFetchAwards()
    }
  }, [user?.id])

  const checkTableAndFetchAwards = async () => {
    setIsLoading(true)
    try {
      // First check if the awards table exists
      const { error: tableError } = await supabase.from("awards").select("count").limit(1)

      if (tableError && tableError.message.includes("does not exist")) {
        console.log("Awards table does not exist")
        setTableExists(false)
        setIsLoading(false)
        return
      }

      // If we get here, the table exists, so fetch awards
      const { data, error } = await supabase
        .from("awards")
        .select("*")
        .eq("mentor_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setAwards(data || [])
      setTableExists(true)
    } catch (error) {
      console.error("Error fetching awards:", error)
      toast({
        title: "Error",
        description: "Failed to load your awards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createAwardsTable = async () => {
    try {
      // Call the API endpoint to create the awards table
      const response = await fetch("/api/setup-mentor-tables", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create awards table")
      }

      toast({
        title: "Success",
        description: "Awards table created successfully. You can now add awards.",
      })

      setTableExists(true)
    } catch (error) {
      console.error("Error creating awards table:", error)
      toast({
        title: "Error",
        description: "Failed to create awards table. Please try again.",
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
      // Validate form data
      if (!formData.title || !formData.issuer || !formData.year || !formData.description) {
        throw new Error("All fields are required")
      }

      // Create award with detailed logging
      console.log("Creating award with data:", {
        mentor_id: user.id,
        title: formData.title,
        issuer: formData.issuer,
        year: formData.year,
        description: formData.description,
      })

      const { data, error } = await supabase
        .from("awards")
        .insert([
          {
            mentor_id: user.id,
            title: formData.title,
            issuer: formData.issuer,
            year: formData.year,
            description: formData.description,
            created_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) {
        console.error("Supabase error details:", error)
        throw error
      }

      console.log("Award created successfully:", data)

      toast({
        title: "Award added",
        description: "Your award has been added successfully",
      })

      setFormData({
        title: "",
        issuer: "",
        year: "",
        description: "",
      })

      setDialogOpen(false)
      checkTableAndFetchAwards()
    } catch (error) {
      console.error("Error adding award:", error)
      toast({
        title: "Failed to add award",
        description: error.message || "There was an error adding your award. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const { error } = await supabase.from("awards").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Award deleted",
        description: "Your award has been deleted successfully",
      })

      checkTableAndFetchAwards()
    } catch (error) {
      console.error("Error deleting award:", error)
      toast({
        title: "Failed to delete award",
        description: "There was an error deleting your award. Please try again.",
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
          <h1 className="text-3xl font-bold">Awards</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
            <CardDescription>The awards table does not exist in your database yet.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <p>You need to set up the awards table before you can add awards.</p>
            <Button onClick={createAwardsTable}>Create Awards Table</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Awards</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Award
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Award</DialogTitle>
              <DialogDescription>Add details about awards, honors, or recognition you've received.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Award Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Dean's List, National Merit Scholar"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer">Issuing Organization</Label>
                <Input
                  id="issuer"
                  name="issuer"
                  value={formData.issuer}
                  onChange={handleChange}
                  placeholder="e.g., University, Professional Organization"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year Received</Label>
                <Input
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g., 2022, 2020-2023"
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
                  placeholder="Describe the award and its significance"
                  rows={3}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Award"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : awards.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No awards added yet. Click "Add Award" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          awards.map((award: any) => (
            <Card key={award.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{award.title}</CardTitle>
                    <CardDescription>{award.issuer}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(award.id)} disabled={isDeleting}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete award</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{award.year}</p>
                <p>{award.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
