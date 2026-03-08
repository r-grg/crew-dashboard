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
import { useData } from "@/context/data-context"
import type { Member } from "@/lib/types"

interface EditMemberDialogProps {
  member: Member | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
  const { updateMember } = useData()
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (member) {
      setName(member.name)
      setError(null)
    }
  }, [member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!member || !name.trim()) return
    setError(null)
    setIsLoading(true)
    try {
      await updateMember({ id: member.id, name: name.trim() })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update member")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">Edit Member</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update the member&apos;s display name.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-member-name" className="text-zinc-300">
              Name
            </Label>
            <Input
              id="edit-member-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter member name"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
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
              disabled={!name.trim() || name.trim() === member?.name || isLoading}
            >
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
