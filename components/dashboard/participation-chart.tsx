"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/context/data-context"
import { calculateMemberStats, getParticipationChartData } from "@/utils/calculations"
import { filterByYear } from "@/hooks/use-year-filter"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"

const COLORS = [
  "#10b981", "#14b8a6", "#22d3d1", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
]

export function ParticipationChart({ selectedYear }: { selectedYear: string }) {
  const { members, workshopsAndShows, invitesAndBattles } = useData()
  const filteredWorkshops = filterByYear(workshopsAndShows, selectedYear)
  const filteredBattles = filterByYear(invitesAndBattles, selectedYear)
  const stats = calculateMemberStats(members, filteredWorkshops, filteredBattles)
  const chartData = getParticipationChartData(stats)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Event Participation</CardTitle>
        <CardDescription className="text-zinc-400">
          Top members by total events attended
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "#71717a", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                labelStyle={{ color: "#ffffff" }}
                itemStyle={{ color: "#a1a1aa" }}
                formatter={(value) => [`${value ?? 0} events`, "Participation"]}
              />
              <Bar dataKey="events" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}