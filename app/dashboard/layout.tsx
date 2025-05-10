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
      <div className="flex flex-col min-h-screen">
        {/* Mobile sidebar toggle bar */}
        {isMobile && (
          <div className="sticky top-0 z-30 w-full bg-background border-b shadow-sm px-4 py-2 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-sm font-medium"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span>{sidebarOpen ? "Close Menu" : "Menu"}</span>
            </Button>
            <div className="ml-auto font-semibold">Dashboard</div>
          </div>
        )}

        <div className="flex flex-1 relative">
          {/* Sidebar with conditional classes for mobile */}
          <div
            className={`
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
              transition-transform duration-300 ease-in-out
              fixed md:relative z-40 md:z-0 h-[calc(100vh-3rem)] md:h-auto md:min-h-screen md:translate-x-0
              top-[3rem] md:top-0
            `}
          >
            <DashboardSidebar onLinkClick={() => isMobile && setSidebarOpen(false)} />
          </div>

          {/* Overlay for mobile when sidebar is open */}
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-30 top-[3rem]"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Main content area */}
          <div
            className={`
              flex-1 p-4 md:p-6 
              ${isMobile && sidebarOpen ? "opacity-50" : "opacity-100"}
              transition-opacity duration-300
            `}
          >
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
