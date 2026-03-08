// "use client"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { useData } from "@/context/data-context"
// import { calculateMemberStats, formatCurrency } from "@/utils/calculations"
// import { Trophy, Medal, Award } from "lucide-react"

// export function EarningsRanking() {
//   const { members, workshopsAndShows, invitesAndBattles } = useData()
//   const stats = calculateMemberStats(members, workshopsAndShows, invitesAndBattles)
//   const sortedByEarnings = [...stats].sort(
//     (a, b) => b.totalEarnings - a.totalEarnings
//   )

//   return (
//     <Card className="bg-zinc-900 border-zinc-800">
//       <CardHeader>
//         <CardTitle className="text-white flex items-center gap-2">
//           <Trophy className="h-5 w-5 text-amber-400" />
//           Earnings Ranking
//         </CardTitle>
//         <CardDescription className="text-zinc-400">
//           Members ranked by total earnings from paid events
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-3">
//           {sortedByEarnings.map((member, index) => (
//             <div
//               key={member.name}
//               className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
//                 index < 3
//                   ? index === 0
//                     ? "bg-linear-to-r from-amber-950/50 to-transparent border border-amber-800/50"
//                     : index === 1
//                     ? "bg-linear-to-r from-zinc-700/50 to-transparent border border-zinc-600/50"
//                     : "bg-linear-to-r from-amber-900/30 to-transparent border border-amber-900/50"
//                   : "bg-zinc-800/30 hover:bg-zinc-800/50"
//               }`}
//             >
//               <div className="flex items-center justify-center w-8 h-8 shrink-0">
//                 {index === 0 ? (
//                   <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
//                     <Trophy className="h-4 w-4 text-amber-950" />
//                   </div>
//                 ) : index === 1 ? (
//                   <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center">
//                     <Medal className="h-4 w-4 text-zinc-700" />
//                   </div>
//                 ) : index === 2 ? (
//                   <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center">
//                     <Award className="h-4 w-4 text-amber-100" />
//                   </div>
//                 ) : (
//                   <span className="text-lg font-bold text-zinc-500">
//                     {index + 1}
//                   </span>
//                 )}
//               </div>

//               <Avatar className="h-10 w-10 border border-zinc-700">
//                 <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
//                   {member.name.slice(0, 2).toUpperCase()}
//                 </AvatarFallback>
//               </Avatar>

//               <div className="flex-1 min-w-0">
//                 <p
//                   className={`font-medium truncate ${
//                     index < 3 ? "text-white" : "text-zinc-300"
//                   }`}
//                 >
//                   {member.name}
//                 </p>
//                 <p className="text-xs text-zinc-500">
//                   {member.workshopCount + member.showCount} paid events
//                 </p>
//               </div>

//               <div className="text-right">
//                 <p
//                   className={`font-bold ${
//                     index === 0
//                       ? "text-amber-400 text-lg"
//                       : index < 3
//                       ? "text-emerald-400"
//                       : "text-zinc-400"
//                   }`}
//                 >
//                   {formatCurrency(member.totalEarnings)}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export function ParticipationRanking() {
//   const { members, workshopsAndShows, invitesAndBattles } = useData()
//   const stats = calculateMemberStats(members, workshopsAndShows, invitesAndBattles)
//   const sortedByEvents = [...stats].sort((a, b) => b.totalEvents - a.totalEvents)

//   return (
//     <Card className="bg-zinc-900 border-zinc-800">
//       <CardHeader>
//         <CardTitle className="text-white flex items-center gap-2">
//           <Trophy className="h-5 w-5 text-sky-400" />
//           Participation Ranking
//         </CardTitle>
//         <CardDescription className="text-zinc-400">
//           Members ranked by total event participation
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-3">
//           {sortedByEvents.map((member, index) => (
//             <div
//               key={member.name}
//               className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
//                 index < 3
//                   ? index === 0
//                     ? "bg-linear-to-r from-sky-950/50 to-transparent border border-sky-800/50"
//                     : index === 1
//                     ? "bg-linear-to-r from-zinc-700/50 to-transparent border border-zinc-600/50"
//                     : "bg-linear-to-r from-sky-900/30 to-transparent border border-sky-900/50"
//                   : "bg-zinc-800/30 hover:bg-zinc-800/50"
//               }`}
//             >
//               <div className="flex items-center justify-center w-8 h-8 shrink-0">
//                 {index === 0 ? (
//                   <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
//                     <Trophy className="h-4 w-4 text-sky-950" />
//                   </div>
//                 ) : index === 1 ? (
//                   <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center">
//                     <Medal className="h-4 w-4 text-zinc-700" />
//                   </div>
//                 ) : index === 2 ? (
//                   <div className="w-8 h-8 rounded-full bg-sky-700 flex items-center justify-center">
//                     <Award className="h-4 w-4 text-sky-100" />
//                   </div>
//                 ) : (
//                   <span className="text-lg font-bold text-zinc-500">
//                     {index + 1}
//                   </span>
//                 )}
//               </div>

//               <Avatar className="h-10 w-10 border border-zinc-700">
//                 <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
//                   {member.name.slice(0, 2).toUpperCase()}
//                 </AvatarFallback>
//               </Avatar>

//               <div className="flex-1 min-w-0">
//                 <p
//                   className={`font-medium truncate ${
//                     index < 3 ? "text-white" : "text-zinc-300"
//                   }`}
//                 >
//                   {member.name}
//                 </p>
//                 <p className="text-xs text-zinc-500">
//                   {member.workshopCount}W / {member.showCount}S / {member.battleCount}B / {member.inviteCount}I
//                 </p>
//               </div>

//               <div className="text-right">
//                 <p
//                   className={`font-bold ${
//                     index === 0
//                       ? "text-sky-400 text-lg"
//                       : index < 3
//                       ? "text-sky-400"
//                       : "text-zinc-400"
//                   }`}
//                 >
//                   {member.totalEvents} events
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
