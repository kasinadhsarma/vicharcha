"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Story } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight, X, Heart, MessageCircle, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function StoryViewer({ stories, currentIndex, onClose, onNext, onPrevious }: StoryViewerProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout>();
  const story = stories[currentIndex];
  const { toast } = useToast();

  useEffect(() => {
    if (!story) return;

    // Mark story as viewed
    fetch(`/api/stories/${story.id}/view`, { method: 'POST' })
      .catch(error => console.error('Error marking story as viewed:', error));

    // Reset and start progress
    setProgress(0);
    setIsPaused(false);

    const duration = story.duration || 5000; // Default to 5 seconds if not specified
    const interval = 50; // Update every 50ms for smooth progress
    const increment = (interval / duration) * 100;

    progressInterval.current = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            onNext();
            return 0;
          }
          return prev + increment;
        });
      }
    }, interval);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [story, currentIndex, isPaused, onNext]);

  if (!story) return null;

  const handleTouchStart = (side: 'left' | 'right') => {
    setIsPaused(true);
    if (side === 'left') {
      onPrevious();
    } else {
      onNext();
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
  };

  const handleLike = async () => {
    try {
      await fetch(`/api/stories/${story.id}/like`, { method: 'POST' });
      toast({
        title: "Success",
        description: "Story liked!",
      });
    } catch (error) {
      console.error('Error liking story:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like story",
      });
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-screen-lg w-full h-[80vh] p-0 gap-0 bg-transparent border-none">
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
            {stories.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
              >
                <div
                  className={cn(
                    "h-full bg-white transition-all duration-100",
                    i < currentIndex ? "w-full" : i === currentIndex ? `w-[${progress}%]` : "w-0"
                  )}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 pt-8">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={story.userImage} alt={story.username} />
                <AvatarFallback>{story.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium">{story.username}</p>
                <p className="text-white/70 text-sm">
                  {new Date(story.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Story Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex items-center justify-center"
            >
              {story.type === 'video' ? (
                <video
                  src={story.mediaUrl}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  muted
                  loop
                />
              ) : (
                <img
                  src={story.mediaUrl}
                  alt={story.username + "'s story"}
                  className="w-full h-full object-contain"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="absolute inset-0 z-40 flex">
            <button
              className="w-1/2 h-full focus:outline-none"
              onClick={() => onPrevious()}
              onTouchStart={() => handleTouchStart('left')}
              onTouchEnd={handleTouchEnd}
            />
            <button
              className="w-1/2 h-full focus:outline-none"
              onClick={() => onNext()}
              onTouchStart={() => handleTouchStart('right')}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleLike}
            >
              <Heart className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
