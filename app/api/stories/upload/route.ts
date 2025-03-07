import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, AuthUser } from '@/lib/auth';
import { processUpload } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const result = await processUpload({
      file,
      userId: session.user.id,
      username: session.user.name || 'Anonymous',
      userImage: session.user.image || '/placeholder-user.jpg',
      metadata: {
        type: file.type,
        size: file.size,
        name: file.name
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
