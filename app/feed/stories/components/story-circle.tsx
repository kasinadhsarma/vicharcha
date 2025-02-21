"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Story } from "@/lib/types";

interface StoryCircleProps {
  story: Story;
  onPress: () => void;
}

const storyVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// Helper function to format time elapsed
const getTimeElapsed = (date: string | Date) => {
  const now = new Date();
  const createdAt = new Date(date);
  const diff = Math.floor((now.getTime() - createdAt.getTime()) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export function StoryCircle({ story, onPress }: StoryCircleProps) {
  return (
    <motion.button
      className="flex flex-col items-center space-y-1 relative group text-gray-900"
      variants={storyVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onClick={onPress}
      aria-label={`View ${story.username || 'User'}'s story`}
    >
      <div
        className={cn(
          "rounded-full p-1",
          story.isPremium
            ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500"
            : "bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500",
          story.isViewed && "grayscale"
        )}
      >
        <div className="rounded-full p-0.5 bg-white">
          <Avatar className="w-16 h-16 group-hover:scale-105 transition-transform">
            <AvatarImage src={story.userImage} alt={story.username || 'User'} />
            <AvatarFallback>{(story.username?.[0] || 'U').toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        {story.isPremium && (
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-1">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs font-medium text-gray-900">{story.username || 'User'}</span>
        <span className="text-[10px] text-gray-500">
          {getTimeElapsed(story.createdAt)}
        </span>
      </div>
    </motion.button>
  );
}

export function StoryCircleSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-[66px] h-[66px] rounded-full bg-gray-100 animate-pulse" />
      <div className="space-y-1">
        <div className="w-12 h-2 bg-gray-100 animate-pulse rounded" />
        <div className="w-8 h-2 bg-gray-100 animate-pulse rounded" />
      </div>
    </div>
  );
}
