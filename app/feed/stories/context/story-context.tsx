"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Story } from "@/lib/types";

interface StoryProgress {
  isUploading: boolean;
  progress: number;
  currentStep: string;
}

interface EditingState {
  isEditing: boolean;
  originalStory: Story | null;
  editedFile: File | null;
  processingSettings: ProcessingSettings;
}

interface ProcessingSettings {
  quality: number;
  frameRate: number;
  denoise: boolean;
  enhanceAudio: boolean;
  removeBgNoise: boolean;
  audioBitrate: number;
}

interface StoryContextType {
  // Playback controls
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentStory: Story | null;
  setCurrentStory: (story: Story | null) => void;
  volume: number;
  setVolume: (volume: number) => void;
  
  // Upload progress
  uploadProgress: StoryProgress;
  setUploadProgress: (progress: StoryProgress) => void;
  clearProgress: () => void;
  
  // Cache for quick resume
  lastEditedStory: {
    story: Story | null;
    timestamp: number;
  };
  setLastEditedStory: (story: Story | null) => void;

  // Helper functions
  startEditing: (story: Story) => void;
  cancelEditing: () => void;
  saveEdit: (editedFile: File, settings: ProcessingSettings) => Promise<void>;

  // Story management
  stories: Story[];
  setStories: (stories: Story[]) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

const defaultProgress: StoryProgress = {
  isUploading: false,
  progress: 0,
  currentStep: "",
};

const defaultProcessingSettings: ProcessingSettings = {
  quality: 80,
  frameRate: 30,
  denoise: false,
  enhanceAudio: false,
  removeBgNoise: false,
  audioBitrate: 128,
};

const StoryContext = createContext<StoryContextType | null>(null);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [volume, setVolume] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<StoryProgress>(defaultProgress);
  const [lastEditedStory, _setLastEditedStory] = useState<{
    story: Story | null;
    timestamp: number;
  }>({
    story: null,
    timestamp: 0,
  });
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const setLastEditedStory = useCallback((story: Story | null) => {
    _setLastEditedStory({
      story,
      timestamp: Date.now(),
    });
  }, []);

  const clearProgress = useCallback(() => {
    setUploadProgress(defaultProgress);
  }, []);

  const startEditing = useCallback((story: Story) => {
    setCurrentStory(story);
    setLastEditedStory(story);
  }, [setLastEditedStory]);

  const cancelEditing = useCallback(() => {
    setCurrentStory(null);
  }, []);

  const saveEdit = useCallback(async (editedFile: File, settings: ProcessingSettings) => {
    try {
      setUploadProgress({
        isUploading: true,
        progress: 0,
        currentStep: "Starting upload...",
      });

      const formData = new FormData();
      formData.append('file', editedFile);
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('/api/stories/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadProgress(defaultProgress);
      setCurrentStory(null);
    } catch (error) {
      console.error('Error saving edit:', error);
      setUploadProgress({
        isUploading: false,
        progress: 0,
        currentStep: "Error uploading",
      });
      throw error;
    }
  }, []);

  return (
    <StoryContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentStory,
        setCurrentStory,
        volume,
        setVolume,
        uploadProgress,
        setUploadProgress,
        clearProgress,
        lastEditedStory,
        setLastEditedStory,
        startEditing,
        cancelEditing,
        saveEdit,
        stories,
        setStories,
        currentIndex,
        setCurrentIndex,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStory must be used within StoryProvider');
  }
  return context;
}
