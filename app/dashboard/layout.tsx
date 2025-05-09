"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  return (
    <AuthGuard>
      <div className="flex min-h-screen relative">
        {/* Mobile sidebar toggle button */}
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 rounded-full shadow-md bg-background"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        )}

        {/* Sidebar with conditional classes for mobile */}
        <div
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            transition-transform duration-300 ease-in-out
            fixed md:relative z-40 md:z-0 h-full md:translate-x-0
          `}
        >
          <DashboardSidebar onLinkClick={() => isMobile && setSidebarOpen(false)} />
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* Main content area with padding adjustment for mobile */}
        <div
          className={`
          flex-1 p-4 md:p-6 
          ${isMobile ? "pt-16" : ""} 
          ${isMobile && sidebarOpen ? "opacity-50" : "opacity-100"}
          transition-opacity duration-300
        `}
        >
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
