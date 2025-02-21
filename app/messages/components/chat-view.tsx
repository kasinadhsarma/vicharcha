"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, Video, MoreVertical, ImageIcon, Send, Smile, Users, ArrowLeft, Gift } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageAttachments } from "./message-attachments"
import { MessageBubble } from "./message-bubble"
import { EmojiPickerDialog } from "./emoji-picker"
import { GiphyPicker } from "./giphy-picker"
import { CallDialog } from "./call-dialog"
import { ProfileInfo } from "./profile-info"
import { MediaGallery } from "./media-gallery"
import { BotMessage } from "./bot-message"
import type { ChatWithDetails, Message, UserStatus } from "@/lib/types"
import { isGroupChat } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface ChatViewProps {
  chat: ChatWithDetails
  messages: Message[]
  onSendMessage: (message: string) => void
  onMediaSelect?: (file: File) => void
  currentUserId: string
  onBack?: () => void
  userStatuses?: Record<string, UserStatus>
  selectedChat: ChatWithDetails | null
}

export function ChatView({
  chat,
  messages,
  onSendMessage,
  onMediaSelect,
  currentUserId,
  onBack,
  selectedChat,
}: ChatViewProps) {
  const [messageText, setMessageText] = useState("")
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false)
  const [isProfileInfoOpen, setIsProfileInfoOpen] = useState(false)
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [isGiphyPickerOpen, setIsGiphyPickerOpen] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [botMessages, setBotMessages] = useState<Message[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (!selectedChat) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: message,
      senderId: currentUserId,
      chatId: selectedChat.id,
      createdAt: new Date().toISOString(),
      status: "sent",
    }
      onSendMessage(message)

    // Trigger bot reply if the chat is with a bot
    if (selectedChat.participantDetails.some((p) => p.role === "bot")) {
      setBotMessages((prev) => [...prev, newMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(messageText)
    }
  }

  const handleMediaSelect = (file: File) => {
    if (onMediaSelect) {
      onMediaSelect(file)
    }
  }

  const chatDisplayName = isGroupChat(chat)
    ? chat.name
    : chat.participantDetails.find((p) => p.id !== currentUserId)?.name || chat.name

  return (
    <div className="flex flex-col h-screen md:h-[100dvh] bg-background relative">
      {/* Chat Header */}
      <div className="h-16 md:h-20 border-b flex items-center justify-between px-4 md:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          {/* Back Button for Mobile */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>

          {/* Chat Avatar */}
          <div className="relative group cursor-pointer" onClick={() => setIsProfileInfoOpen(true)}>
            <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all duration-300">
              <AvatarImage src={chat.avatar} alt={chat.name} />
              <AvatarFallback>{isGroupChat(chat) ? <Users className="h-6 w-6" /> : chat.name[0]}</AvatarFallback>
            </Avatar>
          </div>

          {/* Chat Info */}
          <div className="flex flex-col cursor-pointer" onClick={() => setIsProfileInfoOpen(true)}>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight">{chatDisplayName}</h2>
              {!isGroupChat(chat) &&
                chat.participantDetails.find((p) => p.id !== currentUserId)?.role === "developer" && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Developer
                  </Badge>
                )}
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              {chat.status === "online" ? (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                  Online
                </span>
              ) : (
                "Last seen recently"
              )}
              {!isGroupChat(chat) && (
                <span className="text-xs text-muted-foreground">
                  {chat.participantDetails.find((p) => p.id !== currentUserId)?.department || ""}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Chat Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsCallDialogOpen(true)}>
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsCallDialogOpen(true)}>
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsMediaGalleryOpen(true)}>
                <ImageIcon className="mr-2 h-4 w-4" /> Media & Files
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Block Contact</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6 md:px-6 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <MessageBubble
                content={message.content}
                sender={message.senderId === currentUserId ? "you" : "them"}
                time={new Date(message.createdAt).toLocaleTimeString()}
                status={message.status}
                senderName={
                  message.senderId === currentUserId
                    ? "You"
                    : isGroupChat(chat)
                      ? chat.participantDetails.find((p) => p.id === message.senderId)?.name || "Unknown"
                      : chatDisplayName
                }
                isDeveloper={chat.participantDetails.find((p) => p.id === message.senderId)?.role === "developer"}
              />
              {selectedChat?.participantDetails.some((p) => p.role === "bot") && message.senderId === currentUserId && (
                <BotMessage
                  message={message.content}
                  onReply={(reply: string) => {
                    const botReply: Message = {
                      id: `bot-msg-${Date.now()}`,
                      content: reply,
                      senderId: selectedChat.participantDetails.find((p) => p.role === "bot")?.id || "",
                      chatId: selectedChat.id,
                      createdAt: new Date().toISOString(),
                      status: "delivered",
                    }
                    onSendMessage(reply)
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="sticky bottom-0 left-0 right-0 p-2 md:p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIsEmojiPickerOpen(true)}>
              <Smile className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsGiphyPickerOpen(true)}>
              <Gift className="h-5 w-5" />
            </Button>
          </div>
          {onMediaSelect && <MessageAttachments onFileSelect={handleMediaSelect} />}
          <Input
            placeholder="Type a message..."
            className="flex-1 px-4 bg-muted/50 hover:bg-muted focus:bg-background rounded-full border-none transition-colors"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button size="icon" onClick={() => handleSendMessage(messageText)} disabled={!messageText.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <CallDialog isOpen={isCallDialogOpen} onClose={() => setIsCallDialogOpen(false)} />
      <ProfileInfo isOpen={isProfileInfoOpen} onClose={() => setIsProfileInfoOpen(false)} chat={chat} />
      <MediaGallery
        isOpen={isMediaGalleryOpen}
        onClose={() => setIsMediaGalleryOpen(false)}
        messages={messages}
        chatName={chatDisplayName}
      />
      <EmojiPickerDialog
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelect={(emoji) => setMessageText((prev) => prev + emoji)}
      />
      <GiphyPicker 
        isOpen={isGiphyPickerOpen}
        onClose={() => setIsGiphyPickerOpen(false)}
        onSelect={(gif) => {
          handleSendMessage(gif.url);
          setIsGiphyPickerOpen(false);
        }}
      />
    </div>
  )
}
