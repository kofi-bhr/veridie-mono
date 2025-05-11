"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, Home, LogIn } from "lucide-react"
import Link from "next/link"

export default function FallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Veridie</h1>
        <h2 className="text-xl font-semibold mb-4">Application Recovery</h2>

        <p className="mb-6 text-gray-600">
          It seems like you encountered an issue while loading the application. You can try refreshing the page or
          navigate to a specific section.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          <Button onClick={() => window.location.reload()} className="flex items-center justify-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>

          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-center">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>

          <Link href="/auth/login" className="w-full">
            <Button variant="ghost" className="w-full flex items-center justify-center">
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500">If you continue to experience issues, please contact support.</p>
      </div>
    </div>
  )
}
