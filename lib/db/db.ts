interface User {
  phone: string;
  username: string;
  imageUrl?: string;
}

interface StoryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  duration: number;
}

interface Story {
  id: string;
  userId: string;
  items: StoryItem[];
  category: string;
  downloadable: boolean;
  isAdult: boolean;
  expiresAt: Date;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// In-memory database
const stories: Story[] = [
  {
    id: '1',
    userId: 'demo_user_john_doe',
    items: [{
      id: '1-1',
      url: 'https://example.com/story1.jpg',
      type: 'image',
      duration: 5
    }],
    category: 'general',
    downloadable: true,
    isAdult: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    userId: 'demo_user_jane_smith',
    items: [{
      id: '2-1',
      url: 'https://example.com/story2.jpg',
      type: 'image',
      duration: 5
    }],
    category: 'general',
    downloadable: true,
    isAdult: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const users: User[] = [
  {
    phone: '1234567890',
    username: 'John Doe',
    imageUrl: '/placeholder-user.jpg'
  },
  {
    phone: '0987654321',
    username: 'Jane Smith',
    imageUrl: '/placeholder-user.jpg'
  }
];

export async function getStories(userId?: string): Promise<Story[]> {
  if (userId) {
    return stories.filter(story => story.userId === userId);
  }
  return stories;
}

export async function findUserByPhone(phone: string): Promise<User | undefined> {
  return users.find(user => user.phone === phone);
}

export async function createStory(data: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<Story> {
  const story: Story = {
    id: Math.random().toString(36).substring(7),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  stories.push(story);
  return story;
}

export type { Story, StoryItem };
