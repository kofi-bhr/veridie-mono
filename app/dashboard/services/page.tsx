"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Loader2, PlusCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { StripeConnectButton } from "@/components/stripe-connect-button"
import { ServiceForm } from "@/components/service-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
        .order("created_at", { ascending: true })

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

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)

    try {
      // Create service with Stripe product
      const response = await fetch("/api/stripe/create-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          mentorId: user.id,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          calendlyEventTypeUri: formData.calendlyEventTypeUri,
        }),
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Server error: ${response.status}`)
        } else {
          // Not JSON, probably HTML error page
          const errorText = await response.text()
          console.error(`Server returned non-JSON error (${response.status}):`, errorText.substring(0, 200))
          throw new Error(
            `Server error (${response.status}): The API returned an HTML error page instead of JSON. This usually indicates a server-side error.`,
          )
        }
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Service added",
        description: "Your service has been added successfully",
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
        headers: {
          Accept: "application/json",
        },
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Server error: ${response.status}`)
        } else {
          // Not JSON, probably HTML error page
          const errorText = await response.text()
          console.error(`Server returned non-JSON error (${response.status}):`, errorText.substring(0, 200))
          throw new Error(
            `Server error (${response.status}): The API returned an HTML error page instead of JSON. This usually indicates a server-side error.`,
          )
        }
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

  // For development/preview environments, allow bypassing Stripe
  const isDevelopment = process.env.NODE_ENV === "development" || window.location.hostname.includes("vercel.app")

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
  if (!stripeAccount && !isDevelopment) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Services</h1>
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

            {isDevelopment && (
              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() =>
                    setStripeAccount({
                      id: "dev-mode",
                      detailsSubmitted: true,
                      chargesEnabled: true,
                      payoutsEnabled: true,
                    })
                  }
                >
                  Development Mode: Skip Stripe Connect
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This button is only available in development/preview environments.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services</h1>
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
            <ServiceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
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
            <Card key={service.id} className="bg-[#1C2127] border-0">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{service.name}</CardTitle>
                    <CardDescription className="text-gray-300">${service.price.toFixed(2)}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(service.id)}
                    disabled={isDeleting}
                    className="text-white hover:text-white hover:bg-gray-800"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete service</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-white">{service.description}</p>
                <div className="text-sm text-gray-300">
                  <p>Your earnings: ${(service.price * 0.8).toFixed(2)} (after 20% platform fee)</p>
                  {service.stripe_product_id && <p className="mt-1">Stripe Product ID: {service.stripe_product_id}</p>}
                  {service.calendly_event_type_uri && <p className="mt-1">Linked to Calendly event type</p>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
