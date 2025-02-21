import { NextRequest, NextResponse } from 'next/server';

// Configure route segment config
export const dynamic = 'force-dynamic';
import { getStories } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const storyId = url.searchParams.get('storyId');
    
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Get all stories to find the requested one
    const stories = await getStories();
    const story = stories.find(s => s.id === storyId);

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    if (!story.downloadable) {
      return NextResponse.json(
        { error: 'Story is not downloadable' },
        { status: 403 }
      );
    }

    // Return URLs for all media items in the story
    return NextResponse.json({
      success: true,
      downloads: story.items.map(item => ({
        id: item.id,
        url: item.url,
        type: item.type,
        filename: new URL(item.url).pathname.split('/').pop() || `story-${item.id}`
      }))
    });

  } catch (error) {
    console.error('Error processing download request:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}
