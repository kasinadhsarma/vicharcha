import { NextRequest, NextResponse } from 'next/server';
import { Story, ApiResponse } from '@/lib/types';
import { processStoryAudio } from '@/lib/api/stories';
import { getServerSession, auth } from '@/lib/auth';
import { db } from '../../../lib/db';

// Configure route segment config
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const stories = await db.stories.getAll(session.user.id);
    return NextResponse.json({ success: true, data: stories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const settings = JSON.parse(formData.get('settings') as string);

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Process and store the file
    const story = await db.stories.create({
      userId: session.user.id,
      username: session.user.name || 'Anonymous',
      userImage: session.user.image || '/placeholder.jpg',
      mediaUrl: '/temp-url', // Replace with actual upload URL
      type: file.type.startsWith('video/') ? 'video' : 'image',
      duration: settings.duration || 5000,
      isPremium: settings.isPremium || false,
      isAdult: settings.isAdult || false,
      category: settings.category || 'general',
      items: [],
      isViewed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdAt: new Date(),
      downloadable: settings.downloadable || false
    });

    return NextResponse.json({ success: true, data: story });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create story' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('id');

    if (!storyId) {
      return NextResponse.json(
        { error: 'No story ID provided' },
        { status: 400 }
      );
    }

    const deleted = await db.stories.delete(parseInt(storyId, 10));
    if (!deleted) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
