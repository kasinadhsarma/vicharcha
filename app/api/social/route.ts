import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeBatch, PostCategory, PostCategories } from '@/lib/cassandra';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Connection types
const ConnectionTypes = {
  FOLLOWING: 'following',
  BLOCKED: 'blocked',
  CLOSE_FRIEND: 'close_friend'
} as const;

// Activity types
const ActivityTypes = {
  POST: 'post',
  REEL: 'reel',
  COMMENT: 'comment',
  LIKE: 'like',
  SHARE: 'share'
} as const;

type ConnectionType = typeof ConnectionTypes[keyof typeof ConnectionTypes];
type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes];

// Middleware to verify auth token
async function verifyAuth(req: NextRequest) {
  const token = cookies().get('token')?.value;
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const payload = await verify(token, JWT_SECRET);
    return payload as { userId: string };
  } catch {
    throw new Error('Invalid token');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const { action, ...data } = await req.json();

    switch (action) {
      case 'create-post':
        return handleCreatePost(auth.userId, data);
      case 'create-reel':
        return handleCreateReel(auth.userId, data);
      case 'update-connection':
        return handleUpdateConnection(auth.userId, data);
      case 'react':
        return handleReaction(auth.userId, data);
      case 'comment':
        return handleComment(auth.userId, data);
      case 'share':
        return handleShare(auth.userId, data);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Social error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'feed':
        return handleGetFeed(auth.userId, {
          limit: parseInt(searchParams.get('limit') || '20'),
          before: searchParams.get('before') || undefined,
          category: searchParams.get('category') as PostCategory || undefined
        });
      case 'reels':
        return handleGetReels(auth.userId, {
          limit: parseInt(searchParams.get('limit') || '20'),
          before: searchParams.get('before') || undefined
        });
      case 'connections':
        return handleGetConnections(auth.userId, {
          type: searchParams.get('type') as ConnectionType || undefined
        });
      case 'activities':
        return handleGetActivities(auth.userId, {
          limit: parseInt(searchParams.get('limit') || '50'),
          before: searchParams.get('before') || undefined
        });
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Social error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

async function handleCreatePost(userId: string, data: {
  content: string;
  category?: PostCategory;
  mediaUrls?: string[];
  ageRestricted?: boolean;
}) {
  const { content, category, mediaUrls, ageRestricted } = data;

  // Validate input
  if (!content) {
    return NextResponse.json(
      { error: 'Content is required' },
      { status: 400 }
    );
  }

  // Create post
  const postId = uuidv4();
  const timestamp = new Date();

  const queries = [
    {
      query: `
        INSERT INTO social_network.posts (
          id, user_id, content, category,
          age_restricted, media_urls,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        postId,
        userId,
        content,
        category || PostCategories.GENERAL,
        ageRestricted || false,
        mediaUrls || [],
        timestamp,
        timestamp
      ]
    },
    {
      query: `
        INSERT INTO social_network.activities (
          user_id, activity_id, activity_type,
          target_id, created_at, content,
          media_urls
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        userId,
        uuidv4(),
        ActivityTypes.POST,
        postId,
        timestamp,
        content,
        mediaUrls || []
      ]
    }
  ];

  await executeBatch(queries);

  return NextResponse.json({
    postId,
    timestamp
  });
}

async function handleCreateReel(userId: string, data: {
  videoUrl: string;
  thumbnailUrl: string;
  caption?: string;
  musicInfo?: string;
  tags?: string[];
  isPremium?: boolean;
  ageRestricted?: boolean;
  duration: number;
}) {
  const {
    videoUrl,
    thumbnailUrl,
    caption,
    musicInfo,
    tags,
    isPremium,
    ageRestricted,
    duration
  } = data;

  // Validate input
  if (!videoUrl || !thumbnailUrl || !duration) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Create reel
  const reelId = uuidv4();
  const timestamp = new Date();

  const queries = [
    {
      query: `
        INSERT INTO social_network.reels (
          id, user_id, video_url, thumbnail_url,
          caption, duration, music_info, tags,
          created_at, is_premium, age_restricted,
          views, likes, shares, comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        reelId,
        userId,
        videoUrl,
        thumbnailUrl,
        caption || '',
        duration,
        musicInfo || null,
        tags || [],
        timestamp,
        isPremium || false,
        ageRestricted || false,
        0, // views
        0, // likes
        0, // shares
        0  // comments
      ]
    },
    {
      query: `
        INSERT INTO social_network.activities (
          user_id, activity_id, activity_type,
          target_id, created_at, content,
          media_urls
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        userId,
        uuidv4(),
        ActivityTypes.REEL,
        reelId,
        timestamp,
        caption || '',
        [videoUrl]
      ]
    }
  ];

  await executeBatch(queries);

  return NextResponse.json({
    reelId,
    timestamp
  });
}

async function handleUpdateConnection(userId: string, data: {
  targetUserId: string;
  connectionType: ConnectionType;
  remove?: boolean;
}) {
  const { targetUserId, connectionType, remove } = data;

  if (!targetUserId || !Object.values(ConnectionTypes).includes(connectionType)) {
    return NextResponse.json(
      { error: 'Invalid connection parameters' },
      { status: 400 }
    );
  }

  if (remove) {
    await executeQuery(
      'DELETE FROM social_network.connections WHERE user_id = ? AND connected_user_id = ?',
      [userId, targetUserId]
    );
  } else {
    await executeQuery(
      `INSERT INTO social_network.connections (
        user_id, connected_user_id, connection_type,
        created_at, updated_at
      ) VALUES (?, ?, ?, toTimestamp(now()), toTimestamp(now()))`,
      [userId, targetUserId, connectionType]
    );
  }

  return NextResponse.json({ success: true });
}

async function handleReaction(userId: string, data: {
  contentId: string;
  reactionType: string;
  remove?: boolean;
}) {
  const { contentId, reactionType, remove } = data;

  if (remove) {
    await executeQuery(
      'DELETE FROM social_network.reactions WHERE content_id = ? AND user_id = ?',
      [contentId, userId]
    );
  } else {
    await executeQuery(
      `INSERT INTO social_network.reactions (
        content_id, user_id, reaction_type, created_at
      ) VALUES (?, ?, ?, toTimestamp(now()))`,
      [contentId, userId, reactionType]
    );

    // Record activity
    await executeQuery(
      `INSERT INTO social_network.activities (
        user_id, activity_id, activity_type,
        target_id, created_at
      ) VALUES (?, ?, ?, ?, toTimestamp(now()))`,
      [userId, uuidv4(), ActivityTypes.LIKE, contentId]
    );
  }

  return NextResponse.json({ success: true });
}

async function handleComment(userId: string, data: {
  contentId: string;
  comment: string;
  mediaUrls?: string[];
}) {
  const { contentId, comment, mediaUrls } = data;

  const activityId = uuidv4();
  const timestamp = new Date();

  await executeQuery(
    `INSERT INTO social_network.activities (
      user_id, activity_id, activity_type,
      target_id, created_at, content,
      media_urls
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      activityId,
      ActivityTypes.COMMENT,
      contentId,
      timestamp,
      comment,
      mediaUrls || []
    ]
  );

  return NextResponse.json({
    commentId: activityId,
    timestamp
  });
}

async function handleShare(userId: string, data: {
  contentId: string;
  shareType: 'post' | 'reel';
  comment?: string;
}) {
  const { contentId, shareType, comment } = data;

  const activityId = uuidv4();
  const timestamp = new Date();

  await executeQuery(
    `INSERT INTO social_network.activities (
      user_id, activity_id, activity_type,
      target_id, created_at, content
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      activityId,
      ActivityTypes.SHARE,
      contentId,
      timestamp,
      comment || ''
    ]
  );

  // Update share count
  if (shareType === 'post') {
    await executeQuery(
      'UPDATE social_network.posts SET shares = shares + 1 WHERE id = ?',
      [contentId]
    );
  } else {
    await executeQuery(
      'UPDATE social_network.reels SET shares = shares + 1 WHERE id = ?',
      [contentId]
    );
  }

  return NextResponse.json({
    shareId: activityId,
    timestamp
  });
}

async function handleGetFeed(userId: string, params: {
  limit: number;
  before?: string;
  category?: PostCategory;
}) {
  const { limit, before, category } = params;

  // Get user's connections
  const connections = await executeQuery(
    'SELECT connected_user_id FROM social_network.connections WHERE user_id = ?',
    [userId]
  );

  const followedUsers = [userId, ...connections.rows.map(row => row.connected_user_id)];

  let query = `
    SELECT *
    FROM social_network.posts
    WHERE user_id IN ?
  `;
  const queryParams: any[] = [followedUsers];

  if (category) {
    query += ' AND category = ?';
    queryParams.push(category);
  }

  if (before) {
    query += ' AND created_at < ?';
    queryParams.push(before);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  queryParams.push(limit);

  const result = await executeQuery(query, queryParams);

  return NextResponse.json({
    posts: result.rows,
    hasMore: result.rowLength === limit
  });
}

async function handleGetReels(userId: string, params: {
  limit: number;
  before?: string;
}) {
  const { limit, before } = params;

  let query = `
    SELECT *
    FROM social_network.reels
    WHERE age_restricted = false
  `;
  const queryParams: any[] = [];

  if (before) {
    query += ' AND created_at < ?';
    queryParams.push(before);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  queryParams.push(limit);

  const result = await executeQuery(query, queryParams);

  return NextResponse.json({
    reels: result.rows,
    hasMore: result.rowLength === limit
  });
}

async function handleGetConnections(userId: string, params: {
  type?: ConnectionType;
}) {
  const { type } = params;

  let query = `
    SELECT connected_user_id, connection_type, created_at
    FROM social_network.connections
    WHERE user_id = ?
  `;
  const queryParams: any[] = [userId];

  if (type) {
    query += ' AND connection_type = ?';
    queryParams.push(type);
  }

  const result = await executeQuery(query, queryParams);

  return NextResponse.json({
    connections: result.rows
  });
}

async function handleGetActivities(userId: string, params: {
  limit: number;
  before?: string;
}) {
  const { limit, before } = params;

  let query = `
    SELECT *
    FROM social_network.activities
    WHERE user_id = ?
  `;
  const queryParams: any[] = [userId];

  if (before) {
    query += ' AND created_at < ?';
    queryParams.push(before);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  queryParams.push(limit);

  const result = await executeQuery(query, queryParams);

  return NextResponse.json({
    activities: result.rows,
    hasMore: result.rowLength === limit
  });
}
