"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useData } from "@/context/data-context"
import { calculateMemberStats, formatCurrency } from "@/utils/calculations"
import type { MemberStats } from "@/utils/calculations"

interface MemberDetailDialogProps {
  member: MemberStats | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MemberDetailDialog({
  member,
  open,
  onOpenChange,
}: MemberDetailDialogProps) {
  const { workshopsAndShows, invitesAndBattles } = useData()

  if (!member) return null

  const memberWorkshops = workshopsAndShows.filter((e) =>
    e.participants.includes(member.name)
  )
  const memberBattles = invitesAndBattles.filter((e) =>
    e.participants.includes(member.name)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-zinc-700">
              <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xl">
                {member.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl text-white">
                {member.name}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Crew member statistics
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">
                Total Earnings
              </p>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {formatCurrency(member.totalEarnings)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">
                Total Events
              </p>
              <p className="text-xl font-bold text-sky-400 mt-1">
                {member.totalEvents}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between py-2 border-b border-zinc-800">
            <span className="text-sm text-zinc-400">Workshops</span>
            <Badge
              variant="outline"
              className="bg-emerald-950 text-emerald-400 border-emerald-800"
            >
              {member.workshopCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800">
            <span className="text-sm text-zinc-400">Shows</span>
            <Badge
              variant="outline"
              className="bg-sky-950 text-sky-400 border-sky-800"
            >
              {member.showCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800">
            <span className="text-sm text-zinc-400">Battles</span>
            <Badge
              variant="outline"
              className="bg-rose-950 text-rose-400 border-rose-800"
            >
              {member.battleCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">Invites</span>
            <Badge
              variant="outline"
              className="bg-amber-950 text-amber-400 border-amber-800"
            >
              {member.inviteCount}
            </Badge>
          </div>
        </div>

        {memberWorkshops.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-zinc-300 mb-2">
              Recent Paid Events
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {memberWorkshops.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between text-sm p-2 bg-zinc-800/50 rounded"
                >
                  <span className="text-zinc-300 truncate">{event.event}</span>
                  <span className="text-emerald-400 shrink-0 ml-2">
                    {formatCurrency(event.amountPerPerson)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
