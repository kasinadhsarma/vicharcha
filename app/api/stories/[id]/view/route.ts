import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { markStoryAsViewed } from '@/lib/db/stories'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const storyId = parseInt(params.id)
    const result = await markStoryAsViewed(storyId, user.id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking story as viewed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark story as viewed' },
      { status: 500 }
    )
  }
}