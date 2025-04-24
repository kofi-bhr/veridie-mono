"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </AuthGuard>
  )
}
