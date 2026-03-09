"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkshopsTable } from "@/components/events/workshops-table"
import { BattlesTable } from "@/components/events/battles-table"
import { AddEventDialog } from "@/components/events/add-event-dialog"
import { YearFilter } from "@/components/ui/year-filter"
import { useAuth } from "@/context/auth-context"
import { useData } from "@/context/data-context"
import { useEventYears } from "@/hooks/use-year-filter"
import { Spinner } from "@/components/ui/spinner"

export default function EventsPage() {
  const { isAdmin } = useAuth()
  const { workshopsAndShows, invitesAndBattles, isLoading } = useData()
  const years = useEventYears(workshopsAndShows, invitesAndBattles)
  const [selectedYear, setSelectedYear] = useState("all")

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner className="h-8 w-8 text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="mt-1 text-zinc-400">Track all crew events and activities</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <AddEventDialog />}
        </div>
      </div>

      <Tabs defaultValue="workshops" className="block w-full">
        <TabsList className="inline-flex h-10 w-auto bg-zinc-800 border border-zinc-700 rounded-lg p-1">
          <TabsTrigger
            value="workshops"
            className="px-4 py-2 text-sm text-zinc-400 rounded-md
              data-[state=active]:bg-zinc-700
              data-[state=active]:text-white!
              data-[state=active]:shadow-sm
              hover:text-zinc-200
              transition-all"
          >
            Workshops & Shows
          </TabsTrigger>
          <TabsTrigger
            value="battles"
            className="px-4 py-2 text-sm text-zinc-400 rounded-md
              data-[state=active]:bg-zinc-700
              data-[state=active]:text-white!
              data-[state=active]:shadow-sm
              hover:text-zinc-200
              transition-all"
          >
            Invites & Battles
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 w-full">
          <TabsContent value="workshops">
            <WorkshopsTable />
          </TabsContent>
          <TabsContent value="battles">
            <BattlesTable />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}