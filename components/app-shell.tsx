"use client"

import { useAuth } from "@/context/auth-context"
import { Navigation } from "@/components/navigation"
import { Spinner } from "@/components/ui/spinner"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPage = pathname === "/login"

  useEffect(() => {
    if (isLoading) return
    if (!role && !isPublicPage) {
      router.replace("/login")
    }
  }, [role, isLoading, isPublicPage, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner className="h-8 w-8 text-emerald-500" />
      </div>
    )
  }

  if (!role) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <main className="pt-36 md:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}