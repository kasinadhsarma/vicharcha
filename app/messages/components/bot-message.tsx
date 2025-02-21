"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot } from "lucide-react"

interface BotMessageProps {
  message: string
  onReply: (reply: string) => void
}

export function BotMessage({ message, onReply }: BotMessageProps) {
  const [isLoading, setIsLoading] = useState(false)

  const generateResponse = async () => {
    setIsLoading(true)
    try {
      // This is a mock response. In a real app, you would call your AI service here
      const response = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`I received your message: "${message}". How can I help you?`)
        }, 1000)
      })
      onReply(response)
    } catch (error) {
      console.error("Failed to generate bot response:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-generate response when component mounts
  useState(() => {
    generateResponse()
  })

  return (
    <div className="flex items-start gap-3 ml-12">
      <Avatar className="h-8 w-8 bg-primary/10">
        <AvatarImage src="/bot-avatar.png" />
        <AvatarFallback className="bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </AvatarFallback>
      </Avatar>
      <div className="rounded-2xl bg-muted/50 p-3 text-sm max-w-[70%]">
        {isLoading ? (
          <div className="flex space-x-2 items-center h-6">
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
