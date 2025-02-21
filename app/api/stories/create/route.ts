import { NextRequest, NextResponse } from 'next/server';
import { createStory } from '@/lib/db';
import { uploadFile } from '@/lib/storage';

const saveStoryFile = async (file: File): Promise<string> => {
  const filename = `stories/${crypto.randomUUID()}-${file.name}`;
  const url = await uploadFile(file, filename);
  return url;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const files = formData.getAll('files') as File[];

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'At least one file is required' },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files allowed' },
        { status: 400 }
      );
    }

    // Process files and create story items
    const storyItems = await Promise.all(
      files.map(async (file) => {
        const url = await saveStoryFile(file);
        const type = file.type.startsWith('video/') ? 'video' as const : 'image' as const;
        return {
          id: crypto.randomUUID(),
          url,
          type,
          duration: type === 'video' ? 10 : undefined
        };
      })
    );

    // Set expiration time to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Create story in database
    const story = await createStory({
      userId,
      items: storyItems,
      category: 'general',
      downloadable: true,
      isAdult: false,
      expiresAt
    });

    return NextResponse.json({
      success: true,
      message: 'Story created successfully',
      story
    });

  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}
