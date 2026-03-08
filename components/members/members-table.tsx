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
import { YearFilter } from "@/components/ui/year-filter"
import { useData } from "@/context/data-context"
import { useAuth } from "@/context/auth-context"
import { useEventYears, filterByYear } from "@/hooks/use-year-filter"
import { calculateMemberStats, formatCurrency } from "@/utils/calculations"
import { MemberDetailDialog } from "./member-detail-dialog"
import { EditMemberDialog } from "./edit-member-dialog"
import type { MemberStats } from "@/utils/calculations"
import type { Member } from "@/lib/types"
import { Search, Eye, Pencil, PowerOff, Power } from "lucide-react"

export function MembersTable() {
  const { members, workshopsAndShows, invitesAndBattles, setMemberActive } = useData()
  const { isAdmin } = useAuth()

  const [search, setSearch] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedMember, setSelectedMember] = useState<MemberStats | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const years = useEventYears(workshopsAndShows, invitesAndBattles)

  // Filter events by year for stats calculation
  const filteredWorkshops = filterByYear(workshopsAndShows, selectedYear)
  const filteredBattles = filterByYear(invitesAndBattles, selectedYear)

  const stats = calculateMemberStats(members, filteredWorkshops, filteredBattles)

  const filteredStats = stats.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleViewMember = (member: MemberStats) => {
    setSelectedMember(member)
    setDialogOpen(true)
  }

  const handleEditMember = (memberStat: MemberStats) => {
    const found = members.find((m) => m.name === memberStat.name)
    if (found) {
      setEditingMember(found)
      setEditOpen(true)
    }
  }

  const handleToggleActive = async (memberStat: MemberStats) => {
    const found = members.find((m) => m.name === memberStat.name)
    if (!found) return
    setTogglingId(found.id)
    try {
      await setMemberActive(found.id, !found.active)
    } finally {
      setTogglingId(null)
    }
  }

  // Find a member's active status from the members array
  const getMemberActive = (name: string): boolean => {
    return members.find((m) => m.name === name)?.active ?? true
  }

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-white">All Members</CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            <YearFilter years={years} value={selectedYear} onChange={setSelectedYear} />
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
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
                {filteredStats.map((member) => {
                  const isActive = getMemberActive(member.name)
                  const memberId = members.find((m) => m.name === member.name)?.id
                  const isToggling = togglingId === memberId

                  return (
                    <TableRow
                      key={member.name}
                      className={`border-zinc-800 hover:bg-zinc-800/50 ${
                        !isActive ? "opacity-60" : ""
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-zinc-700">
                            <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
                              {member.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-white">
                              {member.name}
                            </span>
                            {!isActive && (
                              <span className="text-xs text-zinc-500">Inactive</span>
                            )}
                          </div>
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewMember(member)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View {member.name}</span>
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMember(member)}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8 p-0"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span className="sr-only">Edit {member.name}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(member)}
                                disabled={isToggling}
                                className={`h-8 w-8 p-0 ${
                                  isActive
                                    ? "text-zinc-400 hover:text-amber-400 hover:bg-amber-950/30"
                                    : "text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/30"
                                }`}
                                title={isActive ? "Disable member" : "Enable member"}
                              >
                                {isActive ? (
                                  <PowerOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Power className="h-3.5 w-3.5" />
                                )}
                                <span className="sr-only">
                                  {isActive ? "Disable" : "Enable"} {member.name}
                                </span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
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

      <EditMemberDialog
        member={editingMember}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditingMember(null)
        }}
      />
    </>
  )
}
