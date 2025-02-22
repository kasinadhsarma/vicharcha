"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Heart } from "lucide-react"
import { useState } from "react"

interface LikeButtonProps {
  initialLikes: number
  isLiked?: boolean
  onLike: () => void
}

export function LikeButton({ initialLikes, isLiked = false, onLike }: LikeButtonProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(initialLikes)

  const handleLike = () => {
    if (!liked) {
      setLikeCount((prev) => prev + 1)
      onLike()
    } else {
      setLikeCount((prev) => prev - 1)
    }
    setLiked(!liked)
  }

  return (
    <button
      className="group flex items-center gap-1 focus:outline-none"
      onClick={handleLike}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <AnimatePresence>
          {liked ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Heart className="h-6 w-6 fill-red-500 text-red-500" />
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Heart className="h-6 w-6 group-hover:text-red-500 transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        <motion.span
          key={likeCount}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="text-sm font-medium"
        >
          {likeCount.toLocaleString()}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
