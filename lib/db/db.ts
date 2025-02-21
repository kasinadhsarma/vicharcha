interface User {
  phone: string;
  username: string;
  imageUrl?: string;
}

interface Story {
  id: string;
  userId: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// In-memory database
const stories: Story[] = [
  {
    id: '1',
    userId: 'demo_user_john_doe',
    content: 'https://example.com/story1.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2', 
    userId: 'demo_user_jane_smith',
    content: 'https://example.com/story2.jpg',
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

export type { Story };
