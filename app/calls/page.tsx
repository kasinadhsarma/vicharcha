"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Phone,
  Video,
  MoreVertical,
  Search,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Users,
  Sparkles,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { VideoCallDialog } from "@/components/calls/video-call-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface Call {
  id: string
  name: string
  date: string
  time: string
  type: "incoming" | "outgoing" | "missed"
  isVideo: boolean
  isPremium?: boolean
}

export default function Calls() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [activeCall, setActiveCall] = useState<Call | null>(null)

  const [recentCalls, setRecentCalls] = useState<Call[]>([
    {
      id: "1",
      name: "Priya Sharma",
      date: "2023-05-15",
      time: "14:30",
      type: "incoming",
      isVideo: false,
      isPremium: true,
    },
    {
      id: "2",
      name: "Rahul Patel",
      date: "2023-05-14",
      time: "10:15",
      type: "outgoing",
      isVideo: true,
    },
    {
      id: "3",
      name: "Anita Desai",
      date: "2023-05-13",
      time: "18:45",
      type: "missed",
      isVideo: false,
      isPremium: true,
    },
  ])

  const initiateCall = (call: Call) => {
    setActiveCall(call)
    setIsCallActive(true)
  }

  const CallIcon = ({ type, isVideo }: { type: Call["type"]; isVideo: boolean }) => {
    if (isVideo) return <Video className="h-4 w-4" />
    switch (type) {
      case "incoming":
        return <PhoneIncoming className="h-4 w-4 text-green-500" />
      case "outgoing":
        return <PhoneOutgoing className="h-4 w-4 text-blue-500" />
      case "missed":
        return <PhoneMissed className="h-4 w-4 text-red-500" />
      default:
        return <Phone className="h-4 w-4" />
    }
  }

  return (
    <div className="w-full px-4 py-6 max-w-3xl mx-auto">
      <Card className="border-0 md:border">
        <CardHeader className="border-b px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Calls</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search calls" className="pl-9 w-[200px]" />
              </div>
              <Button size="sm" className="gap-1.5">
                <Phone className="h-4 w-4" />
                <span className="hidden md:inline">New Call</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b h-12">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="missed" className="flex items-center gap-2">
                <PhoneMissed className="h-4 w-4" />
                Missed
              </TabsTrigger>
              <TabsTrigger value="group" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Group
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="m-0">
              <ScrollArea className="h-[calc(100vh-14rem)] md:h-[calc(100vh-16rem)] smooth-scroll">
                <div className="divide-y">
                  {recentCalls.map((call) => (
                    <div key={call.id} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-rose-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-colors" />
                      <div className="flex items-center justify-between px-4 py-3 relative">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="relative">
                            <Avatar className="h-10 w-10 ring-2 ring-background">
                              <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={call.name} />
                              <AvatarFallback>{call.name[0]}</AvatarFallback>
                            </Avatar>
                            {call.isPremium && (
                              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-1">
                                <Sparkles className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm md:text-base">{call.name}</p>
                              {call.isPremium && (
                                <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                              <CallIcon type={call.type} isVideo={call.isVideo} />
                              <span className="ml-2">{new Date(`${call.date} ${call.time}`).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => initiateCall({ ...call, isVideo: false })}
                            className="hover:bg-purple-500/10"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => initiateCall({ ...call, isVideo: true })}
                            className="hover:bg-blue-500/10"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-rose-500/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Call Details</DropdownMenuItem>
                              <DropdownMenuItem>Block Contact</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Remove from History</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isCallActive && activeCall?.isVideo ? (
        <VideoCallDialog
          isOpen={isCallActive}
          onClose={() => setIsCallActive(false)}
          callerName={activeCall.name}
          callerImage={`/placeholder.svg?height=96&width=96`}
          callId={activeCall.id}
          userId={""}
          onCallStatusChange={(status) => {
            // Update call status in UI
            const updatedCalls = recentCalls.map(call => 
              call.id === activeCall.id 
                ? { ...call, status: status as "ongoing" | "ended" | "missed" } 
                : call
            );
            setRecentCalls(updatedCalls);
          }}
        />
      ) : (
        <Dialog open={isCallActive} onOpenChange={setIsCallActive}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex flex-col items-center space-y-4 py-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={`/placeholder.svg?height=96&width=96`} alt={activeCall?.name} />
                  <AvatarFallback>{activeCall?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-xl font-semibold">{activeCall?.name}</div>
                <div className="text-sm text-muted-foreground">Voice Call</div>
                <div className="text-sm text-muted-foreground">Calling...</div>
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setIsCallActive(false)}
                >
                  <Phone className="h-6 w-6 rotate-[135deg]" />
                </Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
