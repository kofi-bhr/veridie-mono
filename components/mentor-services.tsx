"use client"

interface Service {
  id: string
  name: string
  description: string
  price: number
}

interface MentorServicesProps {
  services: Service[]
  onSelectService?: (service: Service) => void
  selectedService?: Service | null
}

export function MentorServices({ services, onSelectService, selectedService }: MentorServicesProps) {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No services available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div
          key={service.id}
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedService?.id === service.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
          }`}
          onClick={() => onSelectService && onSelectService(service)}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{service.name}</h3>
            <span className="font-bold">${service.price}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
        </div>
      ))}
    </div>
  )
}
