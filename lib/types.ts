// User types
export interface User {
  id: string
  name: string
  email: string
  role: "consultant" | "client"
  avatar?: string
}

// Mentor types
export interface Mentor {
  id: string
  name: string
  title: string
  university: string
  bio: string
  avatar?: string
  rating: number
  reviewCount: number
  specialties: string[]
  languages: string[]
  activities?: {
    title: string
    organization: string
    years: string
    description: string
  }[]
  awards?: {
    title: string
    issuer: string
    year: string
    description: string
  }[]
  essays?: {
    title: string
    prompt: string
    text: string
    university: string
  }[]
  education: {
    degree: string
    university: string
    years: string
    description: string
  }[]
  certifications?: {
    name: string
    year: string
  }[]
  successStories?: {
    student: string
    university: string
    year: string
    description: string
  }[]
  services: {
    name: string
    description: string
    price: number
    stripeProductId?: string
    stripePriceId?: string
    calendlyUrl?: string
  }[]
  availability: {
    day: string
    slots: string[]
  }[]
  experience?: {
    title: string
    company: string
    years: string
    description: string
  }[]
  stripeConnectAccountId?: string
  calendlyUsername?: string
}

// Testimonial type
export interface Testimonial {
  id: string
  name: string
  avatar?: string
  text: string
  rating: number
  university: string
  graduationYear: number
}

// Review type
export interface Review {
  id: string
  mentorId: string
  name: string
  avatar?: string
  rating: number
  date: string
  service: string
  text: string
}

// Service type
export interface Service {
  id: string
  name: string
  description: string
  price: number
  stripeProductId?: string
  stripePriceId?: string
  calendlyUrl?: string
}

// Booking type
export interface Booking {
  id: string
  clientId: string
  mentorId: string
  serviceId: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  stripePaymentIntentId?: string
  stripeTransferId?: string
  calendlyEventUri?: string
}

// Message type
export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

// Availability type
export interface TimeSlot {
  id: string
  mentorId: string
  date: string
  time: string
  isBooked: boolean
}

// Stripe Connect Account type
export interface StripeConnectAccount {
  id: string
  userId: string
  stripeAccountId: string
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  createdAt: string
  updatedAt: string
}
