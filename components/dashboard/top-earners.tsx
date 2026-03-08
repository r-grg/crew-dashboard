"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useData } from "@/context/data-context"
import { calculateMemberStats, formatCurrency } from "@/utils/calculations"

export function TopEarners() {
  const { members, workshopsAndShows, invitesAndBattles } = useData()
  const stats = calculateMemberStats(members, workshopsAndShows, invitesAndBattles)
  const sortedByEarnings = [...stats]
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 5)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Top Earners</CardTitle>
        <CardDescription className="text-zinc-400">
          Members with highest total earnings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedByEarnings.map((member, index) => (
            <div
              key={member.name}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 border border-zinc-700">
                    <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <span
                      className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? "bg-amber-500 text-amber-950"
                          : index === 1
                          ? "bg-zinc-300 text-zinc-800"
                          : "bg-amber-700 text-amber-100"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{member.name}</p>
                  <p className="text-xs text-zinc-500">
                    {member.workshopCount + member.showCount} paid events
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-400">
                  {formatCurrency(member.totalEarnings)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
