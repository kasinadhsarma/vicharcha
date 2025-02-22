"use client";

import { createContext, useContext, useState } from "react";
import { Story } from "@/lib/types";

interface ProcessingSettings {
  quality: number;
  frameRate: number;
  denoise: boolean;
  enhanceAudio: boolean;
  removeBgNoise: boolean;
  audioBitrate: number;
}

interface EditingState {
  isEditing: boolean;
  originalStory: Story | null;
  editedFile: File | null;
  processingSettings: ProcessingSettings;
}

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  currentStep: string;
}

interface StoryContextType {
  // Playback controls
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentStory: Story | null;
  setCurrentStory: (story: Story | null) => void;
  volume: number;
  setVolume: (volume: number) => void;
  
  // Editing state
  editingState: EditingState;
  setEditingState: (state: EditingState) => void;
  
  // Upload progress
  uploadProgress: UploadProgress;
  setUploadProgress: (progress: UploadProgress) => void;
  
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
}

const defaultProcessingSettings: ProcessingSettings = {
  quality: 80,
  frameRate: 30,
  denoise: false,
  enhanceAudio: false,
  removeBgNoise: false,
  audioBitrate: 128,
};

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: React.ReactNode }) {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [volume, setVolume] = useState(1);

  // Editing state
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    originalStory: null,
    editedFile: null,
    processingSettings: defaultProcessingSettings,
  });

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    currentStep: "",
  });

  // Cache for quick resume
  const [lastEditedStory, _setLastEditedStory] = useState<{
    story: Story | null;
    timestamp: number;
  }>({
    story: null,
    timestamp: 0,
  });

  const setLastEditedStory = (story: Story | null) => {
    _setLastEditedStory({
      story,
      timestamp: Date.now(),
    });
  };

  const startEditing = (story: Story) => {
    setEditingState({
      isEditing: true,
      originalStory: story,
      editedFile: null,
      processingSettings: defaultProcessingSettings,
    });
    setLastEditedStory(story);
  };

  const cancelEditing = () => {
    setEditingState({
      isEditing: false,
      originalStory: null,
      editedFile: null,
      processingSettings: defaultProcessingSettings,
    });
  };

  const saveEdit = async (editedFile: File, settings: ProcessingSettings) => {
    try {
      setUploadProgress({
        isUploading: true,
        progress: 0,
        currentStep: "Starting upload...",
      });

      // Create form data with the file and settings
      const formData = new FormData();
      formData.append('file', editedFile);
      formData.append('settings', JSON.stringify(settings));
      formData.append('storyId', editingState.originalStory?.id || '');

      // Upload in chunks to show progress
      const chunkSize = 1024 * 1024; // 1MB chunks
      const totalChunks = Math.ceil(editedFile.size / chunkSize);
      
      for (let chunk = 0; chunk < totalChunks; chunk++) {
        const start = chunk * chunkSize;
        const end = Math.min(start + chunkSize, editedFile.size);
        const chunkBlob = editedFile.slice(start, end);
        
        formData.set('chunk', chunkBlob);
        formData.set('chunkIndex', chunk.toString());
        formData.set('totalChunks', totalChunks.toString());

        // Upload chunk
        const response = await fetch('/api/stories/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        // Update progress
        const progress = Math.round((chunk + 1) / totalChunks * 100);
        setUploadProgress(prev => ({
          ...prev,
          progress,
          currentStep: `Uploading chunk ${chunk + 1}/${totalChunks}...`,
        }));

        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Final processing step
      setUploadProgress(prev => ({
        ...prev,
        currentStep: "Processing...",
      }));

      // Apply audio processing if needed
      if (settings.enhanceAudio || settings.removeBgNoise) {
        await fetch('/api/stories/process-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyId: editingState.originalStory?.id,
            settings,
          }),
        });
      }

      // Reset states after successful upload
      setEditingState({
        isEditing: false,
        originalStory: null,
        editedFile: null,
        processingSettings: defaultProcessingSettings,
      });
      
      setUploadProgress({
        isUploading: false,
        progress: 0,
        currentStep: "",
      });

    } catch (error) {
      console.error('Error saving edit:', error);
      setUploadProgress({
        isUploading: false,
        progress: 0,
        currentStep: "Error uploading",
      });
      throw error;
    }
  };

  return (
    <StoryContext.Provider value={{
      // Playback controls
      isPlaying,
      setIsPlaying,
      currentStory,
      setCurrentStory,
      volume,
      setVolume,
      
      // Editing state
      editingState,
      setEditingState,
      
      // Upload progress
      uploadProgress,
      setUploadProgress,
      
      // Cache
      lastEditedStory,
      setLastEditedStory,
      
      // Helper functions
      startEditing,
      cancelEditing,
      saveEdit,
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
