"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Service {
  id: string
  name: string
  description: string
  price: number
  stripe_price_id?: string
}

interface MentorServicesProps {
  services: Service[]
  onSelectService: (serviceId: string) => void
}

export function MentorServices({ services, onSelectService }: MentorServicesProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const handleServiceChange = (value: string) => {
    setSelectedService(value)
    onSelectService(value)
  }

  if (!services || services.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">This consultant hasn't added any services yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <RadioGroup value={selectedService || ""} onValueChange={handleServiceChange}>
      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.id} className="flex items-start space-x-2">
            <RadioGroupItem value={service.name} id={service.id} className="mt-1" />
            <Label htmlFor={service.id} className="flex-1 cursor-pointer">
              <Card className={`border ${selectedService === service.name ? "border-primary" : ""}`}>
                <CardHeader className="py-4">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    <CardDescription className="text-base font-medium">${service.price.toFixed(2)}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  )
}
