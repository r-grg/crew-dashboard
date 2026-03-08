"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/context/data-context"
import { filterByYear } from "@/hooks/use-year-filter"
import {
  calculateMemberStats,
  getTopEarner,
  getMostActiveMember,
  getTotalEarnings,
  getTotalEvents,
  formatCurrency,
} from "@/utils/calculations"
import { Euro, Calendar, Trophy, Users } from "lucide-react"

interface KpiCardsProps {
  selectedYear?: string
}

export function KpiCards({ selectedYear = "all" }: KpiCardsProps) {
  const { members, workshopsAndShows, invitesAndBattles } = useData()

  const filteredWorkshops = filterByYear(workshopsAndShows, selectedYear)
  const filteredBattles = filterByYear(invitesAndBattles, selectedYear)

  const stats = calculateMemberStats(members, filteredWorkshops, filteredBattles)
  const topEarner = getTopEarner(stats)
  const mostActive = getMostActiveMember(stats)
  const totalEarnings = getTotalEarnings(filteredWorkshops)
  const totalEvents = getTotalEvents(filteredWorkshops, filteredBattles)

  const kpis = [
    {
      title: "Total Earnings",
      value: formatCurrency(totalEarnings),
      description: "From all workshops and shows",
      icon: Euro,
      color: "text-emerald-400",
      bgColor: "bg-emerald-950/50",
    },
    {
      title: "Total Events",
      value: totalEvents.toString(),
      description: `${filteredWorkshops.length} paid, ${filteredBattles.length} competitions`,
      icon: Calendar,
      color: "text-sky-400",
      bgColor: "bg-sky-950/50",
    },
    {
      title: "Top Earner",
      value: topEarner?.name ?? "N/A",
      description: topEarner ? formatCurrency(topEarner.totalEarnings) : "No data",
      icon: Trophy,
      color: "text-amber-400",
      bgColor: "bg-amber-950/50",
    },
    {
      title: "Most Active",
      value: mostActive?.name ?? "N/A",
      description: mostActive ? `${mostActive.totalEvents} events` : "No data",
      icon: Users,
      color: "text-rose-400",
      bgColor: "bg-rose-950/50",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <p className="text-xs text-zinc-500 mt-1">{kpi.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
