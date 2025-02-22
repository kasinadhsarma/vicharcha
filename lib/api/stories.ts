import { Story } from "@/lib/types";

export interface UploadChunkResponse {
  success: boolean;
  chunkIndex?: number;
  remaining?: number;
  url?: string;
  settings?: ProcessingSettings;
  error?: string;
}

export interface ProcessAudioResponse {
  success: boolean;
  url?: string;
  settings?: ProcessingSettings;
  error?: string;
}

export interface ProcessingSettings {
  quality: number;
  frameRate: number;
  denoise: boolean;
  enhanceAudio: boolean;
  removeBgNoise: boolean;
  audioBitrate: number;
}

export interface StoryUploadResponse {
  success: boolean;
  story?: Story;
  error?: string;
}

// API client functions for stories
export async function uploadStoryMedia(file: File, settings: ProcessingSettings): Promise<StoryUploadResponse> {
  try {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    for (let chunk = 0; chunk < totalChunks; chunk++) {
      const start = chunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunkBlob = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('chunk', chunkBlob);
      formData.append('chunkIndex', chunk.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('settings', JSON.stringify(settings));
      
      const response = await fetch('/api/stories/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data: UploadChunkResponse = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Last chunk response contains the complete story data
      if (chunk === totalChunks - 1 && data.url) {
        return {
          success: true,
          story: {
            id: Math.random().toString(36).slice(2),
            mediaUrl: data.url,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            createdAt: new Date().toISOString(),
            // Add other required Story properties here
          } as Story,
        };
      }
    }

    throw new Error('Upload incomplete');

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function processStoryAudio(storyId: string, settings: ProcessingSettings): Promise<ProcessAudioResponse> {
  try {
    const response = await fetch('/api/stories/process-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storyId,
        settings,
      }),
    });

    if (!response.ok) {
      throw new Error('Processing failed');
    }

    return await response.json();

  } catch (error) {
    console.error('Processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed',
    };
  }
}
