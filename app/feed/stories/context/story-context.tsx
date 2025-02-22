"use client";

import { createContext, useContext, useState } from "react";
import { Story } from "@/lib/types";

interface StoryContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentStory: Story | null;
  setCurrentStory: (story: Story | null) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [volume, setVolume] = useState(1);

  return (
    <StoryContext.Provider value={{
      isPlaying,
      setIsPlaying,
      currentStory,
      setCurrentStory,
      volume,
      setVolume
    }}>
      {children}
    </StoryContext.Provider>
  );
}

export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) throw new Error('useStory must be used within StoryProvider');
  return context;
};
