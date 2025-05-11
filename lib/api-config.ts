// API Configuration
// This file centralizes API configuration and credentials

// API Base URL and Key
export const apiKey = process.env.API_KEY
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

// Calendly API
export const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID || ""
export const CALENDLY_CLIENT_SECRET = process.env.CALENDLY_CLIENT_SECRET || ""

// Base URL
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ""

// Stripe API
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ""
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ""

// Helper function to create headers with the API key (server-side only)
export function createApiHeaders() {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  }
}

// Server-side API call function
export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
  if (!apiKey) {
    throw new Error("API_KEY is not defined")
  }

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined")
  }

  const headers = {
    ...createApiHeaders(),
    ...(options.headers || {}),
  }

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// Client-side API call function (no API key)
export async function fetchFromApiClient(endpoint: string, options: RequestInit = {}) {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined")
  }

  const response = await fetch(`${apiBaseUrl}${endpoint}`, options)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// Check if required credentials are available
export function checkRequiredCredentials() {
  const missing = []

  if (!CALENDLY_CLIENT_ID) missing.push("CALENDLY_CLIENT_ID")
  if (!CALENDLY_CLIENT_SECRET) missing.push("CALENDLY_CLIENT_SECRET")
  if (!STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY")
  if (!STRIPE_PUBLISHABLE_KEY) missing.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")

  return {
    hasAllCredentials: missing.length === 0,
    missingCredentials: missing,
  }
}
