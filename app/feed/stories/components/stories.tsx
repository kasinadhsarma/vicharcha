"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MLStoriesAnalysis } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Plus, ChevronLeft, ChevronRight, X, Pause, Play, Volume2, VolumeX } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/contexts/translation-context"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Story, ClientStory, StoryItem } from '@/lib/types'

interface APIResponse {
  success: boolean
  stories: (Story & { username: string })[]
}

interface StoriesProps {
  mlAnalysis?: MLStoriesAnalysis;
}

export function Stories({ mlAnalysis }: StoriesProps) {
  const [stories, setStories] = useState<ClientStory[]>([])
  const [loading, setLoading] = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { translate, currentLanguage } = useTranslation()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/stories/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      
      // Add the new story to the list
      const type = file.type.startsWith('video/') ? 'video' as const : 'image' as const
      const newStory: ClientStory = {
        id: Date.now(),
        username: "You",
        userImage: "/placeholder-user.jpg",
        storyImage: data.url,
        isViewed: false,
        isPremium: false,
        duration: type === 'video' ? 10 : 5,
        type
      }

      setStories(prev => [newStory, ...prev])
      
      toast({
        title: await translate("Story Added"),
        description: await translate("Your story has been uploaded successfully."),
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: "destructive",
        title: await translate("Error"),
        description: await translate("Failed to upload story. Please try again."),
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Fetch stories effect and handlers...
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories')
        if (!response.ok) throw new Error('Failed to fetch stories')
    
        const data = await response.json() as APIResponse
        const transformedStories: ClientStory[] = data.stories
          .map((story) => {
            const clientStory: ClientStory = {
              id: Number(story.id),
              username: story.username,
              userImage: story.userImage || '/placeholder-user.jpg',
              storyImage: story.mediaUrl,
              isViewed: story.isViewed || false,
              isPremium: story.isPremium || false,
              duration: story.duration || 5,
              type: story.type
            }
            return clientStory
          })
          .filter((story): story is ClientStory => story !== null)
    
        setStories(transformedStories)
      } catch (error) {
        console.error("Error fetching stories:", error)
        toast({
          variant: "destructive",
          title: await translate("Error"),
          description: await translate("Could not load stories. Please try again."),
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchStories()
  }, [toast, translate])

  // Story playback state
  const [selectedStory, setSelectedStory] = useState<ClientStory | null>(null)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const progressTimer = useRef<NodeJS.Timeout>()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Story handlers...
  const handleStoryClick = (story: ClientStory) => {
    setProgress(0)
    setIsPlaying(true)
    setIsMuted(false)
    setSelectedStory(story)

    setStories(prev =>
      prev.map(s => s.id === story.id ? { ...s, isViewed: true } : s)
    )
  }

  const handleClose = () => {
    setSelectedStory(null)
    setProgress(0)
    setIsPlaying(false)
    if (progressTimer.current) {
      clearInterval(progressTimer.current)
    }
  }

  const handleNext = () => {
    if (!selectedStory) return

    const currentIndex = stories.findIndex(s => s.id === selectedStory.id)
    if (currentIndex < stories.length - 1) {
      handleStoryClick(stories[currentIndex + 1])
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (!selectedStory) return

    const currentIndex = stories.findIndex(s => s.id === selectedStory.id)
    if (currentIndex > 0) {
      handleStoryClick(stories[currentIndex - 1])
    }
  }

  // Media controls
  const togglePlayback = () => {
    if (selectedStory?.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
    setIsMuted(!isMuted)
  }

  return (
    <>
      {loading ? (
        <Card className="p-4 mb-4 relative">
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 px-1">
            {/* Add Story Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-[72px] h-[100px] p-0 overflow-hidden relative group rounded-xl cursor-pointer border-2 border-dashed",
                  uploading 
                    ? "border-primary animate-pulse" 
                    : "border-muted-foreground/50 hover:border-muted-foreground/80"
                )}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Upload new story"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center px-2">
                    {uploading ? "Uploading..." : "Add Story"}
                  </span>
                  {uploading && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-slide" />
                      </div>
                    </div>
                  )}
                </div>
              </Button>
            </motion.div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0">
                <Skeleton className="w-[72px] h-[100px] rounded-xl" />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-4 mb-4 relative">
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 px-1">
            {stories.map((story) => (
              <motion.div
                key={story.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Button
                  variant="ghost"
                  className="w-[72px] h-[100px] p-0 overflow-hidden relative group rounded-xl cursor-pointer"
                  onClick={() => handleStoryClick(story)}
                  aria-label={`View ${story.username}'s story`}
                >
                  <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
                    {story.type === 'video' ? (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <Play className="h-6 w-6 text-white/70" />
                      </div>
                    ) : (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${story.storyImage})` }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                  </div>
                  <div className="absolute inset-x-0 top-2 flex justify-center">
                    {/* Story ring with improved gradient */}
                    <div className={cn(
                      "w-16 h-16 rounded-full",
                      "bg-gradient-to-br from-yellow-500 via-rose-500 to-fuchsia-500",
                      "p-[2px]", // Creates the ring effect
                      story.isViewed ? "from-gray-300 via-gray-300 to-gray-300" :
                      story.isPremium ? "from-amber-500 via-yellow-500 to-orange-500" :
                      "from-yellow-500 via-rose-500 to-fuchsia-500"
                    )}>
                      {/* Inner white ring */}
                      <div className="w-full h-full rounded-full p-[2px] bg-background">
                        {/* Avatar container */}
                        <div className="w-full h-full rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                          <Avatar className="w-full h-full">
                            <AvatarImage src={story.userImage} alt={story.username} />
                            <AvatarFallback>{story.username[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="absolute bottom-1 text-xs text-center w-full text-white font-medium line-clamp-1">
                    {story.username}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Story viewer dialog */}
      <AnimatePresence>
        {selectedStory && (
          <Dialog open={!!selectedStory} onOpenChange={() => handleClose()}>
            <DialogContent className="max-w-4xl p-0 h-[80vh] overflow-hidden">
              <div className="relative w-full h-full bg-black">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
                  <motion.div
                    className="h-full bg-white"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>

                {/* Story content */}
                <div className="relative w-full h-full">
                  {selectedStory.type === 'video' ? (
                    <video
                      ref={videoRef}
                      src={selectedStory.storyImage}
                      className="w-full h-full object-contain"
                      autoPlay
                      playsInline
                      muted={isMuted}
                      onEnded={handleNext}
                      onLoadedData={() => setVideoReady(true)}
                    />
                  ) : (
                    <img
                      src={selectedStory.storyImage}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Controls */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    {/* Story author ring */}
                    <div className={cn(
                      "rounded-full",
                      "bg-gradient-to-br from-yellow-500 via-rose-500 to-fuchsia-500",
                      "p-[2px]",
                      selectedStory.isPremium && "from-amber-500 via-yellow-500 to-orange-500"
                    )}>
                      <div className="rounded-full p-[2px] bg-black">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedStory.userImage} alt={selectedStory.username} />
                          <AvatarFallback>{selectedStory.username[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <span className="font-semibold">{selectedStory.username}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {selectedStory.type === 'video' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:text-white/80"
                          onClick={togglePlayback}
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:text-white/80"
                          onClick={toggleMute}
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-white/80"
                      onClick={handleClose}
                      aria-label="Close"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                {/* Navigation */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80"
                  onClick={handlePrevious}
                  aria-label="Previous story"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80"
                  onClick={handleNext}
                  aria-label="Next story"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
