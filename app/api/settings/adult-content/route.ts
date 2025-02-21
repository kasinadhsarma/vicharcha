import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, showAdultContent } = await request.json();

    // TODO: Implement actual database update
    // For now, we'll mock the update
    console.log(`Setting adult content preference for user ${userId} to ${showAdultContent}`);

    return NextResponse.json({ 
      success: true,
      message: 'Adult content preferences updated successfully'
    });

  } catch (error) {
    console.error('Error updating adult content preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual database fetch
    // For now, we'll mock the response
    return NextResponse.json({ 
      showAdultContent: false
    });

  } catch (error) {
    console.error('Error fetching adult content preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}
