import { Story, StoryItem, ApiResponse } from '@/lib/types';

export interface ProcessingSettings {
  quality: number;
  frameRate: number;
  denoise: boolean;
  enhanceAudio: boolean;
  removeBgNoise: boolean;
  audioBitrate: number;
}

async function fetchWithProgress(url: string, options: RequestInit = {}, onProgress?: (progress: number) => void): Promise<Response> {
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (response.body) {
          const reader = response.body.getReader();
          const contentLength = +(response.headers.get('Content-Length') ?? 0);
          let receivedLength = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            receivedLength += value.length;
            onProgress?.(contentLength ? (receivedLength / contentLength) * 100 : 0);
          }
        }
        resolve(response);
      })
      .catch(reject);
  });
}

export async function uploadStoryMedia(
  file: File, 
  settings: ProcessingSettings,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<{ story?: Story }>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('settings', JSON.stringify(settings));

    const response = await fetchWithProgress('/api/stories/upload', {
      method: 'POST',
      body: formData
    }, onProgress);

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Failed to upload story' };
  }
}

export async function processStoryAudio(
  storyId: string, 
  settings: ProcessingSettings
): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/stories/process-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, settings })
    });

    return await response.json();
  } catch (error) {
    console.error('Audio processing error:', error);
    return { success: false, error: 'Failed to process audio' };
  }
}

export async function getStories(): Promise<ApiResponse<Story[]>> {
  try {
    const response = await fetch('/api/stories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stories:', error);
    return { success: false, error: 'Failed to fetch stories' };
  }
}

export async function createStory(
  userId: string,
  files: File[],
  settings: {
    category?: string;
    downloadable?: boolean;
    isAdult?: boolean;
  } = {}
): Promise<ApiResponse<Story>> {
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    files.forEach(file => formData.append('files', file));
    formData.append('settings', JSON.stringify(settings));

    const response = await fetch('/api/stories/create', {
      method: 'POST',
      body: formData
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating story:', error);
    return { success: false, error: 'Failed to create story' };
  }
}

export async function deleteStory(storyId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/stories/${storyId}`, {
      method: 'DELETE'
    });

    return await response.json();
  } catch (error) {
    console.error('Error deleting story:', error);
    return { success: false, error: 'Failed to delete story' };
  }
}
