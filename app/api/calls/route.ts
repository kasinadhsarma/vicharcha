import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '@/lib/cassandra';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Call types and statuses
const CallTypes = {
  AUDIO: 'audio',
  VIDEO: 'video'
} as const;

const CallStatuses = {
  RINGING: 'ringing',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  MISSED: 'missed',
  DECLINED: 'declined'
} as const;

type CallType = typeof CallTypes[keyof typeof CallTypes];
type CallStatus = typeof CallStatuses[keyof typeof CallStatuses];

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
      case 'initiate':
        return handleInitiateCall(auth.userId, data);
      case 'answer':
        return handleAnswerCall(auth.userId, data);
      case 'update-status':
        return handleUpdateCallStatus(auth.userId, data);
      case 'end':
        return handleEndCall(auth.userId, data);
      case 'update-quality':
        return handleUpdateQualityMetrics(auth.userId, data);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Call error:', error);
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
      case 'history':
        return handleGetCallHistory(auth.userId, {
          limit: parseInt(searchParams.get('limit') || '50'),
          before: searchParams.get('before') || undefined
        });
      case 'active':
        return handleGetActiveCall(auth.userId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Call error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

async function handleInitiateCall(userId: string, data: {
  participantId: string;
  callType: CallType;
}) {
  const { participantId, callType } = data;

  // Validate input
  if (!participantId || !Object.values(CallTypes).includes(callType)) {
    return NextResponse.json(
      { error: 'Invalid call parameters' },
      { status: 400 }
    );
  }

  // Check if user is already in a call
  const activeCall = await checkActiveCall(userId);
  if (activeCall) {
    return NextResponse.json(
      { error: 'User already in a call' },
      { status: 400 }
    );
  }

  // Create new call
  const callId = uuidv4();
  const startTime = new Date();

  await executeQuery(
    `INSERT INTO social_network.calls (
      id, user_id, participant_id, start_time,
      call_type, status
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      callId,
      userId,
      participantId,
      startTime,
      callType,
      CallStatuses.RINGING
    ]
  );

  return NextResponse.json({
    callId,
    startTime,
    // In a real implementation, you would generate and return:
    // - Signaling server details
    // - ICE servers configuration
    // - Call tokens/credentials
    iceServers: [
      { urls: 'stun:stun.example.com:19302' }
    ],
    signalingServer: 'wss://signaling.example.com'
  });
}

async function handleAnswerCall(userId: string, data: {
  callId: string;
}) {
  const { callId } = data;

  const result = await executeQuery(
    `SELECT * FROM social_network.calls
     WHERE id = ? AND participant_id = ?
     ALLOW FILTERING`,
    [callId, userId]
  );

  if (result.rowLength === 0) {
    return NextResponse.json(
      { error: 'Call not found' },
      { status: 404 }
    );
  }

  const call = result.rows[0];
  
  if (call.status !== CallStatuses.RINGING) {
    return NextResponse.json(
      { error: 'Call cannot be answered' },
      { status: 400 }
    );
  }

  await executeQuery(
    `UPDATE social_network.calls
     SET status = ?
     WHERE id = ?`,
    [CallStatuses.ONGOING, callId]
  );

  return NextResponse.json({
    callId,
    // Return same call configuration as initiate
    iceServers: [
      { urls: 'stun:stun.example.com:19302' }
    ],
    signalingServer: 'wss://signaling.example.com'
  });
}

async function handleUpdateCallStatus(userId: string, data: {
  callId: string;
  status: CallStatus;
}) {
  const { callId, status } = data;

  if (!Object.values(CallStatuses).includes(status)) {
    return NextResponse.json(
      { error: 'Invalid call status' },
      { status: 400 }
    );
  }

  const result = await executeQuery(
    `SELECT * FROM social_network.calls
     WHERE id = ? AND (user_id = ? OR participant_id = ?)
     ALLOW FILTERING`,
    [callId, userId, userId]
  );

  if (result.rowLength === 0) {
    return NextResponse.json(
      { error: 'Call not found' },
      { status: 404 }
    );
  }

  await executeQuery(
    `UPDATE social_network.calls
     SET status = ?
     WHERE id = ?`,
    [status, callId]
  );

  return NextResponse.json({ success: true });
}

async function handleEndCall(userId: string, data: {
  callId: string;
}) {
  const { callId } = data;

  const result = await executeQuery(
    `SELECT * FROM social_network.calls
     WHERE id = ? AND (user_id = ? OR participant_id = ?)
     ALLOW FILTERING`,
    [callId, userId, userId]
  );

  if (result.rowLength === 0) {
    return NextResponse.json(
      { error: 'Call not found' },
      { status: 404 }
    );
  }

  const endTime = new Date();
  const duration = Math.floor(
    (endTime.getTime() - result.rows[0].start_time.getTime()) / 1000
  );

  await executeQuery(
    `UPDATE social_network.calls
     SET status = ?, end_time = ?, duration = ?
     WHERE id = ?`,
    [CallStatuses.COMPLETED, endTime, duration, callId]
  );

  return NextResponse.json({
    duration,
    endTime
  });
}

async function handleUpdateQualityMetrics(userId: string, data: {
  callId: string;
  metrics: {
    videoBitrate?: number;
    audioBitrate?: number;
    videoFrameRate?: number;
    packetLoss?: number;
    latency?: number;
  };
}) {
  const { callId, metrics } = data;

  await executeQuery(
    `UPDATE social_network.calls
     SET quality_metrics = ?
     WHERE id = ?`,
    [metrics, callId]
  );

  return NextResponse.json({ success: true });
}

async function handleGetCallHistory(userId: string, params: {
  limit: number;
  before?: string;
}) {
  const { limit, before } = params;

  let query = `
    SELECT id, participant_id, start_time, end_time,
           duration, call_type, status, quality_metrics
    FROM social_network.calls
    WHERE user_id = ?
  `;
  const queryParams: any[] = [userId];

  if (before) {
    query += ' AND start_time < ?';
    queryParams.push(before);
  }

  query += ' ORDER BY start_time DESC LIMIT ?';
  queryParams.push(limit);

  const result = await executeQuery(query, queryParams);

  return NextResponse.json({
    calls: result.rows,
    hasMore: result.rowLength === limit
  });
}

async function handleGetActiveCall(userId: string) {
  const result = await executeQuery(
    `SELECT *
     FROM social_network.calls
     WHERE (user_id = ? OR participant_id = ?)
     AND status = ?
     ALLOW FILTERING`,
    [userId, userId, CallStatuses.ONGOING]
  );

  if (result.rowLength === 0) {
    return NextResponse.json({ activeCall: null });
  }

  return NextResponse.json({ activeCall: result.rows[0] });
}

async function checkActiveCall(userId: string): Promise<boolean> {
  const result = await executeQuery(
    `SELECT COUNT(*) as count
     FROM social_network.calls
     WHERE (user_id = ? OR participant_id = ?)
     AND status IN (?, ?)
     ALLOW FILTERING`,
    [userId, userId, CallStatuses.RINGING, CallStatuses.ONGOING]
  );

  return result.rows[0].count > 0;
}
