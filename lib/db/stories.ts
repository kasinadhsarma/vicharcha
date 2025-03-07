import { cassandra } from '@/lib/cassandra'
import { Story, DatabaseResult } from '@/lib/types'

export async function createStory(story: Omit<Story, 'id'>): Promise<DatabaseResult<Story>> {
  try {
    const query = `
      INSERT INTO stories (
        userid, username, userimage, mediaurl, type, duration, isviewed,
        ispremium, expiresat, createdat, downloadable, isadult, category
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      USING TTL 86400
    `

    const params = [
      story.userId,
      story.username,
      story.userImage,
      story.mediaUrl,
      story.type,
      story.duration,
      false, // isViewed defaults to false
      story.isPremium,
      story.expiresAt,
      story.createdAt,
      story.downloadable,
      story.isAdult,
      story.category
    ]

    await cassandra.execute(query, params, { prepare: true })

    return {
      success: true,
      data: {
        ...story,
        id: Date.now(), // Use timestamp as ID
        isViewed: false,
        items: []
      }
    }
  } catch (error) {
    console.error('Error creating story:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getStories(userId?: string): Promise<DatabaseResult<Story[]>> {
  try {
    const query = userId 
      ? 'SELECT * FROM stories WHERE userid = ?'
      : 'SELECT * FROM stories'
    
    const params = userId ? [userId] : undefined
    const result = await cassandra.execute(query, params, { prepare: true })

    const stories = result.rows.map(row => ({
      id: Number(row.id),
      userId: row.userid,
      username: row.username,
      userImage: row.userimage,
      mediaUrl: row.mediaurl,
      type: row.type as 'video' | 'image',
      duration: row.duration,
      isViewed: row.isviewed || false,
      isPremium: row.ispremium || false,
      expiresAt: new Date(row.expiresat),
      createdAt: new Date(row.createdat),
      downloadable: row.downloadable || false,
      isAdult: row.isadult || false,
      category: row.category || 'general',
      items: []
    }))

    return {
      success: true,
      data: stories
    }
  } catch (error) {
    console.error('Error getting stories:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function markStoryAsViewed(storyId: number, userId: string): Promise<DatabaseResult<void>> {
  try {
    const query = `
      UPDATE stories 
      SET isviewed = true 
      WHERE id = ? AND userid = ?
    `
    
    await cassandra.execute(query, [storyId, userId], { prepare: true })

    return { success: true }
  } catch (error) {
    console.error('Error marking story as viewed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function deleteStory(storyId: number): Promise<DatabaseResult<void>> {
  try {
    const query = 'DELETE FROM stories WHERE id = ?'
    await cassandra.execute(query, [storyId], { prepare: true })

    return { success: true }
  } catch (error) {
    console.error('Error deleting story:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to check if a story exists
export async function storyExists(storyId: number): Promise<boolean> {
  try {
    const query = 'SELECT id FROM stories WHERE id = ?'
    const result = await cassandra.execute(query, [storyId], { prepare: true })
    return result.rows.length > 0
  } catch (error) {
    console.error('Error checking story existence:', error)
    return false
  }
}