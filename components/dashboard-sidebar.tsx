"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Trophy,
  User,
  Briefcase,
  RefreshCw,
} from "lucide-react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isConsultant = user?.role === "consultant"

  const consultantLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/activities", label: "Activities", icon: Briefcase },
    { href: "/dashboard/awards", label: "Awards", icon: Trophy },
    { href: "/dashboard/essays", label: "Essays", icon: FileText },
    { href: "/dashboard/services", label: "Services", icon: BarChart3 },
    { href: "/dashboard/calendly", label: "Calendly Setup", icon: Calendar },
    { href: "/dashboard/calendly-reconnect", label: "Reconnect Calendly", icon: RefreshCw },
    { href: "/dashboard/sessions", label: "Sessions", icon: Calendar },
  ]

  const clientLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/sessions", label: "My Sessions", icon: Calendar },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const links = isConsultant ? consultantLinks : clientLinks

  return (
    <div className="w-64 bg-muted/40 border-r min-h-screen p-4">
      <div className="flex items-center mb-8 px-2">
        <Link href="/" className="flex items-center">
          <span className="font-bold text-xl">Veridie</span>
        </Link>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
