import { NextRequest, NextResponse } from 'next/server';

// Configure route segment config
export const dynamic = 'force-dynamic';
import { getStories, findUserByPhone, type Story } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    // Get stories, optionally filtered by userId
    const stories = await getStories(userId || undefined);
    
    // Sort stories by creation date, newest first
    const sortedStories = stories.sort((a: Story, b: Story) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Get stories with user details and format response
    const storiesWithUserDetails = await Promise.all(sortedStories.map(async (story: Story) => {
      let username: string, userImage: string;
      
      if (story.userId.startsWith('demo_user_')) {
        username = story.userId.split('_').slice(1).join(' ').replace(/^\w/, (c: string) => c.toUpperCase());
        userImage = '/placeholder-user.jpg';
      } else {
        const user = await findUserByPhone(story.userId);
        username = user?.username || 'User';
        userImage = '/placeholder-user.jpg';
      }

      // Check if story has expired
      const now = new Date();
      if (story.expiresAt instanceof Date && now > story.expiresAt) {
        return null; // Skip expired stories
      }

      return {
        ...story,
        username,
        userImage,
        timeLeft: story.expiresAt instanceof Date ? 
          Math.max(0, story.expiresAt.getTime() - now.getTime()) : 0
      };
    }));

    // Filter out null values (expired stories) and ensure array is not empty
    const validStories = storiesWithUserDetails.filter(story => story !== null);
    
    return NextResponse.json({
      success: true,
      stories: validStories
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
