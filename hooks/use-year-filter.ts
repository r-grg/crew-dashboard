"use client"

import { useMemo } from "react"
import type { WorkshopShow, InviteBattle } from "@/context/data-context"

/**
 * Derives a sorted list of unique years from events,
 * and filters events by the selected year (or all years).
 */
export function useEventYears(
  workshopsAndShows: WorkshopShow[],
  invitesAndBattles: InviteBattle[]
): string[] {
  return useMemo(() => {
    const yearSet = new Set<string>()
    for (const e of workshopsAndShows) {
      yearSet.add(new Date(e.date).getFullYear().toString())
    }
    for (const e of invitesAndBattles) {
      yearSet.add(new Date(e.date).getFullYear().toString())
    }
    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a))
  }, [workshopsAndShows, invitesAndBattles])
}

export function filterByYear<T extends { date: string }>(
  items: T[],
  year: string
): T[] {
  if (year === "all") return items
  return items.filter(
    (item) => new Date(item.date).getFullYear().toString() === year
  )
}
