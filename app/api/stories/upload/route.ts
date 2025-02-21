import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { createStory } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const downloadable = formData.get('downloadable') === 'true';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Read file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file type and directory
    const isVideo = file.type.startsWith('video/');
    const directory = isVideo ? 'videos' : 'images';
    const targetDirectory = join(process.cwd(), 'public', directory);

    // Create directory if it doesn't exist
    if (!existsSync(targetDirectory)) {
      mkdirSync(targetDirectory, { recursive: true });
    }

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = file.name.split('.').pop();
    const filename = `story-${uniqueSuffix}.${extension}`;
    const filepath = join(targetDirectory, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Create story record
    const publicUrl = `/${directory}/${filename}`;
    
    // Create story in database
    const story = await createStory({
      userId: 'test_user', // This should come from authenticated user
      items: [{
        id: uuidv4(),
        url: publicUrl,
        type: isVideo ? 'video' : 'image',
        duration: isVideo ? 15 : 5
      }],
      category: 'general',
      downloadable,
      isAdult: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      type: isVideo ? 'video' : 'image',
      storyId: story.id
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Configure route segment for file uploads
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
