import { Story, ApiResponse } from './types';
// Re-export only what we need from stories
export { createStory, getStories, markStoryAsViewed, deleteStory, storyExists } from './db/stories';

// In-memory storage as fallback
const stories = new Map<string, Story>();

// Re-export the db instance for direct access
export const db = {
  stories: {
    async create(story: Omit<Story, 'id'>): Promise<Story> {
      const id = Date.now();
      const newStory = {
        id: id,
        ...story,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      stories.set(id.toString(), newStory);
      return newStory;
    },

    async getAll(userId?: string): Promise<Story[]> {
      const allStories = Array.from(stories.values());
      if (userId) {
        return allStories.filter(story => story.userId === userId);
      }
      return allStories;
    },

    async getById(id: number): Promise<Story | null> {
      return stories.get(id.toString()) || null;
    },

    async update(id: number, data: Partial<Story>): Promise<Story | null> {
      const story = stories.get(id.toString());
      if (!story) return null;
      
      const updatedStory = {
        ...story,
        ...data,
        updatedAt: new Date(),
      };
      stories.set(id.toString(), updatedStory);
      return updatedStory;
    },

    async delete(id: number): Promise<boolean> {
      return stories.delete(id.toString());
    }
  }
};
