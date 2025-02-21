"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { Image, X, ChevronRight, ChevronLeft, Plus, Camera } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Story } from "@/lib/types"

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

function StoryViewer({ story, onClose, onNext, onPrevious }: StoryViewerProps) {
  const [progress, setProgress] = useState(0)
  const duration = 5000 // 5 seconds

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)
      if (newProgress === 100) {
        clearInterval(interval)
        onNext?.()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [duration, onNext])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-lg aspect-[9/16] bg-gray-900">
        {story.type === "image" && story.media?.url && (
          <img
            src={story.media.url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        {story.type === "text" && (
          <div className="w-full h-full flex items-center justify-center p-8 text-white text-xl font-medium text-center">
            {story.content}
          </div>
        )}
      </div>

      {/* Navigation */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {onPrevious && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {onNext && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
          onClick={onNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}
    </div>
  )
}

function CreateStoryButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleFile = async (file: File) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login to create a story",
      })
      return
    }

    try {
      // In a real app, implement file upload to storage
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "image",
          media: {
            url: URL.createObjectURL(file),
            type: "image",
          },
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create story")
      }

      toast({
        title: "Success",
        description: "Story created successfully",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Error creating story:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create story",
      })
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="default"
        size="sm"
        className="flex gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Create Story
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <FileUpload
            onFileSelect={handleFile}
            maxSize={10}
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
              'video/*': ['.mp4', '.webm'],
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function StoriesPage() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Mock data
  const stories: Story[] = [
    {
      id: "1",
      type: "image",
      content: "",
      authorId: "1",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      media: {
        url: "/placeholder.jpg",
        type: "image",
      },
    },
    {
      id: "2",
      type: "text",
      content: "This is a text story!",
      authorId: "2",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stories</h1>
        <CreateStoryButton />
      </div>

      <Card className="p-4 relative">
        <ScrollArea className="h-[120px]">
          <div className="flex gap-4">
            {/* Create Story */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-center mt-2">Create Story</p>
            </div>

            {/* Story Previews */}
            {stories.map((story, index) => (
              <button
                key={story.id}
                className="flex-shrink-0 focus:outline-none"
                onClick={() => {
                  setSelectedStory(story)
                  setSelectedIndex(index)
                }}
              >
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden">
                  {story.type === "image" && story.media?.url ? (
                    <img
                      src={story.media.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm p-2">
                      {story.content}
                    </div>
                  )}
                </div>
                <p className="text-xs text-center mt-2">User {story.authorId}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Story Viewer */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StoryViewer
              story={selectedStory}
              onClose={() => setSelectedStory(null)}
              onNext={
                selectedIndex < stories.length - 1
                  ? () => {
                      setSelectedStory(stories[selectedIndex + 1])
                      setSelectedIndex(selectedIndex + 1)
                    }
                  : undefined
              }
              onPrevious={
                selectedIndex > 0
                  ? () => {
                      setSelectedStory(stories[selectedIndex - 1])
                      setSelectedIndex(selectedIndex - 1)
                    }
                  : undefined
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
