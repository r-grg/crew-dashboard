"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Profile, Role } from "@/lib/types"

const INACTIVITY_LIMIT_MS = 4 * 60 * 60 * 1000
const SESSION_TIMEOUT_MS  = 12 * 60 * 60 * 1000
const SESSION_START_KEY   = "bd_session_start"
const LAST_ACTIVE_KEY     = "bd_last_active"
const AUTH_TIMEOUT_MS     = 5_000

// Module-level client — created once, never recreated on re-render
const supabase = createClient()

function recordActivity() {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
}

function initSessionStart() {
  if (!localStorage.getItem(SESSION_START_KEY)) {
    localStorage.setItem(SESSION_START_KEY, Date.now().toString())
  }
}

function clearSessionKeys() {
  localStorage.removeItem(LAST_ACTIVE_KEY)
  localStorage.removeItem(SESSION_START_KEY)
}

function isSessionExpired(): boolean {
  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY)
  if (lastActive && Date.now() - Number(lastActive) > INACTIVITY_LIMIT_MS) return true
  const sessionStart = localStorage.getItem(SESSION_START_KEY)
  if (sessionStart && Date.now() - Number(sessionStart) > SESSION_TIMEOUT_MS) return true
  return false
}

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  role: Role | null
  isAdmin: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const activityBound = useRef(false)
  const initialised = useRef(false)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    if (error) return null
    return data as Profile
  }, []) // supabase is stable — no deps needed

  const logout = useCallback(async () => {
    clearSessionKeys()
    setUser(null)
    setProfile(null)
    await supabase.auth.signOut()
  }, [])

  // Bind global activity listeners once
  useEffect(() => {
    if (activityBound.current) return
    activityBound.current = true
    const events = ["mousemove", "keydown", "pointerdown", "touchstart", "scroll"]
    const handler = () => recordActivity()
    events.forEach((ev) => window.addEventListener(ev, handler, { passive: true }))
    return () => events.forEach((ev) => window.removeEventListener(ev, handler))
  }, [])

  useEffect(() => {
    let cancelled = false

    const timeoutId = setTimeout(() => {
      if (!cancelled && !initialised.current) {
        initialised.current = true
        setIsLoading(false)
      }
    }, AUTH_TIMEOUT_MS)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return

      // Don't re-run full auth flow for background token refreshes
      if (event === "TOKEN_REFRESHED") {
        if (!initialised.current) {
          initialised.current = true
          setIsLoading(false)
        }
        return
      }

      if (session?.user) {
        if (isSessionExpired()) {
          clearSessionKeys()
          await supabase.auth.signOut()
          return
        }
        initSessionStart()
        recordActivity()
        setUser(session.user)
        const p = await fetchProfile(session.user.id)
        if (!cancelled) setProfile(p)
      } else {
        setUser(null)
        setProfile(null)
      }

      if (!cancelled) {
        clearTimeout(timeoutId)
        initialised.current = true
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [fetchProfile]) // fetchProfile is now stable too

  const role = profile?.role ?? null
  const isAdmin = role === "admin"

  return (
    <AuthContext.Provider value={{ user, profile, role, isAdmin, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
