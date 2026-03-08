"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface YearFilterProps {
  years: string[]
  value: string
  onChange: (year: string) => void
}

export function YearFilter({ years, value, onChange }: YearFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-30 bg-zinc-800 border-zinc-700 text-white">
        <SelectValue placeholder="All years" />
      </SelectTrigger>
      <SelectContent className="bg-zinc-800 border-zinc-700">
        <SelectItem value="all" className="text-white">
          All years
        </SelectItem>
        {years.map((year) => (
          <SelectItem key={year} value={year} className="text-white">
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
