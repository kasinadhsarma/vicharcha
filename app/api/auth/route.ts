import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { sign, verify } from 'jsonwebtoken';
import { executeQuery } from '@/lib/cassandra';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

// Helper functions
async function generateToken(userId: string): Promise<string> {
  return sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

async function verifyToken(token: string): Promise<any> {
  try {
    return verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function createUser(data: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}) {
  const userId = uuidv4();
  const hashedPassword = await hash(data.password, SALT_ROUNDS);

  const query = `
    INSERT INTO social_network.users (
      id, username, email, password_hash, full_name, phone_number,
      created_at, last_active, is_verified
    ) VALUES (?, ?, ?, ?, ?, ?, toTimestamp(now()), toTimestamp(now()), false)
  `;

  await executeQuery(query, [
    userId,
    data.username,
    data.email,
    hashedPassword,
    data.fullName,
    data.phoneNumber || null
  ]);

  return userId;
}

export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json();

    switch (action) {
      case 'signup':
        return handleSignup(data);
      case 'login':
        return handleLogin(data);
      case 'digilocker-auth':
        return handleDigiLockerAuth(data);
      case 'verify-token':
        return handleVerifyToken(req);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSignup(data: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}) {
  // Validate input
  if (!data.username || !data.email || !data.password || !data.fullName) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Check if username or email exists
  const existingUser = await executeQuery(
    'SELECT username, email FROM social_network.users WHERE username = ? OR email = ? ALLOW FILTERING',
    [data.username, data.email]
  );

  if (existingUser.rowLength > 0) {
    return NextResponse.json(
      { error: 'Username or email already exists' },
      { status: 409 }
    );
  }

  // Create user
  const userId = await createUser(data);
  const token = await generateToken(userId);

  // Set cookie
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });

  return NextResponse.json({ success: true });
}

async function handleLogin(data: { username: string; password: string }) {
  // Validate input
  if (!data.username || !data.password) {
    return NextResponse.json(
      { error: 'Missing credentials' },
      { status: 400 }
    );
  }

  // Get user
  const result = await executeQuery(
    'SELECT id, password_hash FROM social_network.users WHERE username = ? ALLOW FILTERING',
    [data.username]
  );

  if (result.rowLength === 0) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const user = result.rows[0];
  const passwordValid = await compare(data.password, user.password_hash);

  if (!passwordValid) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // Generate token
  const token = await generateToken(user.id);

  // Set cookie
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });

  // Update last active
  await executeQuery(
    'UPDATE social_network.users SET last_active = toTimestamp(now()) WHERE id = ?',
    [user.id]
  );

  return NextResponse.json({ success: true });
}

async function handleDigiLockerAuth(data: {
  userId: string;
  digilockerCode: string;
}) {
  // Validate input
  if (!data.userId || !data.digilockerCode) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    // Exchange code for tokens (implementation depends on DigiLocker API)
    const tokens = await exchangeDigiLockerCode(data.digilockerCode);

    // Save DigiLocker auth info
    await executeQuery(
      `INSERT INTO social_network.digilocker_auth (
        user_id, digilocker_id, access_token, refresh_token,
        token_expiry, last_sync
      ) VALUES (?, ?, ?, ?, ?, toTimestamp(now()))`,
      [
        data.userId,
        tokens.digilockerId,
        tokens.accessToken,
        tokens.refreshToken,
        tokens.expiryTimestamp
      ]
    );

    // Update user verification status
    await executeQuery(
      'UPDATE social_network.users SET is_verified = true WHERE id = ?',
      [data.userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DigiLocker auth error:', error);
    return NextResponse.json(
      { error: 'DigiLocker authentication failed' },
      { status: 401 }
    );
  }
}

async function handleVerifyToken(req: NextRequest) {
  const token = cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  // Get user data
  const result = await executeQuery(
    'SELECT id, username, email, full_name, is_verified FROM social_network.users WHERE id = ?',
    [payload.userId]
  );

  if (result.rowLength === 0) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ user: result.rows[0] });
}

// Mock function - Replace with actual DigiLocker API integration
async function exchangeDigiLockerCode(code: string) {
  // TODO: Implement actual DigiLocker API integration
  return {
    digilockerId: 'mock-id',
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiryTimestamp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };
}
