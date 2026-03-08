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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/context/data-context"
import { calculateMemberStats, formatCurrency } from "@/utils/calculations"
import { MemberDetailDialog } from "./member-detail-dialog"
import type { MemberStats } from "@/utils/calculations"
import { Search, Eye } from "lucide-react"

export function MembersTable() {
  const { members, workshopsAndShows, invitesAndBattles } = useData()
  const [search, setSearch] = useState("")
  const [selectedMember, setSelectedMember] = useState<MemberStats | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const stats = calculateMemberStats(members, workshopsAndShows, invitesAndBattles)

  const filteredStats = stats.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleViewMember = (member: MemberStats) => {
    setSelectedMember(member)
    setDialogOpen(true)
  }

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-white">All Members</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Member</TableHead>
                  <TableHead className="text-zinc-400 text-right">Earnings</TableHead>
                  <TableHead className="text-zinc-400 text-center">Events</TableHead>
                  <TableHead className="text-zinc-400 text-center">Workshops</TableHead>
                  <TableHead className="text-zinc-400 text-center">Shows</TableHead>
                  <TableHead className="text-zinc-400 text-center">Battles</TableHead>
                  <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStats.map((member) => (
                  <TableRow
                    key={member.name}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-zinc-700">
                          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
                            {member.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-white">
                          {member.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-emerald-400">
                        {formatCurrency(member.totalEarnings)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-zinc-800 text-zinc-300 border-zinc-700"
                      >
                        {member.totalEvents}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-emerald-950 text-emerald-400 border-emerald-800"
                      >
                        {member.workshopCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-sky-950 text-sky-400 border-sky-800"
                      >
                        {member.showCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-rose-950 text-rose-400 border-rose-800"
                      >
                        {member.battleCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewMember(member)}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View {member.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStats.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-zinc-500"
                    >
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MemberDetailDialog
        member={selectedMember}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
