export type Role = "admin" | "viewer"

export interface Profile {
  id: string
  email: string | null
  role: Role
  created_at: string
}

export interface Member {
  id: string
  name: string
  active: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  event_date: string
  event_end_date: string | null
  event_type: "workshop" | "show" | "battle" | "invite"
  amount_per_person: number | null
  notes: string | null
  created_at: string
}

export interface EventParticipant {
  id: string
  event_id: string
  member_id: string
  created_at: string
}

// Enriched event with participant details
export interface EventWithParticipants extends Event {
  participants: Member[]
}

// Payload for updating a workshop/show event
export interface UpdateWorkshopShowPayload {
  id: string
  title: string
  event_date: string
  event_end_date: string | null
  event_type: "workshop" | "show"
  amount_per_person: number
  participant_ids: string[]
}

// Payload for updating a battle/invite event
export interface UpdateInviteBattlePayload {
  id: string
  title: string
  event_date: string
  event_end_date: string | null
  event_type: "battle" | "invite"
  participant_ids: string[]
}

// Payload for updating a member
export interface UpdateMemberPayload {
  id: string
  name: string
}