import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredStories } from '@/lib/storage/stories';
import { DatabaseResult } from '@/lib/types';

// Using Node.js runtime for Cassandra operations
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CleanupResult {
  deletedCount: number;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Only allow cron jobs from authorized sources
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('Unauthorized cleanup attempt detected');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting story cleanup process...');
    
    const result = await cleanupExpiredStories() as DatabaseResult<CleanupResult>;
    
    if (!result.success) {
      throw new Error(result.error);
    }

    const duration = Date.now() - startTime;
    const response = {
      success: true,
      deletedCount: result.data?.deletedCount || 0,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    console.log('Story cleanup completed:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Error during story cleanup:', {
      error,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        error: 'Failed to clean up stories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
