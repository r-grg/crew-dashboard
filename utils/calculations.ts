import type { Member } from "@/lib/types"
import type { WorkshopShow as WorkshopShowEvent, InviteBattle as InviteBattleEvent } from "@/context/data-context"

export interface MemberStats {
  name: string
  totalEarnings: number
  totalEvents: number
  workshopCount: number
  showCount: number
  battleCount: number
  inviteCount: number
}

export function calculateMemberStats(
  members: Member[],
  workshopsAndShows: WorkshopShowEvent[],
  invitesAndBattles: InviteBattleEvent[]
): MemberStats[] {
  return members.map((member) => {
    const memberWorkshops = workshopsAndShows.filter(
      (e) => e.type === "workshop" && e.participants.includes(member.name)
    )
    const memberShows = workshopsAndShows.filter(
      (e) => e.type === "show" && e.participants.includes(member.name)
    )
    const memberBattles = invitesAndBattles.filter(
      (e) => e.type === "battle" && e.participants.includes(member.name)
    )
    const memberInvites = invitesAndBattles.filter(
      (e) => e.type === "invite" && e.participants.includes(member.name)
    )

    const totalEarnings = workshopsAndShows
      .filter((e) => e.participants.includes(member.name))
      .reduce((sum, e) => sum + e.amountPerPerson, 0)

    return {
      name: member.name,
      totalEarnings,
      totalEvents:
        memberWorkshops.length +
        memberShows.length +
        memberBattles.length +
        memberInvites.length,
      workshopCount: memberWorkshops.length,
      showCount: memberShows.length,
      battleCount: memberBattles.length,
      inviteCount: memberInvites.length,
    }
  })
}

export function getTopEarner(stats: MemberStats[]): MemberStats | null {
  if (stats.length === 0) return null
  return stats.reduce((top, current) =>
    current.totalEarnings > top.totalEarnings ? current : top
  )
}

export function getMostActiveMember(stats: MemberStats[]): MemberStats | null {
  if (stats.length === 0) return null
  return stats.reduce((top, current) =>
    current.totalEvents > top.totalEvents ? current : top
  )
}

export function getRecentEvents(
  workshopsAndShows: WorkshopShowEvent[],
  invitesAndBattles: InviteBattleEvent[],
  limit: number = 5
) {
  const allEvents = [
    ...workshopsAndShows.map((e) => ({
      ...e,
      category: "paid" as const,
    })),
    ...invitesAndBattles.map((e) => ({
      ...e,
      category: "competition" as const,
      amountPerPerson: 0,
    })),
  ]

  return allEvents
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export function getTotalEarnings(workshopsAndShows: WorkshopShowEvent[]): number {
  return workshopsAndShows.reduce(
    (sum, e) => sum + e.amountPerPerson * e.participants.length,
    0
  )
}

export function getTotalEvents(
  workshopsAndShows: WorkshopShowEvent[],
  invitesAndBattles: InviteBattleEvent[]
): number {
  return workshopsAndShows.length + invitesAndBattles.length
}

export function getEarningsChartData(
  workshopsAndShows: WorkshopShowEvent[]
): { month: string; workshops: number; shows: number }[] {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]

  return months.map((month, index) => {
    const monthEvents = workshopsAndShows.filter((e) => {
      const eventMonth = new Date(e.date).getMonth()
      return eventMonth === index
    })

    const workshops = monthEvents
      .filter((e) => e.type === "workshop")
      .reduce((sum, e) => sum + e.amountPerPerson * e.participants.length, 0)

    const shows = monthEvents
      .filter((e) => e.type === "show")
      .reduce((sum, e) => sum + e.amountPerPerson * e.participants.length, 0)

    return { month, workshops, shows }
  })
}

export function getParticipationChartData(
  stats: MemberStats[]
): { name: string; events: number }[] {
  return stats
    .map((s) => ({ name: s.name, events: s.totalEvents }))
    .sort((a, b) => b.events - a.events)
    .slice(0, 8)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
