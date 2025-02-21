"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { StoryCircle, StoryCircleSkeleton } from "./components/story-circle";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StoryViewer } from "./components/story-viewer";
import { CreateStory } from "./components/create-story";
import { AnimatePresence } from "framer-motion";
import { Story } from "../../../lib/types";

export default function StoriesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchStories = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (user?.phoneNumber) {
        queryParams.append('userId', user.phoneNumber);
      }

      const response = await fetch(`/api/stories?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      const data = await response.json();
      setStories(data.stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load stories",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleStoryPress = (index: number) => {
    setSelectedStoryIndex(index);
  };

  // Check scrollable state
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Set up observers
      const observer = new ResizeObserver(() => {
        // Only observe, no calculation needed since we're using ScrollArea
      });
      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }
  }, [stories.length]);

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 bg-background text-foreground">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-purple-500/5 to-blue-500/5 rounded-xl blur-xl" />
        <ScrollArea className="w-full whitespace-nowrap rounded-xl border bg-background/50 backdrop-blur-sm">
          <div className="flex w-max space-x-4 p-4">
            <CreateStory onStoryCreated={fetchStories} />

            {loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <StoryCircleSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                {stories.map((story, index) => (
                  <StoryCircle
                    key={story.id}
                    story={story}
                    onPress={() => handleStoryPress(index)}
                  />
                ))}
              </>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <AnimatePresence mode="wait">
        {selectedStoryIndex !== null && (
          <StoryViewer
            stories={stories}
            initialStoryIndex={selectedStoryIndex}
            onClose={() => setSelectedStoryIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
