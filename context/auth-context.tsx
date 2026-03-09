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

/**
 * Session strategy: inactivity-based expiry.
 *
 * - Last activity timestamp written to localStorage on every user interaction.
 * - On app load, if elapsed time > INACTIVITY_LIMIT, user is signed out.
 * - A hard timeout of SESSION_TIMEOUT_MS caps absolute session length
 *   regardless of activity (e.g. leaving a tab open overnight).
 * - A 5s timeout on the initial session check prevents infinite spinner
 *   if Supabase is slow to respond.
 */
const INACTIVITY_LIMIT_MS  = 4 * 60 * 60 * 1000  // 4 hours idle → logout
const SESSION_TIMEOUT_MS   = 12 * 60 * 60 * 1000  // 12 hours absolute max
const SESSION_START_KEY    = "bd_session_start"
const LAST_ACTIVE_KEY      = "bd_last_active"
const AUTH_TIMEOUT_MS      = 5_000                 // 5s before giving up on load

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
  // Check inactivity
  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY)
  if (lastActive && Date.now() - Number(lastActive) > INACTIVITY_LIMIT_MS) {
    return true
  }
  // Check absolute session age
  const sessionStart = localStorage.getItem(SESSION_START_KEY)
  if (sessionStart && Date.now() - Number(sessionStart) > SESSION_TIMEOUT_MS) {
    return true
  }
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
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const activityBound = useRef(false)

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
      if (error) return null
      return data as Profile
    },
    [supabase]
  )

  const logout = useCallback(async () => {
    clearSessionKeys()
    await supabase.auth.signOut()
  }, [supabase])

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

    // Safety net: never spin forever — resolve after 5s regardless
    const timeoutId = setTimeout(() => {
      if (!cancelled) setIsLoading(false)
    }, AUTH_TIMEOUT_MS)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return

      if (session?.user) {
        if (isSessionExpired()) {
          clearSessionKeys()
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        } else {
          initSessionStart()
          recordActivity()
          setUser(session.user)
          const p = await fetchProfile(session.user.id)
          if (!cancelled) setProfile(p)
        }
      }

      if (!cancelled) {
        clearTimeout(timeoutId)
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      if (session?.user) {
        initSessionStart()
        recordActivity()
        setUser(session.user)
        const p = await fetchProfile(session.user.id)
        if (!cancelled) setProfile(p)
      } else {
        setUser(null)
        setProfile(null)
      }
      clearTimeout(timeoutId)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

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