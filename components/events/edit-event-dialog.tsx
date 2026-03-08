"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useData, type WorkshopShow, type InviteBattle } from "@/context/data-context"

type EditableEvent = WorkshopShow | InviteBattle

function isWorkshopShow(event: EditableEvent): event is WorkshopShow {
  return event.type === "workshop" || event.type === "show"
}

interface EditEventDialogProps {
  event: EditableEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEventDialog({ event, open, onOpenChange }: EditEventDialogProps) {
  const { members, updateWorkshopShow, updateInviteBattle } = useData()

  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [type, setType] = useState<EditableEvent["type"]>("workshop")
  const [amount, setAmount] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when event changes
  useEffect(() => {
    if (!event) return
    setTitle(event.event)
    setDate(event.date)
    setEndDate(event.endDate ?? "")
    setType(event.type)
    setAmount(isWorkshopShow(event) ? String(event.amountPerPerson) : "")
    setSelectedIds(event.participantIds ?? [])
    setError(null)
  }, [event])

  const toggleParticipant = (memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event || !title.trim() || !date || selectedIds.length === 0) return
    setError(null)
    setIsLoading(true)

    try {
      if (type === "workshop" || type === "show") {
        await updateWorkshopShow({
          id: event.id,
          title: title.trim(),
          event_date: date,
          event_end_date: endDate || null,
          event_type: type,
          amount_per_person: Number(amount) || 0,
          participant_ids: selectedIds,
        })
      } else {
        await updateInviteBattle({
          id: event.id,
          title: title.trim(),
          event_date: date,
          event_end_date: endDate || null,
          event_type: type as "battle" | "invite",
          participant_ids: selectedIds,
        })
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event")
    } finally {
      setIsLoading(false)
    }
  }

  const isPaid = type === "workshop" || type === "show"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">Edit Event</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update the event details and participants.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Event Name</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event name"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Start Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">
                  End Date{" "}
                  <span className="text-zinc-500 font-normal">(optional)</span>
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  min={date || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Type</Label>
              <Select
                value={type}
                onValueChange={(val) => setType(val as EditableEvent["type"])}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="workshop" className="text-white">Workshop</SelectItem>
                  <SelectItem value="show" className="text-white">Show</SelectItem>
                  <SelectItem value="battle" className="text-white">Battle</SelectItem>
                  <SelectItem value="invite" className="text-white">Invite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isPaid && (
              <div className="space-y-2">
                <Label className="text-zinc-300">Amount per Person (€)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="300"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-zinc-300">
                Participants ({selectedIds.length} selected)
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-zinc-800 rounded-md border border-zinc-700">
                {members
                  .filter((m) => m.active || selectedIds.includes(m.id))
                  .map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-participant-${member.id}`}
                      checked={selectedIds.includes(member.id)}
                      onCheckedChange={() => toggleParticipant(member.id)}
                      disabled={!member.active}
                      className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 disabled:opacity-40"
                    />
                    <label
                      htmlFor={`edit-participant-${member.id}`}
                      className={`text-sm cursor-pointer ${
                        member.active ? "text-zinc-300" : "text-zinc-500 italic"
                      }`}
                    >
                      {member.name}
                      {!member.active && " (inactive)"}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-md px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={
                !title.trim() ||
                !date ||
                selectedIds.length === 0 ||
                isLoading
              }
            >
              {isLoading ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}