"use client"

import { KpiCards } from "@/components/dashboard/kpi-cards"
import { EarningsChart } from "@/components/dashboard/earnings-chart"
import { ParticipationChart } from "@/components/dashboard/participation-chart"
import { TopEarners } from "@/components/dashboard/top-earners"
import { RecentEvents } from "@/components/dashboard/recent-events"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Overview of crew performance and activities</p>
      </div>

      <KpiCards />

      {/* <div className="grid gap-6 lg:grid-cols-2">
        <EarningsChart />
        <ParticipationChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopEarners />
        <RecentEvents />
      </div> */}
    </div>
  )
}
