"use client"

import { useState, useEffect } from "react"
import { apiBaseUrl } from "@/lib/api-config"

export function ExternalApiStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function checkApiStatus() {
      try {
        if (!apiBaseUrl) {
          throw new Error("API base URL is not configured")
        }

        // Just check if the API is reachable - no auth needed for status endpoint
        const response = await fetch(`${apiBaseUrl}/status`)

        if (response.ok) {
          setStatus("connected")
          setMessage("Successfully connected to external API")
        } else {
          throw new Error(`Status code: ${response.status}`)
        }
      } catch (error: any) {
        setStatus("error")
        setMessage(`Connection error: ${error.message}`)
      }
    }

    checkApiStatus()
  }, [])

  return (
    <div className="p-4 rounded-lg border">
      <h3 className="text-lg font-medium mb-2">External API Status</h3>
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            status === "loading" ? "bg-yellow-500" : status === "connected" ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span>
          {status === "loading" ? "Checking connection..." : status === "connected" ? "Connected" : "Connection error"}
        </span>
      </div>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
      <div className="mt-2 text-xs text-gray-500">API Base URL: {apiBaseUrl || "Not configured"}</div>
    </div>
  )
}
