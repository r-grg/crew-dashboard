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

  // NOTE: fetchProfile does NOT use the supabase auth client — it only queries
  // the `profiles` table via the data API. This is safe to call outside the
  // onAuthStateChange lock context, but we still defer it with setTimeout to
  // guarantee we do NOT call it while the auth lock is held (see below).
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    if (error) return null
    return data as Profile
  }, [])

  const logout = useCallback(async () => {
    clearSessionKeys()
    setUser(null)
    setProfile(null)
    // signOut acquires the auth lock internally; calling it outside the
    // onAuthStateChange callback (where the lock is already held) is safe.
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      // ─────────────────────────────────────────────────────────────────────
      // CRITICAL: This callback is called *synchronously* while the Supabase
      // GoTrueClient holds its internal Web Locks API mutex
      // (navigator.locks "lock:sb-<project>-auth-token").
      //
      // Any `await` on another Supabase method inside this callback will
      // deadlock Chrome/Brave indefinitely because:
      //   1. The auth lock is held by the current call.
      //   2. Any supabase.auth.* method (signOut, getSession, etc.) tries to
      //      acquire the same exclusive lock.
      //   3. navigator.locks queues the new request behind the held lock.
      //   4. The held lock can never release because it is waiting for the
      //      callback to finish.
      //   5. The callback can never finish because it is awaiting step 2.
      //
      // Firefox is less affected because it falls back to a no-op lock
      // implementation in some builds, masking the bug.
      //
      // FIX: Use setTimeout(async () => { ... }, 0) to defer any Supabase
      // calls (including fetchProfile which hits the database) until *after*
      // the callback has returned and the auth lock is released.
      // ─────────────────────────────────────────────────────────────────────

      if (cancelled) return

      // Background token refresh — no UI change needed
      if (event === "TOKEN_REFRESHED") {
        if (!initialised.current) {
          initialised.current = true
          clearTimeout(timeoutId)
          setIsLoading(false)
        }
        return
      }

      // Explicit sign out — clear state immediately, no async work needed
      if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        clearTimeout(timeoutId)
        initialised.current = true
        setIsLoading(false)
        return
      }

      if (session?.user) {
        // Synchronously capture what we can from the session
        const currentUser = session.user

        if (isSessionExpired()) {
          clearSessionKeys()
          // ⚠️ DO NOT await supabase.auth.signOut() here — the auth lock is
          // currently held. Defer it with setTimeout so it runs after the
          // callback returns and the lock is released.
          setTimeout(() => {
            if (!cancelled) {
              supabase.auth.signOut()
            }
          }, 0)
          return
        }

        initSessionStart()
        recordActivity()

        // Set user synchronously (safe, no Supabase call)
        setUser(currentUser)

        // ⚠️ fetchProfile calls supabase.from(...) which internally may
        // interact with the auth state / storage. Defer it to avoid any
        // risk of deadlock under the held navigator.locks mutex.
        setTimeout(async () => {
          if (cancelled) return
          const p = await fetchProfile(currentUser.id)
          if (!cancelled) {
            setProfile(p)
          }
          if (!cancelled && !initialised.current) {
            clearTimeout(timeoutId)
            initialised.current = true
            setIsLoading(false)
          }
        }, 0)

        // Mark as initialised immediately so the spinner disappears even
        // before the profile resolves (profile is a secondary concern).
        if (!initialised.current) {
          clearTimeout(timeoutId)
          initialised.current = true
          setIsLoading(false)
        }
      } else {
        // No session — user is logged out
        setUser(null)
        setProfile(null)

        if (!initialised.current) {
          clearTimeout(timeoutId)
          initialised.current = true
          setIsLoading(false)
        }
      }
    })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [fetchProfile])

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