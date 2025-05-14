"use client"

import { useState, useEffect, useRef } from "react"
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
  const sidebarRef = useRef<HTMLDivElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  // Ensure sidebar reaches bottom of screen
  useEffect(() => {
    const updateSidebarHeight = () => {
      if (!sidebarRef.current) return

      // For mobile: position from top of navbar to bottom of screen
      if (isMobile) {
        const navbarHeight = 64 // 4rem
        const windowHeight = window.innerHeight
        sidebarRef.current.style.height = `${windowHeight - navbarHeight}px`
        sidebarRef.current.style.bottom = "0"
      }
      // For desktop: fill entire height
      else {
        sidebarRef.current.style.height = "100vh"
        sidebarRef.current.style.bottom = "auto"
      }
    }

    // Run immediately and on resize
    updateSidebarHeight()
    window.addEventListener("resize", updateSidebarHeight)

    // Force a reflow to ensure height is applied
    if (sidebarRef.current) {
      sidebarRef.current.style.display = "none"
      void sidebarRef.current.offsetHeight // Force reflow
      sidebarRef.current.style.display = "flex"
    }

    return () => window.removeEventListener("resize", updateSidebarHeight)
  }, [isMobile])

  return (
    <AuthGuard>
      <div ref={layoutRef} className="flex min-h-screen w-full overflow-hidden">
        {/* Floating menu button for mobile */}
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground border-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}

        {/* Sidebar with conditional classes for mobile */}
        <div
          ref={sidebarRef}
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            transition-all duration-300 ease-in-out
            fixed md:sticky md:top-0 md:left-0 md:translate-x-0
            top-16 left-0 w-[85%] max-w-[300px] md:w-64
            ${isMobile ? "shadow-xl" : ""}
            flex flex-col overflow-hidden
            bg-white dark:bg-gray-950 border-r
            z-40 md:z-30
          `}
          style={{ height: isMobile ? "calc(100vh - 64px)" : "100vh" }}
        >
          <DashboardSidebar
            onLinkClick={() => isMobile && setSidebarOpen(false)}
            className="h-full flex-1 flex flex-col"
          />
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 top-16"
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
            min-h-screen
          `}
        >
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
