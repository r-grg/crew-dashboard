"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/context/data-context"
import { formatDate } from "@/utils/calculations"

export function BattlesTable() {
  const { invitesAndBattles } = useData()

  const sortedEvents = [...invitesAndBattles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Invites & Battles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Date</TableHead>
                <TableHead className="text-zinc-400">Event</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Participants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEvents.map((event) => (
                <TableRow
                  key={event.id}
                  className="border-zinc-800 hover:bg-zinc-800/50"
                >
                  <TableCell className="text-zinc-300">
                    {formatDate(event.date)}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {event.event}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        event.type === "battle"
                          ? "bg-rose-950 text-rose-400 border-rose-800"
                          : "bg-amber-950 text-amber-400 border-amber-800"
                      }
                    >
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {event.participants.map((p) => (
                        <Badge
                          key={p}
                          variant="outline"
                          className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs"
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sortedEvents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-zinc-500"
                  >
                    No invites or battles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
