"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Copy, 
  Share2, 
  Check,
  Send,
  Mail,
  MessageCircle
} from "lucide-react"
import type { FeedPost } from "@/lib/types"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  post: FeedPost
}

const shareOptions = [
  { icon: Facebook, label: "Facebook", color: "bg-blue-600" },
  { icon: Twitter, label: "Twitter", color: "bg-sky-500" },
  { icon: Instagram, label: "Instagram", color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500" },
  { icon: Send, label: "WhatsApp", color: "bg-green-500" },
  { icon: Linkedin, label: "LinkedIn", color: "bg-blue-700" },
  { icon: Mail, label: "Email", color: "bg-gray-600" },
  { icon: MessageCircle, label: "Message", color: "bg-violet-600" }
]

export function ShareDialog({ isOpen, onClose, post }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `https://vicharcha.com/posts/${post.id}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleShare = (platform: string) => {
    // Here you would implement the actual sharing logic
    console.log(`Sharing to ${platform}:`, {
      url: shareUrl,
      title: `Post by ${post.username}`,
      text: post.content,
      image: post.mediaUrls?.[0]
    })

    // Close dialog after sharing
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        
        {/* Share URL Input */}
        <div className="relative mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-violet-500/5 rounded-lg blur-lg" />
          <div className="relative flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 bg-background/50 backdrop-blur-sm border-none focus-visible:ring-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {shareOptions.map((option) => (
            <motion.button
              key={option.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare(option.label)}
              className="flex flex-col items-center gap-2"
            >
              <div className={`p-3 rounded-full ${option.color} text-white`}>
                <option.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{option.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Post Preview */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Post Preview</p>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {post.content || "No content"}
          </p>
          {post.mediaUrls?.[0] && (
            <div className="mt-2">
              <img
                src={post.mediaUrls[0]}
                alt="Post media"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              Posted by @{post.username}
            </p>
            {post.isVerified && (
              <div className="h-3 w-3 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="h-2 w-2 text-white" />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
