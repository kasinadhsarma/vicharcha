"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, Mail, MapPin, Link, FileText, Bell, BlocksIcon as Block, Users, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatWithDetails } from "@/lib/types"
import { isGroupChat } from "@/lib/types"
import { format } from "date-fns"

interface ProfileInfoProps {
  isOpen: boolean
  onClose: () => void
  chat: ChatWithDetails
}

export function ProfileInfo({ isOpen, onClose, chat }: ProfileInfoProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isGroupChat(chat) ? "Group Information" : "Contact Information"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className={cn(
              "h-24 w-24 ring-2",
              isGroupChat(chat) ? "ring-primary" : "ring-muted"
            )}>
              <AvatarImage src={chat.avatar} alt={chat.name} />
              <AvatarFallback>
                {isGroupChat(chat) ? <Users className="h-8 w-8" /> : chat.name[0]}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-semibold">{chat.name}</h2>
            
            <div className="w-full space-y-4">
              {isGroupChat(chat) ? (
                // Group information
                <>
                  <div className="flex items-center space-x-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <p className="flex-1">{chat.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <span>Created by {chat.owner.name}</span>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Members ({chat.participantDetails.length})</h3>
                      <span className="text-xs text-muted-foreground">
                        {chat.participantDetails.filter(p => p.status === 'online').length} online
                      </span>
                    </div>
                    <div className="space-y-3">
                      {chat.participantDetails.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={participant.avatar} alt={participant.name} />
                              <AvatarFallback>{participant.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">{participant.name}</span>
                                {participant.isPremium && (
                                  <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full">
                                    Premium
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {participant.status === 'online' ? (
                                  <span className="text-green-500">online</span>
                                ) : (
                                  `Last seen ${participant.lastSeen}`
                                )}
                              </p>
                            </div>
                          </div>
                          {chat.admins.includes(participant.id) && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // Individual contact information
                <>
                  {chat.participantDetails.map(participant => (
                    <div key={participant.id} className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          participant.status === 'online' ? "bg-green-500" : "bg-muted"
                        )} />
                        <span>
                          {participant.status === 'online' 
                            ? 'Online'
                            : `Last seen ${participant.lastSeen}`
                          }
                        </span>
                      </div>
                      {participant.isPremium && (
                        <div className="flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                          <span className="text-sm text-amber-600 font-medium">Premium User</span>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="w-full space-y-4 pt-4">
              <Button className="w-full" variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Mute Notifications
              </Button>
              <Button variant="destructive" className="w-full">
                <Block className="mr-2 h-4 w-4" />
                Block {isGroupChat(chat) ? "Group" : "Contact"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
