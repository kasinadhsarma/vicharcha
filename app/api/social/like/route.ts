import { NextRequest, NextResponse } from 'next/server';
import { mockDB } from '@/lib/mock-db';
import type { MockPost } from '@/lib/mock-db';

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
      'UPDATE posts SET likes = ? WHERE id = ?',
      [postId, 'like', userId]
    );

    const post = result.rows?.[0] as MockPost | undefined;
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post liked successfully',
      likes: post.likes,
      isLiked: true
    });

  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: 'Failed to like post' },
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
      'UPDATE posts SET likes = ? WHERE id = ?',
      [postId, 'unlike', userId]
    );

    const post = result.rows?.[0] as MockPost | undefined;
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post like removed successfully',
      likes: post.likes,
      isLiked: false
    });

  } catch (error) {
    console.error('Error removing post like:', error);
    return NextResponse.json(
      { error: 'Failed to remove post like' },
      { status: 500 }
    );
  }
}
