"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Form schema
const guestFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type GuestFormValues = z.infer<typeof guestFormSchema>

interface GuestCheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mentorId: string
  mentorName: string
  serviceId?: string
  serviceName?: string
  servicePrice?: number
  stripePriceId?: string
  date: string | null
  time: string | null
}

export function GuestCheckoutDialog({
  open,
  onOpenChange,
  mentorId,
  mentorName,
  serviceId,
  serviceName,
  servicePrice,
  stripePriceId,
  date,
  time,
}: GuestCheckoutDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  const onSubmit = async (data: GuestFormValues) => {
    if (!serviceId || !date || !time) {
      toast({
        title: "Missing information",
        description: "Please select a service, date, and time",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create a guest checkout session
      const response = await fetch("/api/stripe/guest-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestName: data.name,
          guestEmail: data.email,
          mentorId,
          serviceId,
          serviceName,
          servicePrice,
          stripePriceId,
          date,
          time,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error("Checkout error response:", responseData)
        throw new Error(responseData.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      window.location.href = responseData.url
    } catch (error) {
      console.error("Guest checkout error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong")
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book as Guest</DialogTitle>
          <DialogDescription>Enter your information to book a session with {mentorName}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/30 p-3 rounded-md mt-4">
              <h4 className="font-medium text-sm mb-2">Booking Summary</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span>{serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{date ? new Date(date).toLocaleDateString() : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{time || "Not selected"}</span>
                </div>
                <div className="flex justify-between font-medium pt-1">
                  <span>Total:</span>
                  <span>${servicePrice}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue to Checkout"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
