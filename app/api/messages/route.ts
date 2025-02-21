import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '@/lib/cassandra';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Message types
const MessageTypes = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
  STICKER: 'sticker',
  CAMERA: 'camera'
} as const;

type MessageType = typeof MessageTypes[keyof typeof MessageTypes];

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
      case 'send':
        return handleSendMessage(auth.userId, data);
      case 'create-chat':
        return handleCreateChat(auth.userId, data);
      case 'upload-media':
        return handleUploadMedia(auth.userId, data);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Message error:', error);
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
      case 'list-chats':
        return handleListChats(auth.userId);
      case 'get-messages':
        return handleGetMessages(auth.userId, {
          chatId: searchParams.get('chatId') || '',
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
    console.error('Message error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

async function handleSendMessage(userId: string, data: {
  chatId: string;
  content: string;
  messageType: MessageType;
  mediaUrls?: string[];
  stickerId?: string;
  documentInfo?: Record<string, string>;
}) {
  const { chatId, content, messageType, mediaUrls, stickerId, documentInfo } = data;

  // Validate input
  if (!chatId || !messageType || (messageType === MessageTypes.TEXT && !content)) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Create message
  const messageId = uuidv4();
  const timestamp = new Date();

  await executeQuery(
    `INSERT INTO social_network.messages (
      chat_id, message_id, sender_id, content, message_type,
      media_urls, sticker_id, document_info, sent_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      chatId,
      messageId,
      userId,
      content || '',
      messageType,
      mediaUrls || [],
      stickerId || null,
      documentInfo || null,
      timestamp
    ]
  );

  return NextResponse.json({
    messageId,
    timestamp
  });
}

async function handleCreateChat(userId: string, data: {
  recipientId?: string;
  groupName?: string;
  members?: string[];
}) {
  const chatId = uuidv4();
  const timestamp = new Date();

  if (data.recipientId) {
    // Direct chat
    await executeQuery(
      `INSERT INTO social_network.messages (
        chat_id, message_id, sender_id, recipient_id,
        message_type, content, sent_at
      ) VALUES (?, ?, ?, ?, 'system', ?, ?)`,
      [
        chatId,
        uuidv4(),
        userId,
        data.recipientId,
        'Chat created',
        timestamp
      ]
    );
  } else if (data.groupName && data.members) {
    // Group chat
    await executeQuery(
      `INSERT INTO social_network.group_chats (
        chat_id, name, creator_id, created_at,
        members, admins
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        chatId,
        data.groupName,
        userId,
        timestamp,
        [userId, ...data.members],
        [userId]
      ]
    );
  } else {
    return NextResponse.json(
      { error: 'Invalid chat creation parameters' },
      { status: 400 }
    );
  }

  return NextResponse.json({ chatId });
}

async function handleUploadMedia(userId: string, data: {
  file: {
    name: string;
    type: string;
    size: number;
    buffer: Buffer;
  };
  mediaType: 'image' | 'video' | 'document';
  metadata?: Record<string, any>;
}) {
  // In a real implementation, you would:
  // 1. Upload the file to a storage service (e.g. S3)
  // 2. Generate thumbnails for images/videos
  // 3. Process documents for preview
  // 4. Store media metadata

  const mediaId = uuidv4();
  const timestamp = new Date();

  // Mock URL - replace with actual upload logic
  const url = `https://storage.example.com/${mediaId}/${data.file.name}`;
  
  await executeQuery(
    `INSERT INTO social_network.media_attachments (
      id, user_id, media_type, url, mime_type,
      file_size, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      mediaId,
      userId,
      data.mediaType,
      url,
      data.file.type,
      data.file.size,
      data.metadata || {},
      timestamp
    ]
  );

  return NextResponse.json({
    mediaId,
    url,
    timestamp
  });
}

async function handleListChats(userId: string) {
  // Get direct chats
  const directChats = await executeQuery(
    `SELECT DISTINCT chat_id, recipient_id, MAX(sent_at) as last_message
     FROM social_network.messages
     WHERE sender_id = ? OR recipient_id = ?
     GROUP BY chat_id, recipient_id
     ALLOW FILTERING`,
    [userId, userId]
  );

  // Get group chats
  const groupChats = await executeQuery(
    `SELECT chat_id, name, created_at
     FROM social_network.group_chats
     WHERE members CONTAINS ?
     ALLOW FILTERING`,
    [userId]
  );

  return NextResponse.json({
    directChats: directChats.rows,
    groupChats: groupChats.rows
  });
}

async function handleGetMessages(userId: string, params: {
  chatId: string;
  limit: number;
  before?: string;
}) {
  const { chatId, limit, before } = params;

  let query = `
    SELECT message_id, sender_id, content, message_type,
           media_urls, sticker_id, document_info, sent_at,
           delivered_at, read_at, is_edited, reactions
    FROM social_network.messages
    WHERE chat_id = ?
  `;
  const queryParams: any[] = [chatId];

  if (before) {
    query += ' AND sent_at < ?';
    queryParams.push(before);
  }

  query += ' ORDER BY sent_at DESC LIMIT ?';
  queryParams.push(limit);

  const result = await executeQuery(query, queryParams);

  return NextResponse.json({
    messages: result.rows,
    hasMore: result.rowLength === limit
  });
}
