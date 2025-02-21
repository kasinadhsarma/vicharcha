"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Pause, Play } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface StoryItem {
  id: string;
  url: string;
  type: "image" | "video";
  duration?: number;
}

interface Story {
  id: string;
  userId: string;
  userImage: string;
  username: string;
  items: StoryItem[];
  downloadable: boolean;
}

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialStoryIndex, onClose }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const currentStory = stories[currentStoryIndex];
  const currentItem = currentStory?.items[currentItemIndex];

  // Reset video and progress when item changes
  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [currentItem]);

  useEffect(() => {
    if (!currentItem) return;

    let timer: NodeJS.Timeout;
    
    if (currentItem.type === 'image') {
      const duration = 5000; // 5 seconds for images
      const interval = 100; // Update progress every 100ms
      const steps = duration / interval;
      let currentStep = 0;

      timer = setInterval(() => {
        currentStep++;
        setProgress((currentStep / steps) * 100);

        if (currentStep >= steps) {
          handleNext();
        }
      }, interval);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentItem, isPlaying]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const currentTime = videoRef.current.currentTime;
      setProgress((currentTime / duration) * 100);
      
      if (currentTime >= duration) {
        handleNext();
      }
    }
  };

  const handleVideoError = (error: any) => {
    console.error('Video error:', error);
    // Optionally show an error message to the user
  };

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentItemIndex(stories[currentStoryIndex - 1].items.length - 1);
    }
  };

  const handleNext = () => {
    if (currentItemIndex < currentStory.items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentItemIndex(0);
    } else {
      onClose();
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[80vh] p-0">
        <div className="relative h-full flex items-center justify-center bg-black">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {currentStory.items.map((item, index) => (
              <div key={item.id} className="h-0.5 flex-1 bg-gray-600">
                <div 
                  className="h-full bg-white transition-all duration-100"
                  style={{ 
                    width: index === currentItemIndex ? `${progress}%` : 
                           index < currentItemIndex ? '100%' : '0%' 
                  }}
                />
              </div>
            ))}
          </div>

          {/* User info */}
          <div className="absolute top-8 left-4 flex items-center gap-2 z-10">
            <img
              src={currentStory.userImage}
              alt={currentStory.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-white font-semibold">{currentStory.username}</span>
          </div>

          {/* Media content */}
          <div className="w-full h-full flex items-center justify-center" onClick={togglePlayPause}>
            {currentItem.type === 'video' ? (
              <video
                ref={videoRef}
                src={currentItem.url}
                className="max-h-full w-full object-contain"
                playsInline
                onTimeUpdate={handleVideoTimeUpdate}
                onError={handleVideoError}
                muted
              />
            ) : (
              <img
                src={currentItem.url}
                alt=""
                className="max-h-full w-full object-contain"
              />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-black/20"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              disabled={currentStoryIndex === 0 && currentItemIndex === 0}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-black/20"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        {/* Play/Pause and Download buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          {currentItem.type === 'video' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-black/20"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
          )}
          {currentStory.downloadable && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-black/20"
              onClick={async (e) => {
                e.stopPropagation();
                if (isDownloading) return;
                
                setIsDownloading(true);
                try {
                  const response = await fetch(`/api/stories/download?storyId=${currentStory.id}`);
                  if (!response.ok) throw new Error('Failed to get download URLs');
                  
                  const data = await response.json();
                  if (!data.success) throw new Error(data.error);
                  
                  // Create a hidden link for each file and click it
                  for (const download of data.downloads) {
                    const link = document.createElement('a');
                    link.href = download.url;
                    link.download = download.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                  
                  toast({
                    title: "Success",
                    description: "Downloads started successfully"
                  });
                } catch (error) {
                  console.error('Download error:', error);
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to download story"
                  });
                } finally {
                  setIsDownloading(false);
                }
              }}
              disabled={isDownloading}
            >
              <Download className={cn("h-6 w-6", isDownloading && "animate-pulse")} />
            </Button>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
