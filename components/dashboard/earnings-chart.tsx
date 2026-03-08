"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/context/data-context"
import { getEarningsChartData } from "@/utils/calculations"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export function EarningsChart() {
  const { workshopsAndShows } = useData()
  const chartData = getEarningsChartData(workshopsAndShows)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Monthly Earnings</CardTitle>
        <CardDescription className="text-zinc-400">
          Revenue breakdown by workshops and shows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#71717a", fontSize: 12 }}
                axisLine={{ stroke: "#3f3f46" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#ffffff" }}
                itemStyle={{ color: "#a1a1aa" }}
                formatter={(value) => [`€${value ?? 0}`, ""]}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => (
                  <span className="text-zinc-400 text-sm capitalize">{value}</span>
                )}
              />
              <Bar
                dataKey="workshops"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Workshops"
              />
              <Bar
                dataKey="shows"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
                name="Shows"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}