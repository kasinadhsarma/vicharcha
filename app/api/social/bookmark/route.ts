import { NextRequest, NextResponse } from 'next/server';
import { mockDB } from '@/lib/mock-db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { postId, userId } = data;

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Post ID and user ID are required' },
        { status: 400 }
      );
    }

    const result = await mockDB.query(
      'UPDATE posts SET bookmarks = ? WHERE id = ?',
      [postId, 'bookmark', userId]
    );

    const post = result.rows?.[0];
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post bookmarked successfully',
      isBookmarked: true
    });

  } catch (error) {
    console.error('Error bookmarking post:', error);
    return NextResponse.json(
      { error: 'Failed to bookmark post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    const { postId, userId } = data;

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Post ID and user ID are required' },
        { status: 400 }
      );
    }

    const result = await mockDB.query(
      'UPDATE posts SET bookmarks = ? WHERE id = ?',
      [postId, 'unbookmark', userId]
    );

    const post = result.rows?.[0];
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully',
      isBookmarked: false
    });

  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}
