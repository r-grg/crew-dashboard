"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useData } from "@/context/data-context"
import { CalendarPlus } from "lucide-react"

type EventCategory = "paid" | "competition"
type PaidType = "workshop" | "show"
type CompetitionType = "battle" | "invite"

export function AddEventDialog() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<EventCategory>("paid")
  const [eventName, setEventName] = useState("")
  const [date, setDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [type, setType] = useState<PaidType | CompetitionType>("workshop")
  const [amount, setAmount] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { members, addWorkshopShow, addInviteBattle } = useData()

  const handleParticipantToggle = (name: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    )
  }

  const handleCategoryChange = (newCategory: EventCategory) => {
    setCategory(newCategory)
    setType(newCategory === "paid" ? "workshop" : "battle")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventName.trim() || !date || selectedParticipants.length === 0) return
    setError(null)
    setIsLoading(true)

    try {
      if (category === "paid") {
        await addWorkshopShow({
          date,
          endDate: endDate || null,
          event: eventName.trim(),
          type: type as PaidType,
          amountPerPerson: Number(amount) || 0,
          participants: selectedParticipants,
        })
      } else {
        await addInviteBattle({
          date,
          endDate: endDate || null,
          event: eventName.trim(),
          type: type as CompetitionType,
          participants: selectedParticipants,
        })
      }
      // Reset form
      setEventName("")
      setDate("")
      setEndDate("")
      setType("workshop")
      setAmount("")
      setSelectedParticipants([])
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <CalendarPlus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">Add New Event</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add a workshop, show, battle, or invite event.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Category</Label>
              <Select
                value={category}
                onValueChange={(val) => handleCategoryChange(val as EventCategory)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="paid" className="text-white">
                    Workshop / Show (Paid)
                  </SelectItem>
                  <SelectItem value="competition" className="text-white">
                    Battle / Invite (Competition)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Event Name</Label>
              <Input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
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
                onValueChange={(val) => setType(val as PaidType | CompetitionType)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {category === "paid" ? (
                    <>
                      <SelectItem value="workshop" className="text-white">
                        Workshop
                      </SelectItem>
                      <SelectItem value="show" className="text-white">
                        Show
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="battle" className="text-white">
                        Battle
                      </SelectItem>
                      <SelectItem value="invite" className="text-white">
                        Invite
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {category === "paid" && (
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
              <Label className="text-zinc-300">Participants</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-zinc-800 rounded-md border border-zinc-700">
                {members.filter((m) => m.active).map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`participant-${member.id}`}
                      checked={selectedParticipants.includes(member.name)}
                      onCheckedChange={() => handleParticipantToggle(member.name)}
                      className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <label
                      htmlFor={`participant-${member.id}`}
                      className="text-sm text-zinc-300 cursor-pointer"
                    >
                      {member.name}
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
              onClick={() => setOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={
                !eventName.trim() ||
                !date ||
                selectedParticipants.length === 0 ||
                isLoading
              }
            >
              {isLoading ? "Adding…" : "Add Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}