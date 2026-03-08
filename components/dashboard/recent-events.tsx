"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/context/data-context"
import { getRecentEvents, formatDate, formatCurrency } from "@/utils/calculations"

const typeBadgeColors: Record<string, string> = {
  workshop: "bg-emerald-950 text-emerald-400 border-emerald-800",
  show: "bg-sky-950 text-sky-400 border-sky-800",
  battle: "bg-rose-950 text-rose-400 border-rose-800",
  invite: "bg-amber-950 text-amber-400 border-amber-800",
}

export function RecentEvents() {
  const { workshopsAndShows, invitesAndBattles } = useData()
  const recentEvents = getRecentEvents(workshopsAndShows, invitesAndBattles, 5)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Recent Events</CardTitle>
        <CardDescription className="text-zinc-400">
          Latest crew activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800 last:border-0 last:pb-0"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {event.event}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${typeBadgeColors[event.type]}`}
                  >
                    {event.type}
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    {formatDate(event.date)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {event.participants.join(", ")}
                </p>
              </div>
              {event.amountPerPerson > 0 && (
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-emerald-400">
                    {formatCurrency(event.amountPerPerson * event.participants.length)}
                  </p>
                  <p className="text-xs text-zinc-500">total</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
