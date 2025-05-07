"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DollarSign, Loader2 } from "lucide-react"
import { CalendlyEventTypeSelector } from "@/components/calendly-event-type-selector"

interface ServiceFormProps {
  onSubmit: (data: any) => Promise<void>
  initialData?: any
  isSubmitting: boolean
}

export function ServiceForm({ onSubmit, initialData, isSubmitting }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    calendlyEventTypeUri: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        calendlyEventTypeUri: initialData.calendly_event_type_uri || "",
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleCalendlyEventTypeChange = (uri: string) => {
    setFormData((prev) => ({
      ...prev,
      calendlyEventTypeUri: uri,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
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

      <div className="space-y-2">
        <Label htmlFor="calendlyEventType">Calendly Event Type</Label>
        <CalendlyEventTypeSelector value={formData.calendlyEventTypeUri} onChange={handleCalendlyEventTypeChange} />
        <p className="text-xs text-muted-foreground">
          Link this service to a specific Calendly event type for seamless booking.
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Service"}
      </Button>
    </form>
  )
}
