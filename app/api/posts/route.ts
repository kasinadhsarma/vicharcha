import { NextRequest, NextResponse } from 'next/server';
import type { Post } from '@/lib/types';
import { mockDB } from '@/lib/mock-db';
import { types } from 'cassandra-driver';
import type { MockPost } from '@/lib/mock-db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const category = searchParams.get('category')?.toLowerCase();

    // Use the query method with the appropriate SQL-like query
    const queryStr = category 
      ? 'SELECT * FROM posts WHERE category = ? ORDER BY createdAt DESC'
      : 'SELECT * FROM posts ORDER BY createdAt DESC';
    const params = category ? [category] : [];
    
    const result = await mockDB.query(queryStr, params);
    
    // Ensure we have posts and transform them to match Post interface
    const dbPosts = (result.rows || []) as MockPost[];
    const posts: Post[] = dbPosts.map(post => ({
      id: post.id,
      userId: post.userId,
      username: "User", // Default value since mock DB doesn't store this
      userImage: "/placeholder-user.jpg", // Default value
      content: post.content,
      category: post.category,
      mediaUrls: post.mediaUrls || [],
      tokens: post.content.length,
      mentions: [], // Default value since mock DB doesn't store this
      hashtags: [], // Default value since mock DB doesn't store this
      emojis: [], // Default value since mock DB doesn't store this
      likes: 0, // Default value since mock DB doesn't store this
      comments: 0, // Default value since mock DB doesn't store this
      shares: 0, // Default value since mock DB doesn't store this
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      timestamp: post.createdAt.toISOString(),
      isLiked: userId ? Math.random() > 0.5 : false,
      isBookmarked: userId ? Math.random() > 0.7 : false,
      isVerified: false, // Default value since mock DB doesn't store this
      isPremium: false, // Default value since mock DB doesn't store this
      ageRestricted: post.ageRestricted
    }));

    return NextResponse.json(posts);

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate token limit
    if (data.content.length > 500) {
      return NextResponse.json(
        { error: 'Content exceeds 500 token limit' },
        { status: 400 }
      );
    }

    const postId = types.Uuid.random().toString();
    const timestamp = new Date().toISOString();

    // Extract mentions, hashtags, and emojis from content
    const mentions = (data.content.match(/@[\w-]+/g) || []).map((m: string) => m.substring(1));
    const hashtags = (data.content.match(/#[\w-]+/g) || []).map((h: string) => h.substring(1));
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const emojis = data.content.match(emojiRegex) || [];

    // Insert using the query method
    await mockDB.query(
      'INSERT INTO posts (id, userId, content, category, ageRestricted, mediaUrls, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        postId,
        data.userId,
        data.content,
        data.category,
        data.ageRestricted || false,
        data.mediaUrls || [],
        new Date(timestamp),
        new Date(timestamp)
      ]
    );

    // Return the created post
    const newPost: Post = {
      id: postId,
      userId: data.userId,
      username: data.username || "User",
      userImage: data.userImage || "/placeholder-user.jpg",
      content: data.content,
      category: data.category,
      mediaUrls: data.mediaUrls || [],
      tokens: data.content.length,
      mentions,
      hashtags,
      emojis,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      timestamp,
      isLiked: false,
      isBookmarked: false,
      isVerified: false,
      isPremium: false,
      ageRestricted: data.ageRestricted || false
    };

    return NextResponse.json(newPost);

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
