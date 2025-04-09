"use client"

import { useEffect, useState } from "react"
import { useResponsive } from "@/hooks/use-responsive"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/login/components/auth-provider"
import { ChatView } from "./components/chat-view"
import { ChatList } from "./components/chat-list"
import { cn } from "@/lib/utils"

type ParticipantDetail = {
  id: string
  name: string
  avatar: string
  status: string
  lastSeen: string
  isPremium: boolean
}

type ChatWithDetails = {
  id: string
  name: string
  avatar: string
  participants: string[]
  participantDetails: ParticipantDetail[]
  status: "online" | "offline"
  isTyping: boolean
  isGroup: boolean
  lastMessage: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

type Message = {
  id: string
  content: string
  senderId: string
  chatId: string
  createdAt: string
  status: "delivered" | "read" | "sent"
}

const demoChats: ChatWithDetails[] = [
  {
    id: "demo-chat-1",
    name: "Alice Johnson",
    avatar: "/placeholder-user.jpg",
    participants: ["1234567890", "alice123"],
    participantDetails: [
      {
        id: "alice123",
        name: "Alice Johnson",
        avatar: "/placeholder-user.jpg",
        status: "online",
        lastSeen: new Date().toISOString(),
        isPremium: true
      }
    ],
    status: "online",
    isTyping: false,
    isGroup: false,
    lastMessage: {
      id: "msg-1",
      content: "Hey! How's it going?",
      senderId: "alice123",
      chatId: "demo-chat-1",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: "delivered"
    },
    unreadCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "demo-chat-2",
    name: "Team Project",
    avatar: "/placeholder-user.jpg",
    participants: ["1234567890", "bob123", "carol123"],
    participantDetails: [
      {
        id: "bob123",
        name: "Bob Smith",
        avatar: "/placeholder-user.jpg",
        status: "offline",
        lastSeen: new Date().toISOString(),
        isPremium: false
      },
      {
        id: "carol123",
        name: "Carol White",
        avatar: "/placeholder-user.jpg",
        status: "online",
        lastSeen: new Date().toISOString(),
        isPremium: true
      }
    ],
    status: "online",
    isTyping: true,
    isGroup: false,
    lastMessage: {
      id: "msg-2",
      content: "Let's schedule a meeting for tomorrow",
      senderId: "bob123",
      chatId: "demo-chat-2",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: "read"
    },
    unreadCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "demo-chat-3",
    name: "Support Chat",
    avatar: "/placeholder-user.jpg",
    participants: ["1234567890", "support123"],
    participantDetails: [
      {
        id: "support123",
        name: "Customer Support",
        avatar: "/placeholder-user.jpg",
        status: "online",
        lastSeen: new Date().toISOString(),
        isPremium: true
      }
    ],
    status: "online",
    isTyping: false,
    isGroup: false,
    lastMessage: {
      id: "msg-3",
      content: "How can I help you today?",
      senderId: "support123",
      chatId: "demo-chat-3",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: "read"
    },
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export default function MessagesPage() {
  // Mock a logged-in user for demo
  const mockUser = {
    phoneNumber: "1234567890",
    name: "Demo User",
    avatar: "/placeholder-user.jpg"
  }
  const { user = mockUser, loading = false } = useAuth()
  const router = useRouter()
  const [selectedChat, setSelectedChat] = useState<ChatWithDetails | null>(demoChats[0])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "demo-msg-1",
      content: "👋 Hi there! Hope you're doing well!",
      senderId: "alice123",
      chatId: "demo-chat-1",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      status: "read"
    },
    {
      id: "demo-msg-2",
      content: "Thanks! Just checking out the new messaging interface.",
      senderId: "1234567890",
      chatId: "demo-chat-1",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      status: "read"
    },
    {
      id: "demo-msg-3",
      content: "It looks great! Love the new features 🎉",
      senderId: "alice123",
      chatId: "demo-chat-1",
      createdAt: new Date(Date.now() - 1000 * 60 * 29).toISOString(), // 29 minutes ago
      status: "delivered"
    },
    {
      id: "demo-msg-4",
      content: "Have you tried the emoji picker? 😊",
      senderId: "alice123",
      chatId: "demo-chat-1",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      status: "delivered"
    }
  ])
  const [showChatView, setShowChatView] = useState(false)
  const { isMobile } = useResponsive()

  useEffect(() => {
    if (!loading && !user) {
      const savedUser = localStorage.getItem("user")
      if (!savedUser) {
        router.push("/login")
      }
    }
  }, [user, loading, router])

  // Skip loading check for demo
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleSendMessage = async (message: string) => {
    if (!selectedChat) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: message,
      senderId: user.phoneNumber,
      chatId: selectedChat.id,
      createdAt: new Date().toISOString(),
      status: "sent"
    }
    setMessages(prev => [...prev, newMessage])
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] overflow-hidden bg-background md:flex-row">
      {/* Sidebar - Chat List */}
      <aside
        className={cn(
          "w-full md:w-[320px] lg:w-[380px] shrink-0 border-r",
          "transition-transform duration-300 ease-in-out",
          "md:relative md:translate-x-0",
          {
            "absolute inset-0 z-20 translate-x-0 bg-background": !showChatView && isMobile,
            "absolute inset-0 z-20 -translate-x-full": showChatView && isMobile
          }
        )}
      >
        <ChatList
          chats={demoChats}
          selectedChat={selectedChat?.id || ""}
          onSelectChat={(chatId) => {
            const chat = demoChats.find(c => c.id === chatId)
            if (chat) {
              setSelectedChat(chat)
              setShowChatView(true)
            }
          }}
        />
      </aside>

      {/* Chat View */}
      <main 
        className={cn(
          "flex-1 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "relative md:translate-x-0",
          {
            "absolute inset-0 z-10 translate-x-full": !showChatView && isMobile,
            "absolute inset-0 z-10 translate-x-0": showChatView && isMobile
          }
        )}
      >
        {selectedChat ? (
          <ChatView
            currentUserId={user.phoneNumber}
            chat={selectedChat}
            messages={messages}
            onSendMessage={handleSendMessage}
            onMediaSelect={(file) => console.log("Media selected:", file)}
            onBack={() => setShowChatView(false)}
            selectedChat={selectedChat}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </main>
    </div>
  )
}
