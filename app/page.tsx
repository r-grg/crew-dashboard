"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Spinner } from "@/components/ui/spinner"

export default function HomePage() {
  const router = useRouter()
  const { role, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (role) {
      router.replace("/dashboard")
    } else {
      router.replace("/login")
    }
  }, [role, isLoading, router])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Spinner className="h-8 w-8 text-emerald-500" />
    </div>
  )
}