"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Users, Star, PlusCircle, ImageIcon, Clock, MoreHorizontal, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import type { ChatWithDetails } from "@/lib/types"
import { useState } from "react"

interface ChatListProps {
  chats: ChatWithDetails[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
  loading?: boolean;
}

export function ChatList({ chats, selectedChat, onSelectChat, loading = false }: ChatListProps) {
  const [filteredChats, setFilteredChats] = useState<ChatWithDetails[]>(chats)
  return (
    <div className="h-full flex flex-col bg-background">
      {/* List Header */}
      <div className="p-4 md:p-6 border-b">
        <div className="flex items-center gap-4 mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Messages</h2>
          <Button variant="secondary" size="icon" className="ml-auto rounded-full hover:scale-105 transition-transform">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            <Input
              placeholder="Search messages..."
              className="pl-9 w-full bg-muted/50 border-none focus-visible:ring-1 rounded-full"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase()
                setFilteredChats(
                  chats.filter(
                    (chat) =>
                      chat.name.toLowerCase().includes(searchTerm) ||
                      chat.participantDetails.some((p) => p.name.toLowerCase().includes(searchTerm)),
                  ),
                )
              }}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Messages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Clock className="mr-2 h-4 w-4" /> Recent
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" /> Favorites
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ImageIcon className="mr-2 h-4 w-4" /> With Media
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 p-1 bg-muted/50">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="relative text-xs md:text-sm">
              Unread
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
              >
                {chats.reduce((acc, chat) => acc + chat.unreadCount, 0)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs md:text-sm">
              <Users className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs md:text-sm">
              <Star className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2 py-2 md:py-4">
        {loading ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center space-x-4 p-3">
                <div className="h-10 md:h-12 w-10 md:w-12 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {filteredChats.map((chat) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  "w-full flex items-center space-x-3 md:space-x-4 p-2 md:p-3 rounded-xl transition-all",
                  "hover:bg-accent/50 active:scale-[0.98]",
                  selectedChat === chat.id && "bg-accent/50 shadow-sm ring-1 ring-accent",
                  "my-1 relative group",
                )}
              >
                <div className="relative shrink-0">
                  <Avatar
                    className={cn(
                      "h-10 w-10 md:h-12 md:w-12 border-2 border-background transition-transform hover:scale-105",
                      chat.participantDetails.some((p) => p.isPremium) && "ring-2 ring-amber-500",
                    )}
                  >
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.status === "online" && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 md:h-4 md:w-4 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5 md:mb-1">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm truncate">{chat.name}</p>
                      {chat.participantDetails.some((p) => p.isPremium) && (
                        <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[0.65rem] md:text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {format(new Date(chat.updatedAt), "HH:mm")}
                    </span>
                  </div>
                  <div className="flex flex-col text-[0.65rem] md:text-xs text-muted-foreground">
                    {chat.status === "online" && (
                      <span className="text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        online
                      </span>
                    )}
                    {chat.isTyping && (
                      <span className="text-blue-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        typing...
                      </span>
                    )}
                    {!chat.isTyping && chat.lastMessage && (
                      <p className="truncate opacity-70">{chat.lastMessage.content}</p>
                    )}
                  </div>
                </div>

                {chat.unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground text-xs shrink-0">
                    {chat.unreadCount}
                  </Badge>
                )}

                {/* Hover Actions */}
                <AnimatePresence>
                  {selectedChat !== chat.id && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-background shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </ScrollArea>
    </div>
  )
}

