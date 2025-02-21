import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart, MessageCircle, Share2, VolumeX, Volume2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ReelProps {
  id: string
  username: string
  userImage: string
  video: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  categories: string[]
}

export function SidebarReels() {
  // Sample reel data
  const reels = [
    {
      id: '1',
      username: 'user1',
      userImage: '/avatars/1.png',
      video: '/videos/reel1.mp4',
      likes: 1200,
      comments: 45,
      shares: 20,
      isLiked: false,
      categories: ['fun', 'entertainment']
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4">
      {reels.map((reel) => (
        <Reel key={reel.id} {...reel} />
      ))}
    </div>
  )
}

function Reel({
  username,
  userImage,
  video,
  likes,
  comments,
  shares,
  isLiked: initialIsLiked,
  categories,
}: ReelProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(likes)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto relative overflow-hidden">
      <CardContent className="p-0">
        <video
          ref={videoRef}
          src={video}
          className="w-full h-[600px] object-cover"
          loop
          muted={isMuted}
          autoPlay
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center mb-2">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={userImage} alt={username} />
              <AvatarFallback>{username[0]}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{username}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((category) => (
              <span key={category} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                #{category}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="absolute right-4 bottom-20 flex flex-col items-center space-y-4">
        <Button variant="ghost" size="icon" onClick={handleLike} className="rounded-full bg-black/20 text-white">
          <AnimatePresence>
            <motion.div
              key={isLiked ? "liked" : "unliked"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Heart className={`h-6 w-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            </motion.div>
          </AnimatePresence>
        </Button>
        <span className="text-white text-sm">{likeCount}</span>
        <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white">
          <MessageCircle className="h-6 w-6" />
        </Button>
        <span className="text-white text-sm">{comments}</span>
        <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white">
          <Share2 className="h-6 w-6" />
        </Button>
        <span className="text-white text-sm">{shares}</span>
      </CardFooter>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="absolute top-4 right-4 rounded-full bg-black/20 text-white"
      >
        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
      </Button>
    </Card>
  )
}
