import { z } from 'zod';

export const StoryMediaSettings = z.object({
  quality: z.number().min(1).max(100).default(80),
  frameRate: z.number().min(1).max(60).default(30),
  denoise: z.boolean().default(false),
  enhanceAudio: z.boolean().default(false),
  removeBgNoise: z.boolean().default(false),
  audioBitrate: z.number().min(64).max(320).default(128)
});

export const StorySettings = z.object({
  category: z.string().optional(),
  downloadable: z.boolean().optional(),
  isAdult: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  duration: z.number().min(1000).max(60000).default(5000),
  quality: z.number().min(1).max(100).default(80)
});

export const ValidFileTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime']
};

export function validateStoryFile(file: File) {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const errors: string[] = [];

  if (file.size > maxSize) {
    errors.push('File size exceeds 100MB limit');
  }

  const isValidType = [...ValidFileTypes.image, ...ValidFileTypes.video].includes(file.type);
  if (!isValidType) {
    errors.push('Invalid file type. Supported types: JPG, PNG, GIF, WEBP, MP4, WEBM, MOV');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateStoryContent(userId: string, story: any) {
  const errors: string[] = [];

  if (!userId) {
    errors.push('User ID is required');
  }

  if (!story.mediaUrl) {
    errors.push('Media URL is required');
  }

  if (!story.type || !['image', 'video'].includes(story.type)) {
    errors.push('Invalid story type. Must be "image" or "video"');
  }

  if (story.duration < 1000 || story.duration > 60000) {
    errors.push('Duration must be between 1 and 60 seconds');
  }

  const expiresAt = new Date(story.expiresAt);
  const now = new Date();
  if (expiresAt <= now) {
    errors.push('Story expiration date must be in the future');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}