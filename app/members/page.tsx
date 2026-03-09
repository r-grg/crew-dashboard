"use client"

import { MembersTable } from "@/components/members/members-table"
import { AddMemberDialog } from "@/components/members/add-member-dialog"
import { useAuth } from "@/context/auth-context"
import { useData } from "@/context/data-context"
import { Spinner } from "@/components/ui/spinner"

export default function MembersPage() {
  const { isAdmin } = useAuth()
  const { isLoading } = useData()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner className="h-8 w-8 text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-zinc-400 mt-1">Manage crew members and view their statistics</p>
        </div>
        {isAdmin && <AddMemberDialog />}
      </div>

      <MembersTable />
    </div>
  )
}