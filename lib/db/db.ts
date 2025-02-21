import { DBUser } from '@/lib/types';

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

const users: DBUser[] = [
  {
    id: 'user1',
    phoneNumber: '1234567890',
    email: 'john@example.com',
    name: 'John Doe',
    username: 'johndoe',
    avatar: '/placeholder-user.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isVerified: false,
    digilocker_verified: false,
    role: 'user'
  },
  {
    id: 'user2',
    phoneNumber: '0987654321',
    email: 'jane@example.com',
    name: 'Jane Smith',
    username: 'janesmith',
    avatar: '/placeholder-user.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isVerified: false,
    digilocker_verified: false,
    role: 'user'
  }
];

export async function getStories(userId?: string): Promise<Story[]> {
  if (userId) {
    return stories.filter(story => story.userId === userId);
  }
  return stories;
}

export async function findUserByPhone(phoneNumber: string): Promise<DBUser | undefined> {
  return users.find(user => user.phoneNumber === phoneNumber);
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

// OTP functionality
export async function createOTP(phone: string): Promise<boolean> {
  // In a real implementation, this would:
  // 1. Generate a random OTP
  // 2. Store it in the database with expiry
  // 3. Send it via SMS
  console.log(`Creating OTP for phone: ${phone}`);
  return true;
}

export async function verifyOTP(phone: string, otp: string): Promise<boolean> {
  // In a real implementation, this would:
  // 1. Check if OTP exists and is valid for the phone
  // 2. Verify it hasn't expired
  // 3. Delete the OTP after successful verification
  // For demo, we accept any 6-digit OTP
  return /^\d{6}$/.test(otp);
}

// Reels functionality
export interface Reel {
  id: string;
  userId: string;
  url: string;
  caption?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

const reels: Reel[] = [];

export async function createReel(data: Omit<Reel, 'id' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'updatedAt'>): Promise<Reel> {
  const reel: Reel = {
    id: Math.random().toString(36).substring(7),
    ...data,
    likes: 0,
    comments: 0,
    shares: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  reels.push(reel);
  return reel;
}

export type { Story, StoryItem };
