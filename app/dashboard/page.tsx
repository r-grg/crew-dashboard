"use client"

import { useState } from "react"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { YearFilter } from "@/components/ui/year-filter"
import { useData } from "@/context/data-context"
import { useEventYears } from "@/hooks/use-year-filter"
import { RecentEvents } from "@/components/dashboard/recent-events"
import { ParticipationChart } from "@/components/dashboard/participation-chart"


export default function DashboardPage() {
  const { workshopsAndShows, invitesAndBattles } = useData()
  const years = useEventYears(workshopsAndShows, invitesAndBattles)
  const [selectedYear, setSelectedYear] = useState("all")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Overview of crew performance and activities</p>
        </div>
        <YearFilter years={years} value={selectedYear} onChange={setSelectedYear} />
      </div>

      <KpiCards selectedYear={selectedYear} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ParticipationChart selectedYear={selectedYear} />
        <RecentEvents/>
      </div>

    </div>
  )
}