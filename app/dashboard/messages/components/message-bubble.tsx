"use client"

import { motion } from "framer-motion"
import { Check, SmilePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MessageBubbleProps {
  sender: "you" | "them"
  content: string
  time: string
  status?: "sent" | "delivered" | "read"
  media?: {
    url: string
    caption: string
  }
  isLast?: boolean
  onMediaClick?: () => void
  isPremium?: boolean
  senderName?: string
  isDeveloper?: boolean
  isGif?: boolean
}

export function MessageBubble({
  sender,
  content,
  time,
  status = "sent",
  media,
  isLast,
  onMediaClick,
  isPremium,
  senderName,
  isDeveloper,
  isGif,
}: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex group relative", sender === "you" ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "rounded-2xl max-w-[85%] md:max-w-[65%]",
          "transform transition-all duration-200 hover:scale-[1.02]",
          "relative group/bubble",
          sender === "you"
            ? cn(
                "bg-gradient-to-br",
                isPremium
                  ? "from-amber-500 to-orange-600 text-white shadow-amber-500/20"
                  : "from-blue-600 to-blue-700 text-white shadow-blue-500/10",
                "shadow-md hover:shadow-xl",
              )
            : "bg-muted/90 hover:bg-muted shadow-sm hover:shadow-md",
        )}
      >
        {/* Media Content */}
        {media && (
          <div className="p-1">
            <motion.button
              className="relative group/media w-full overflow-hidden rounded-lg"
              onClick={onMediaClick}
              layoutId={`media-${media.url}`}
            >
              <img
                src={media.url || "/placeholder.svg"}
                alt={media.caption}
                className="rounded-lg max-h-[300px] w-auto object-cover transition-all duration-200 group-hover/media:brightness-90"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium">View</span>
              </div>
            </motion.button>
            {media.caption && <p className="text-sm opacity-70 px-2 py-1 line-clamp-2">{media.caption}</p>}
          </div>
        )}

        {/* Message Content */}
        <div className="p-4 space-y-1">
          {sender === "them" && senderName && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium opacity-70">{senderName}</span>
              {isDeveloper && (
                <span className="text-[0.65rem] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Dev</span>
              )}
            </div>
          )}
          {isGif ? (
            <img
              src={content.replace("[GIF] ", "") || "/placeholder.svg"}
              alt="GIF"
              className="max-w-full h-auto rounded-lg"
            />
          ) : (
            <p className="whitespace-pre-wrap break-words text-[0.925rem] leading-relaxed">{content}</p>
          )}
          <div className="flex items-center justify-end gap-1.5">
            <p className="text-[0.65rem] opacity-70">{time}</p>
            {sender === "you" && (
              <div className={cn("flex text-[0.65rem]", status === "read" ? "text-blue-300" : "opacity-70")}>
                <Check className="h-2.5 w-2.5" />
                {(status === "delivered" || status === "read") && <Check className="h-2.5 w-2.5 -ml-1" />}
              </div>
            )}
          </div>
        </div>

        {/* Quick Reactions */}
        <motion.div
          initial={false}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
            sender === "you" ? "-left-12" : "-right-12",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background hover:scale-110 transition-transform"
          >
            <SmilePlus className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

