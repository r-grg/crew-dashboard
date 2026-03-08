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
import type {
  Member,
  UpdateWorkshopShowPayload,
  UpdateInviteBattlePayload,
  UpdateMemberPayload,
} from "@/lib/types"

// Keep the same shape the existing components expect
export interface WorkshopShow {
  id: string
  date: string
  endDate: string | null
  event: string
  type: "workshop" | "show"
  amountPerPerson: number
  participants: string[] // member names for display
  participantIds: string[] // member IDs for editing
}

export interface InviteBattle {
  id: string
  date: string
  endDate: string | null
  event: string
  type: "battle" | "invite"
  participants: string[] // member names for display
  participantIds: string[] // member IDs for editing
}

interface DataContextValue {
  members: Member[]
  workshopsAndShows: WorkshopShow[]
  invitesAndBattles: InviteBattle[]
  isLoading: boolean
  refresh: () => Promise<void>
  // Admin mutations
  addMember: (name: string) => Promise<void>
  addWorkshopShow: (data: Omit<WorkshopShow, "id" | "participantIds">) => Promise<void>
  addInviteBattle: (data: Omit<InviteBattle, "id" | "participantIds">) => Promise<void>
  updateWorkshopShow: (payload: UpdateWorkshopShowPayload) => Promise<void>
  updateInviteBattle: (payload: UpdateInviteBattlePayload) => Promise<void>
  deleteEvent: (eventId: string) => Promise<void>
  updateMember: (payload: UpdateMemberPayload) => Promise<void>
  setMemberActive: (memberId: string, active: boolean) => Promise<void>
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
      // Fetch all members (including inactive — historical records must remain intact)
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
        const eps = event.event_participants as { member_id: string }[]
        const participantIds = eps.map((ep) => ep.member_id)
        const participantNames = participantIds
          .map((id) => memberMap.get(id) ?? "Unknown")
          .filter(Boolean)

        if (event.event_type === "workshop" || event.event_type === "show") {
          workshops.push({
            id: event.id,
            date: event.event_date,
            endDate: event.event_end_date ?? null,
            event: event.title,
            type: event.event_type,
            amountPerPerson: event.amount_per_person ?? 0,
            participants: participantNames,
            participantIds,
          })
        } else {
          battles.push({
            id: event.id,
            date: event.event_date,
            endDate: event.event_end_date ?? null,
            event: event.title,
            type: event.event_type,
            participants: participantNames,
            participantIds,
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

  // ── Helper: upsert participants for an event ────────────────
  const replaceParticipants = useCallback(
    async (eventId: string, memberIds: string[]) => {
      // Delete existing participants first (safe even without DB cascade)
      const { error: delError } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
      if (delError) throw delError

      if (memberIds.length > 0) {
        const inserts = memberIds.map((id) => ({
          event_id: eventId,
          member_id: id,
        }))
        const { error: insError } = await supabase
          .from("event_participants")
          .insert(inserts)
        if (insError) throw insError
      }
    },
    [supabase]
  )

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
    async (data: Omit<WorkshopShow, "id" | "participantIds">) => {
      const { data: eventRow, error: eventError } = await supabase
        .from("events")
        .insert({
          title: data.event,
          event_date: data.date,
          event_end_date: data.endDate || null,
          event_type: data.type,
          amount_per_person: data.amountPerPerson || null,
        })
        .select()
        .single()

      if (eventError) throw eventError

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
    async (data: Omit<InviteBattle, "id" | "participantIds">) => {
      const { data: eventRow, error: eventError } = await supabase
        .from("events")
        .insert({
          title: data.event,
          event_date: data.date,
          event_end_date: data.endDate || null,
          event_type: data.type,
          amount_per_person: null,
        })
        .select()
        .single()

      if (eventError) throw eventError

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

  const updateWorkshopShow = useCallback(
    async (payload: UpdateWorkshopShowPayload) => {
      const { error: eventError } = await supabase
        .from("events")
        .update({
          title: payload.title,
          event_date: payload.event_date,
          event_end_date: payload.event_end_date || null,
          event_type: payload.event_type,
          amount_per_person: payload.amount_per_person || null,
        })
        .eq("id", payload.id)

      if (eventError) throw eventError

      await replaceParticipants(payload.id, payload.participant_ids)
      await fetchData()
    },
    [supabase, fetchData, replaceParticipants]
  )

  const updateInviteBattle = useCallback(
    async (payload: UpdateInviteBattlePayload) => {
      const { error: eventError } = await supabase
        .from("events")
        .update({
          title: payload.title,
          event_date: payload.event_date,
          event_end_date: payload.event_end_date || null,
          event_type: payload.event_type,
          amount_per_person: null,
        })
        .eq("id", payload.id)

      if (eventError) throw eventError

      await replaceParticipants(payload.id, payload.participant_ids)
      await fetchData()
    },
    [supabase, fetchData, replaceParticipants]
  )

  const deleteEvent = useCallback(
    async (eventId: string) => {
      // Explicitly delete participants first (safe even if DB cascade exists)
      const { error: epError } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
      if (epError) throw epError

      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId)
      if (eventError) throw eventError

      await fetchData()
    },
    [supabase, fetchData]
  )

  const updateMember = useCallback(
    async (payload: UpdateMemberPayload) => {
      const { error } = await supabase
        .from("members")
        .update({ name: payload.name })
        .eq("id", payload.id)
      if (error) throw error
      await fetchData()
    },
    [supabase, fetchData]
  )

  const setMemberActive = useCallback(
    async (memberId: string, active: boolean) => {
      const { error } = await supabase
        .from("members")
        .update({ active })
        .eq("id", memberId)
      if (error) throw error
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
        updateWorkshopShow,
        updateInviteBattle,
        deleteEvent,
        updateMember,
        setMemberActive,
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