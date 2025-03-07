import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredStories } from '@/lib/storage/stories';

export async function GET(request: NextRequest) {
  try {
    // Verify request is from authorized cron job
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await cleanupExpiredStories();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.data?.deletedCount || 0
    });
  } catch (error) {
    console.error('Error cleaning up stories:', error);
    return NextResponse.json(
      { error: 'Failed to clean up stories' },
      { status: 500 }
    );
  }
}