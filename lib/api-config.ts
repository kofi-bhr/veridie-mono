// API configuration and utilities

// Access the API key from environment variables (server-side only)
export const apiKey = process.env.API_KEY

// Base URL for API calls (can be used client-side)
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

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
