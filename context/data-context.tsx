"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import type { Member, EventWithParticipants } from "@/lib/types"

// Keep the same shape the existing components expect
export interface WorkshopShow {
  id: string
  date: string
  event: string
  type: "workshop" | "show"
  amountPerPerson: number
  participants: string[] // member names
}

export interface InviteBattle {
  id: string
  date: string
  event: string
  type: "battle" | "invite"
  participants: string[] // member names
}

interface DataContextValue {
  members: Member[]
  workshopsAndShows: WorkshopShow[]
  invitesAndBattles: InviteBattle[]
  isLoading: boolean
  refresh: () => Promise<void>
  // Admin mutations
  addMember: (name: string) => Promise<void>
  addWorkshopShow: (data: Omit<WorkshopShow, "id">) => Promise<void>
  addInviteBattle: (data: Omit<InviteBattle, "id">) => Promise<void>
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const { user } = useAuth()

  const [members, setMembers] = useState<Member[]>([])
  const [workshopsAndShows, setWorkshopsAndShows] = useState<WorkshopShow[]>([])
  const [invitesAndBattles, setInvitesAndBattles] = useState<InviteBattle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from("members")
        .select("*")
        .order("name")

      if (membersError) throw membersError

      const membersList: Member[] = membersData ?? []
      setMembers(membersList)

      // Build a lookup map: member id → name
      const memberMap = new Map<string, string>()
      membersList.forEach((m) => memberMap.set(m.id, m.name))

      // Fetch events with participants
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          event_participants (
            member_id
          )
        `)
        .order("event_date", { ascending: false })

      if (eventsError) throw eventsError

      const workshops: WorkshopShow[] = []
      const battles: InviteBattle[] = []

      for (const event of eventsData ?? []) {
        const participantNames = (event.event_participants as { member_id: string }[])
          .map((ep) => memberMap.get(ep.member_id) ?? "Unknown")
          .filter(Boolean)

        if (event.event_type === "workshop" || event.event_type === "show") {
          workshops.push({
            id: event.id,
            date: event.event_date,
            event: event.title,
            type: event.event_type,
            amountPerPerson: event.amount_per_person ?? 0,
            participants: participantNames,
          })
        } else {
          battles.push({
            id: event.id,
            date: event.event_date,
            event: event.title,
            type: event.event_type,
            participants: participantNames,
          })
        }
      }

      setWorkshopsAndShows(workshops)
      setInvitesAndBattles(battles)
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Admin mutations ────────────────────────────────────────

  const addMember = useCallback(
    async (name: string) => {
      const { error } = await supabase
        .from("members")
        .insert({ name, active: true })
      if (error) throw error
      await fetchData()
    },
    [supabase, fetchData]
  )

  const addWorkshopShow = useCallback(
    async (data: Omit<WorkshopShow, "id">) => {
      // 1. Insert event
      const { data: eventRow, error: eventError } = await supabase
        .from("events")
        .insert({
          title: data.event,
          event_date: data.date,
          event_type: data.type,
          amount_per_person: data.amountPerPerson || null,
        })
        .select()
        .single()

      if (eventError) throw eventError

      // 2. Resolve participant names → IDs
      if (data.participants.length > 0) {
        const { data: memberRows, error: memberError } = await supabase
          .from("members")
          .select("id, name")
          .in("name", data.participants)

        if (memberError) throw memberError

        const participantInserts = (memberRows ?? []).map((m) => ({
          event_id: eventRow.id,
          member_id: m.id,
        }))

        if (participantInserts.length > 0) {
          const { error: epError } = await supabase
            .from("event_participants")
            .insert(participantInserts)
          if (epError) throw epError
        }
      }

      await fetchData()
    },
    [supabase, fetchData]
  )

  const addInviteBattle = useCallback(
    async (data: Omit<InviteBattle, "id">) => {
      // 1. Insert event
      const { data: eventRow, error: eventError } = await supabase
        .from("events")
        .insert({
          title: data.event,
          event_date: data.date,
          event_type: data.type,
          amount_per_person: null,
        })
        .select()
        .single()

      if (eventError) throw eventError

      // 2. Resolve participant names → IDs
      if (data.participants.length > 0) {
        const { data: memberRows, error: memberError } = await supabase
          .from("members")
          .select("id, name")
          .in("name", data.participants)

        if (memberError) throw memberError

        const participantInserts = (memberRows ?? []).map((m) => ({
          event_id: eventRow.id,
          member_id: m.id,
        }))

        if (participantInserts.length > 0) {
          const { error: epError } = await supabase
            .from("event_participants")
            .insert(participantInserts)
          if (epError) throw epError
        }
      }

      await fetchData()
    },
    [supabase, fetchData]
  )

  return (
    <DataContext.Provider
      value={{
        members,
        workshopsAndShows,
        invitesAndBattles,
        isLoading,
        refresh: fetchData,
        addMember,
        addWorkshopShow,
        addInviteBattle,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}
