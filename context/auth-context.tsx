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
 * Session strategy:
 *
 * Supabase's default `persistSession: true` stores tokens in localStorage,
 * meaning they survive browser close and feel effectively permanent — which
 * the owner does not want.
 *
 * True "close browser = logout" is unreliable in modern browsers because
 * they restore sessions and tabs, making sessionStorage equally persistent.
 *
 * The chosen approach: inactivity-based session expiry.
 *   - The session token is kept in localStorage (Supabase default) so normal
 *     page refreshes and navigation do NOT require re-login.
 *   - A "last active" timestamp is written to localStorage on every user
 *     interaction (mouse, keyboard, touch).
 *   - On app load, if the elapsed time since last activity exceeds the
 *     INACTIVITY_LIMIT, the user is signed out automatically.
 *   - This gives a reasonable security boundary without constant re-logins.
 *
 * INACTIVITY_LIMIT: 8 hours — covers a full work day comfortably; after
 * a night away the session is expired.
 */
const INACTIVITY_LIMIT_MS = 8 * 60 * 60 * 1000 // 8 hours
const LAST_ACTIVE_KEY = "bd_last_active"

function recordActivity() {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
}

function isSessionExpiredByInactivity(): boolean {
  const raw = localStorage.getItem(LAST_ACTIVE_KEY)
  if (!raw) return false // no record = fresh login, allow
  const elapsed = Date.now() - Number(raw)
  return elapsed > INACTIVITY_LIMIT_MS
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

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }
      return data as Profile
    },
    [supabase]
  )

  const logout = useCallback(async () => {
    localStorage.removeItem(LAST_ACTIVE_KEY)
    await supabase.auth.signOut()
  }, [supabase])

  // Bind global activity listeners once
  useEffect(() => {
    if (activityBound.current) return
    activityBound.current = true

    const events = ["mousemove", "keydown", "pointerdown", "touchstart", "scroll"]
    const handler = () => recordActivity()
    events.forEach((ev) => window.addEventListener(ev, handler, { passive: true }))

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handler))
    }
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Check inactivity before restoring session
        if (isSessionExpiredByInactivity()) {
          await supabase.auth.signOut()
          localStorage.removeItem(LAST_ACTIVE_KEY)
          setUser(null)
          setProfile(null)
        } else {
          recordActivity()
          setUser(session.user)
          const p = await fetchProfile(session.user.id)
          setProfile(p)
        }
      }
      setIsLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        recordActivity()
        setUser(session.user)
        const p = await fetchProfile(session.user.id)
        setProfile(p)
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile, logout])

  const role = profile?.role ?? null
  const isAdmin = role === "admin"

  return (
    <AuthContext.Provider
      value={{ user, profile, role, isAdmin, isLoading, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
