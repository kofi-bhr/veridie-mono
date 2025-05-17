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
  Upload,
} from "lucide-react"

interface DashboardSidebarProps {
  onLinkClick?: () => void
  className?: string
}

export function DashboardSidebar({ onLinkClick, className }: DashboardSidebarProps) {
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
    { href: "/dashboard/sessions", label: "Sessions", icon: Calendar },
    { href: "/dashboard/common-app", label: "Common App", icon: Upload },
  ]

  const clientLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/sessions", label: "My Sessions", icon: Calendar },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const links = isConsultant ? consultantLinks : clientLinks

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick()
    }
  }

  return (
    <div className={cn("w-full h-full flex flex-col bg-white dark:bg-gray-950", className)}>
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
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

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
