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
import { Trash2, DollarSign, Loader2, PlusCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { StripeConnectButton } from "@/components/stripe-connect-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ServicesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stripeAccount, setStripeAccount] = useState<any>(null)
  const [isLoadingStripe, setIsLoadingStripe] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchServices()
      fetchStripeAccount()
    }
  }, [user?.id])

  const fetchStripeAccount = async () => {
    try {
      const { data, error } = await supabase
        .from("mentors")
        .select(
          "stripe_connect_accounts, stripe_account_details_submitted, stripe_account_charges_enabled, stripe_account_payouts_enabled",
        )
        .eq("id", user.id)
        .single()

      if (error) throw error

      if (data?.stripe_connect_accounts) {
        setStripeAccount({
          id: data.stripe_connect_accounts,
          detailsSubmitted: data.stripe_account_details_submitted,
          chargesEnabled: data.stripe_account_charges_enabled,
          payoutsEnabled: data.stripe_account_payouts_enabled,
        })
      }
    } catch (error) {
      console.error("Error fetching Stripe account:", error)
    } finally {
      setIsLoadingStripe(false)
    }
  }

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("mentor_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Error",
        description: "Failed to load your services. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create service with Stripe product
      const response = await fetch("/api/stripe/create-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorId: user.id,
          name: formData.name,
          description: formData.description,
          price: formData.price,
        }),
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error (${response.status}): ${errorText}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Service added",
        description: "Your service has been added successfully",
      })

      setFormData({
        name: "",
        description: "",
        price: 0,
      })

      setDialogOpen(false)
      fetchServices()
    } catch (error) {
      console.error("Error adding service:", error)
      toast({
        title: "Failed to add service",
        description:
          error instanceof Error ? error.message : "There was an error adding your service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      // Delete service and associated Stripe product
      const response = await fetch(`/api/stripe/delete-service?serviceId=${id}`, {
        method: "DELETE",
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Server returned error (${response.status}):`, errorText)
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}...`)
      }

      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError)
        throw new Error("Invalid response from server")
      }

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Service deleted",
        description: "Your service has been deleted successfully",
      })

      fetchServices()
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: "Failed to delete service",
        description:
          error instanceof Error ? error.message : "There was an error deleting your service. Please try again.",
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

  if (isLoadingStripe) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If Stripe account is not connected, show connect button
  if (!stripeAccount) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Services & Pricing</h1>
        <Card>
          <CardHeader>
            <CardTitle>Connect Stripe to Add Services</CardTitle>
            <CardDescription>
              You need to connect your Stripe account before you can add services and receive payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Stripe Account Required</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              To receive payments from students, you need to connect your Stripe account. This allows us to transfer
              funds directly to your bank account.
            </p>
            <StripeConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services & Pricing</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>Create a new service offering with pricing for students.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Essay Review, Application Strategy Session"
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
                  placeholder="Describe what's included in this service"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll receive 80% (${(formData.price * 0.8).toFixed(2)}) after the 20% platform fee.
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Service"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Pricing</CardTitle>
            <CardDescription>
              Set competitive prices for your services. Remember that Veridie takes a 20% platform fee, and you'll
              receive 80% of the listed price.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Tips for pricing:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
              <li>Research what other consultants with similar backgrounds are charging</li>
              <li>Consider the time and effort each service requires</li>
              <li>Start with competitive rates to build your review base</li>
              <li>You can adjust your prices at any time</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No services added yet. Click "Add Service" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          services.map((service: any) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>${service.price.toFixed(2)}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} disabled={isDeleting}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete service</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{service.description}</p>
                <div className="text-sm text-muted-foreground">
                  <p>Your earnings: ${(service.price * 0.8).toFixed(2)} (after 20% platform fee)</p>
                  {service.stripe_product_id && <p className="mt-1">Stripe Product ID: {service.stripe_product_id}</p>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
