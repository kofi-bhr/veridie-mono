"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AuthDebug() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return <div className="p-4 bg-yellow-100 rounded">Loading authentication status...</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="text-lg font-bold mb-2">Auth Debug</h2>
      {user ? (
        <div>
          <p>Logged in as: {user.email}</p>
          <p>Name: {user.name}</p>
          <p>Role: {user.role}</p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            <Button onClick={() => router.push("/mentors")}>Go to Mentors</Button>
          </div>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  )
}
