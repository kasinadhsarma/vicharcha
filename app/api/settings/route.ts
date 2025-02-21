import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/cassandra';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { compare, hash } from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
      case 'update-profile':
        return handleUpdateProfile(auth.userId, data);
      case 'update-settings':
        return handleUpdateSettings(auth.userId, data);
      case 'update-password':
        return handleUpdatePassword(auth.userId, data);
      case 'disconnect-digilocker':
        return handleDisconnectDigiLocker(auth.userId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Settings error:', error);
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
      case 'profile':
        return handleGetProfile(auth.userId);
      case 'settings':
        return handleGetSettings(auth.userId);
      case 'digilocker-status':
        return handleGetDigiLockerStatus(auth.userId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

async function handleUpdateProfile(userId: string, data: {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
}) {
  const { fullName, bio, avatarUrl, phoneNumber } = data;

  // Build update query dynamically based on provided fields
  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (fullName) {
    updateFields.push('full_name = ?');
    updateValues.push(fullName);
  }
  if (bio !== undefined) {
    updateFields.push('bio = ?');
    updateValues.push(bio);
  }
  if (avatarUrl) {
    updateFields.push('avatar_url = ?');
    updateValues.push(avatarUrl);
  }
  if (phoneNumber) {
    updateFields.push('phone_number = ?');
    updateValues.push(phoneNumber);
  }

  if (updateFields.length === 0) {
    return NextResponse.json(
      { error: 'No fields to update' },
      { status: 400 }
    );
  }

  // Add last parameter (userId) to values array
  updateValues.push(userId);

  await executeQuery(
    `UPDATE social_network.users SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  return NextResponse.json({ success: true });
}

async function handleUpdateSettings(userId: string, data: {
  settings: Record<string, string>;
}) {
  const { settings } = data;

  if (!settings || Object.keys(settings).length === 0) {
    return NextResponse.json(
      { error: 'No settings provided' },
      { status: 400 }
    );
  }

  await executeQuery(
    'UPDATE social_network.users SET settings = ? WHERE id = ?',
    [settings, userId]
  );

  return NextResponse.json({ success: true });
}

async function handleUpdatePassword(userId: string, data: {
  currentPassword: string;
  newPassword: string;
}) {
  const { currentPassword, newPassword } = data;

  // Validate input
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Get current password hash
  const result = await executeQuery(
    'SELECT password_hash FROM social_network.users WHERE id = ?',
    [userId]
  );

  if (result.rowLength === 0) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  // Verify current password
  const currentPasswordValid = await compare(
    currentPassword,
    result.rows[0].password_hash
  );

  if (!currentPasswordValid) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 401 }
    );
  }

  // Hash and update new password
  const newPasswordHash = await hash(newPassword, 10);
  await executeQuery(
    'UPDATE social_network.users SET password_hash = ? WHERE id = ?',
    [newPasswordHash, userId]
  );

  return NextResponse.json({ success: true });
}

async function handleDisconnectDigiLocker(userId: string) {
  // Delete DigiLocker auth info
  await executeQuery(
    'DELETE FROM social_network.digilocker_auth WHERE user_id = ?',
    [userId]
  );

  // Update user verification status
  await executeQuery(
    'UPDATE social_network.users SET is_verified = false WHERE id = ?',
    [userId]
  );

  return NextResponse.json({ success: true });
}

async function handleGetProfile(userId: string) {
  const result = await executeQuery(
    `SELECT id, username, email, full_name, bio,
            avatar_url, phone_number, is_verified,
            created_at, last_active
     FROM social_network.users
     WHERE id = ?`,
    [userId]
  );

  if (result.rowLength === 0) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    profile: result.rows[0]
  });
}

async function handleGetSettings(userId: string) {
  const result = await executeQuery(
    'SELECT settings FROM social_network.users WHERE id = ?',
    [userId]
  );

  if (result.rowLength === 0) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    settings: result.rows[0].settings || {}
  });
}

async function handleGetDigiLockerStatus(userId: string) {
  const result = await executeQuery(
    `SELECT access_token, token_expiry, authorized_documents, last_sync
     FROM social_network.digilocker_auth
     WHERE user_id = ?`,
    [userId]
  );

  if (result.rowLength === 0) {
    return NextResponse.json({
      connected: false
    });
  }

  const auth = result.rows[0];
  const isExpired = new Date(auth.token_expiry) <= new Date();

  return NextResponse.json({
    connected: true,
    isExpired,
    authorizedDocuments: auth.authorized_documents,
    lastSync: auth.last_sync
  });
}
