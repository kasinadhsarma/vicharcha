import { cassandra } from '@/lib/cassandra';
import { Story, DatabaseResult } from '../types';

export async function createStory(story: Omit<Story, 'id'>): Promise<DatabaseResult<Story>> {
  try {
    const id = Date.now();
    const newStory = { ...story, id };
    
    const query = `
      INSERT INTO stories (
        id, userid, username, userimage, mediaurl, type, duration, 
        isviewed, ispremium, expiresat, createdat, downloadable, 
        isadult, category, items
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      story.userId,
      story.username,
      story.userImage,
      story.mediaUrl,
      story.type,
      story.duration,
      false,
      story.isPremium,
      story.expiresAt,
      story.createdAt,
      story.downloadable,
      story.isAdult,
      story.category,
      JSON.stringify(story.items)
    ];

    await cassandra.execute(query, params, { prepare: true });

    return {
      success: true,
      data: newStory
    };
  } catch (error) {
    console.error('Failed to create story:', error);
    return {
      success: false,
      error: 'Failed to create story'
    };
  }
}

export async function getStories(userId?: string): Promise<DatabaseResult<Story[]>> {
  try {
    const query = userId 
      ? 'SELECT * FROM stories WHERE userid = ?'
      : 'SELECT * FROM stories';
    
    const params = userId ? [userId] : [];
    const result = await cassandra.execute(query, params, { prepare: true });

    const stories = result.rows.map(row => ({
      id: row.id,
      userId: row.userid,
      username: row.username,
      userImage: row.userimage,
      mediaUrl: row.mediaurl,
      type: row.type,
      duration: row.duration,
      isViewed: row.isviewed,
      isPremium: row.ispremium,
      expiresAt: new Date(row.expiresat),
      createdAt: new Date(row.createdat),
      downloadable: row.downloadable,
      isAdult: row.isadult,
      category: row.category,
      items: JSON.parse(row.items || '[]')
    }));

    return {
      success: true,
      data: stories
    };
  } catch (error) {
    console.error('Failed to get stories:', error);
    return {
      success: false,
      error: 'Failed to get stories'
    };
  }
}

export async function deleteStory(storyId: number): Promise<DatabaseResult> {
  try {
    const query = 'DELETE FROM stories WHERE id = ?';
    await cassandra.execute(query, [storyId], { prepare: true });

    return {
      success: true
    };
  } catch (error) {
    console.error('Failed to delete story:', error);
    return {
      success: false,
      error: 'Failed to delete story'
    };
  }
}

export async function markStoryAsViewed(storyId: number, userId: string): Promise<DatabaseResult> {
  try {
    const query = 'UPDATE stories SET isviewed = true WHERE id = ? AND userid = ?';
    await cassandra.execute(query, [storyId, userId], { prepare: true });

    return {
      success: true
    };
  } catch (error) {
    console.error('Failed to mark story as viewed:', error);
    return {
      success: false,
      error: 'Failed to mark story as viewed'
    };
  }
}

export async function cleanupExpiredStories(): Promise<DatabaseResult> {
  try {
    const query = 'DELETE FROM stories WHERE expiresat < ?';
    const result = await cassandra.execute(query, [new Date()], { prepare: true });

    return {
      success: true,
      data: {
        deletedCount: result.rowLength || 0
      }
    };
  } catch (error) {
    console.error('Failed to clean up expired stories:', error);
    return {
      success: false,
      error: 'Failed to clean up stories'
    };
  }
}
