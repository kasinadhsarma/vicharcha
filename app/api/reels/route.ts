import { NextRequest, NextResponse } from 'next/server';
import { createReel, getReels } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const reels = await getReels(userId || undefined);
    return NextResponse.json(reels);
  } catch (error) {
    console.error('Error fetching reels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reels' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      videoUrl,
      thumbnailUrl,
      caption
    } = await req.json();

    if (!userId || !videoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reelId = await createReel(
      userId,
      videoUrl,
      thumbnailUrl,
      caption
    );

    return NextResponse.json({ 
      reelId, 
      created: true 
    });
  } catch (error) {
    console.error('Error creating reel:', error);
    return NextResponse.json(
      { error: 'Failed to create reel' },
      { status: 500 }
    );
  }
}

// Demo helper function - don't use in production
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reelId = searchParams.get('reelId');

    if (!reelId) {
      return NextResponse.json(
        { error: 'Missing reelId' },
        { status: 400 }
      );
    }

    // In the mock db, we don't actually need to delete
    // since data is temporary anyway
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting reel:', error);
    return NextResponse.json(
      { error: 'Failed to delete reel' },
      { status: 500 }
    );
  }
}
