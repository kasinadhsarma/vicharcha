"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MoreHorizontal, Send, Smile, Check, ChevronRight } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import type { FeedPost } from "@/lib/types"

interface Comment {
  id: number
  username: string
  content: string
  timestamp: string
  likes: number
  isPremium?: boolean
}

interface CommentDialogProps {
  isOpen: boolean
  onClose: () => void
  post: FeedPost
  onAddComment: (comment: string) => void
  variant?: "dialog" | "sidebar"
}

export function CommentDialog({ 
  isOpen, 
  onClose, 
  post, 
  onAddComment,
  variant = "dialog" 
}: CommentDialogProps) {
  const [newComment, setNewComment] = useState("")
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set())
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        username: user?.name || "Anonymous",
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: 0,
        isPremium: user?.isPremium,
      }
      setComments([...comments, comment])
      onAddComment?.(newComment)
      setNewComment("")
    }
  }

  const toggleLike = (commentId: number) => {
    const newLiked = new Set(likedComments)
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId)
    } else {
      newLiked.add(commentId)
    }
    setLikedComments(newLiked)
  }

  const CommentContent = () => (
    <>
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
        <div className="text-lg font-semibold text-white">Comments ({comments.length})</div>
        <div className="flex items-center gap-2 text-sm text-white/90">
          <Avatar className="w-6 h-6">
            <AvatarImage src={post.userImage} />
            <AvatarFallback>{post.username[0]}</AvatarFallback>
          </Avatar>
          <span>{post.username}</span>
          {post.isVerified && (
            <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4 -mr-4">
        <AnimatePresence>
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-3 py-4 group border-b border-white/10 last:border-none hover:bg-white/5 rounded-lg px-2 transition-colors"
            >
              <Avatar className="w-8 h-8 ring-2 ring-white/20">
                <AvatarImage src={`/placeholder.svg?text=${comment.username[0]}`} />
                <AvatarFallback>{comment.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-white">{comment.username}</span>
                  {comment.isPremium && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    >
                      Premium
                    </Badge>
                  )}
                  <span className="text-xs text-white/60">
                    {(() => {
                      try {
                        const date = new Date(comment.timestamp)
                        const now = new Date()
                        const diff = (now.getTime() - date.getTime()) / 1000
                        
                        if (diff < 60) return 'Just now'
                        if (diff < 3600) return `${Math.floor(diff/60)}m`
                        if (diff < 86400) return `${Math.floor(diff/3600)}h`
                        if (diff < 604800) return `${Math.floor(diff/86400)}d`
                        return format(date, "MMM d")
                      } catch {
                        return "Invalid date"
                      }
                    })()}
                  </span>
                </div>
                <p className="text-sm text-white/90">{comment.content}</p>
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(comment.id)}
                    className={cn(
                      "flex items-center gap-1 transition-colors",
                      likedComments.has(comment.id) ? "text-red-500" : "hover:text-white"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        likedComments.has(comment.id) && "fill-current"
                      )}
                    />
                    <span>{comment.likes + (likedComments.has(comment.id) ? 1 : 0)}</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="hover:text-white transition-colors"
                  >
                    Reply
                  </motion.button>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>

      <div className="flex items-center gap-2 pt-4 border-t border-white/10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 hover:bg-white/10 text-white"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="h-5 w-5" />
        </Button>
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 bg-white/10 border-none text-white placeholder:text-white/60 focus-visible:ring-1 focus-visible:ring-white/20"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleAddComment()
            }
          }}
        />
        <Button 
          size="icon" 
          disabled={!newComment.trim()} 
          onClick={handleAddComment} 
          className={cn(
            "shrink-0 transition-colors",
            !newComment.trim() 
              ? "bg-white/10 text-white/60" 
              : "bg-blue-500 hover:bg-blue-600 text-white"
          )}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </>
  )

  if (variant === "sidebar") {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-y-0 right-0 w-96 bg-black/80 backdrop-blur-lg border-l border-white/10 shadow-xl z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Comments</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <CommentContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[80vh] bg-black/80 backdrop-blur-lg border-none">
        <CommentContent />
      </DialogContent>
    </Dialog>
  )
}
