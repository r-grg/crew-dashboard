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
import { formatDate, formatCurrency } from "@/utils/calculations"

export function WorkshopsTable() {
  const { workshopsAndShows } = useData()

  const sortedEvents = [...workshopsAndShows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Workshops & Shows</CardTitle>
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
                <TableHead className="text-zinc-400 text-right">Per Person</TableHead>
                <TableHead className="text-zinc-400 text-right">Total</TableHead>
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
                        event.type === "workshop"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                          : "bg-sky-950 text-sky-400 border-sky-800"
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
                  <TableCell className="text-right text-zinc-300">
                    {formatCurrency(event.amountPerPerson)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-400">
                    {formatCurrency(event.amountPerPerson * event.participants.length)}
                  </TableCell>
                </TableRow>
              ))}
              {sortedEvents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-zinc-500"
                  >
                    No workshops or shows found.
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
