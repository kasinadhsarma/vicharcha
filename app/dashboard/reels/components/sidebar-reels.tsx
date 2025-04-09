"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react"

interface SidebarReelsProps {
  className?: string
}

export function SidebarReels({ className }: SidebarReelsProps) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <div className={cn("flex flex-col gap-6 p-4", className)}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span className="font-medium">username</span>
          <Button variant="outline" size="sm" className="ml-auto">
            Follow
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={cn(liked && "text-red-500")}
            onClick={() => setLiked(!liked)}
          >
            <Heart className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(saved && "text-yellow-500")}
            onClick={() => setSaved(!saved)}
          >
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>
        <div className="space-y-1">
          <p className="font-medium">1,234 likes</p>
          <p className="text-sm text-muted-foreground">View all 123 comments</p>
          <p className="text-xs text-muted-foreground">2 DAYS AGO</p>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          <p className="text-sm">
            Caption goes here #reels #viral #trending
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="Commenter" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <p className="text-sm">
                <span className="font-medium">commenter</span> Nice video! 🔥
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}