"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, PlusCircle, Trash2 } from "lucide-react"
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
import { addEssay, deleteEssay } from "@/lib/supabase"

export default function EssaysPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [essays, setEssays] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    text: "",
    university: "",
  })

  useEffect(() => {
    if (user?.id) {
      fetchEssays()
    }
  }, [user?.id])

  const fetchEssays = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("essays")
        .select("*")
        .eq("mentor_id", user.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      setEssays(data || [])
    } catch (error) {
      console.error("Error fetching essays:", error)
      toast({
        title: "Error",
        description: "Failed to load your essays. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await addEssay(user.id, formData)

      if (error) throw error

      toast({
        title: "Essay added",
        description: "Your essay has been added successfully",
      })

      setFormData({
        title: "",
        prompt: "",
        text: "",
        university: "",
      })

      setDialogOpen(false)
      fetchEssays()
    } catch (error) {
      console.error("Error adding essay:", error)
      toast({
        title: "Failed to add essay",
        description: "There was an error adding your essay. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setIsDeleting(true)

    try {
      const { data, error } = await deleteEssay(id)

      if (error) throw error

      toast({
        title: "Essay deleted",
        description: "Your essay has been deleted successfully",
      })

      fetchEssays()
    } catch (error) {
      console.error("Error deleting essay:", error)
      toast({
        title: "Failed to delete essay",
        description: "There was an error deleting your essay. Please try again.",
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">College Essays</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Essay
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Essay</DialogTitle>
              <DialogDescription>
                Share your successful college essays to showcase your writing skills to potential clients.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Essay Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Personal Statement"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="e.g., Harvard University"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Essay Prompt</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  placeholder="The original prompt for this essay"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Essay Text</Label>
                <Textarea
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  placeholder="Paste your essay here"
                  rows={10}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Essay"}
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
        ) : essays.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No essays added yet. Click "Add Essay" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          essays.map((essay) => (
            <Card key={essay.id} className="bg-[#1C2127] border-0">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{essay.title}</CardTitle>
                    <CardDescription className="text-gray-300">{essay.university}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(essay.id)}
                    disabled={isDeleting}
                    className="text-white hover:text-white hover:bg-gray-800"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete essay</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1 text-white">Prompt:</h4>
                  <p className="text-sm text-gray-300">{essay.prompt}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1 text-white">Essay:</h4>
                  <p className="text-sm whitespace-pre-wrap text-white">{essay.text}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
