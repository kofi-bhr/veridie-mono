"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { CalendlyEventTypeSelector } from "@/components/calendly-event-type-selector"

const serviceFormSchema = z.object({
  name: z.string().min(3, {
    message: "Service name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().min(1, {
    message: "Price must be at least $1.",
  }),
  duration: z.coerce.number().min(15, {
    message: "Duration must be at least 15 minutes.",
  }),
  calendlyEventTypeUri: z.string().optional(),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

interface ServiceFormProps {
  initialData?: {
    id?: string
    name?: string
    description?: string
    price?: number
    duration?: number
    calendly_event_type_uri?: string
  }
}

export function ServiceForm({ initialData }: ServiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<ServiceFormValues> = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 50,
    duration: initialData?.duration || 60,
    calendlyEventTypeUri: initialData?.calendly_event_type_uri || "",
  }

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues,
  })

  async function onSubmit(data: ServiceFormValues) {
    setIsSubmitting(true)

    try {
      const endpoint = initialData?.id
        ? `/api/stripe/update-service?id=${initialData.id}`
        : "/api/stripe/create-service"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          calendlyEventTypeUri: data.calendlyEventTypeUri,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save service")
      }

      toast({
        title: initialData?.id ? "Service updated" : "Service created",
        description: initialData?.id
          ? "Your service has been updated successfully."
          : "Your service has been created successfully.",
      })

      router.push("/dashboard/services")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit Service" : "Create New Service"}</CardTitle>
        <CardDescription>
          {initialData?.id ? "Update your service details below." : "Add a new service that you offer to clients."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., College Essay Review" {...field} />
                  </FormControl>
                  <FormDescription>The name of the service you're offering.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this service includes..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Provide details about what clients can expect from this service.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>The price in USD for this service.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min="15" step="15" {...field} />
                    </FormControl>
                    <FormDescription>How long this service typically takes.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="calendlyEventTypeUri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calendly Event Type</FormLabel>
                  <FormControl>
                    <CalendlyEventTypeSelector
                      value={field.value}
                      onChange={field.onChange}
                      onDurationChange={(duration) => form.setValue("duration", duration)}
                    />
                  </FormControl>
                  <FormDescription>
                    Link this service to a specific Calendly event type for automatic scheduling.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/services")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData?.id ? "Update Service" : "Create Service"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
