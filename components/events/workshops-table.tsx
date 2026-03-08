"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { YearFilter } from "@/components/ui/year-filter"
import { useData } from "@/context/data-context"
import { useAuth } from "@/context/auth-context"
import { useEventYears, filterByYear } from "@/hooks/use-year-filter"
import { formatDate, formatDateRange, formatCurrency } from "@/utils/calculations"
import { EditEventDialog } from "./edit-event-dialog"
import type { WorkshopShow } from "@/context/data-context"
import { Pencil, Trash2 } from "lucide-react"

export function WorkshopsTable() {
  const { workshopsAndShows, invitesAndBattles, deleteEvent } = useData()
  const { isAdmin } = useAuth()

  const [selectedYear, setSelectedYear] = useState("all")
  const [editingEvent, setEditingEvent] = useState<WorkshopShow | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const years = useEventYears(workshopsAndShows, invitesAndBattles)

  const filtered = filterByYear(workshopsAndShows, selectedYear)
  const sortedEvents = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const handleEdit = (event: WorkshopShow) => {
    setEditingEvent(event)
    setEditOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await deleteEvent(deletingId)
      setDeletingId(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete event")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-white">Workshops & Shows</CardTitle>
          <YearFilter years={years} value={selectedYear} onChange={setSelectedYear} />
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
                  {isAdmin && (
                    <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEvents.map((event) => (
                  <TableRow
                    key={event.id}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell className="text-zinc-300 whitespace-nowrap">
                      {formatDateRange(event.date, event.endDate)}
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
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(event)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingId(event.id)}
                            className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {sortedEvents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 7 : 6}
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

      <EditEventDialog
        event={editingEvent}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditingEvent(null)
        }}
      />

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingId(null)
            setDeleteError(null)
          }
        }}
      >
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Event</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This will permanently delete the event and all its participant records.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-md px-3 py-2">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-700 hover:bg-red-800 text-white border-0"
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}