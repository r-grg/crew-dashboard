"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  LogOut,
  Shield,
  Eye,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/events", label: "Events", icon: Calendar },
  // { href: "/rankings", label: "Rankings", icon: Trophy },
]

export function Navigation() {
  const pathname = usePathname()
  const { role, logout, isAdmin, user } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CD</span>
              </div>
              <span className="font-semibold text-white hidden sm:block">
                Crew Dashboard
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-zinc-400 hover:text-white hover:bg-zinc-800",
                        isActive && "text-white bg-zinc-800"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden lg:block text-xs text-zinc-500 max-w-40 truncate">
                {user.email}
              </span>
            )}

            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 border-zinc-700",
                isAdmin
                  ? "text-emerald-400 border-emerald-800 bg-emerald-950/50"
                  : "text-sky-400 border-sky-800 bg-sky-950/50"
              )}
            >
              {isAdmin ? (
                <Shield className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
              {role === "admin" ? "Admin" : "Viewer"}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zinc-800">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-col h-auto py-2 px-3 text-zinc-400 hover:text-white hover:bg-zinc-800",
                    isActive && "text-emerald-400 bg-zinc-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
