"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

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

  return null
}
