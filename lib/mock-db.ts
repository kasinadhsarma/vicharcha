import { types } from 'cassandra-driver';

export interface MockPost {
  id: string;
  userId: string;
  content: string;
  category: string;
  mediaUrls: string[];
  ageRestricted: boolean;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  likedBy: string[];
}

class MockDatabase {
  private posts: MockPost[] = [];

  async query(queryStr: string, params: any[] = []): Promise<{ rows: MockPost[] }> {
    // Basic mock implementation for posts
    if (queryStr.includes('SELECT')) {
      let filteredPosts = [...this.posts];
      
      // Handle category filter
      if (params.length > 0 && queryStr.includes('category')) {
        const category = params[0];
        filteredPosts = filteredPosts.filter(post => post.category === category);
      }

      // Sort by createdAt DESC
      filteredPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return { rows: filteredPosts };
    } else if (queryStr.includes('INSERT')) {
      const [id, userId, content, category, ageRestricted, mediaUrls, createdAt, updatedAt] = params;
      
      const newPost: MockPost = {
        id,
        userId,
        content,
        category,
        mediaUrls,
        ageRestricted,
        createdAt,
        updatedAt,
        likes: 0,
        likedBy: []
      };
      
      this.posts.push(newPost);
      return { rows: [newPost] };
    } else if (queryStr.includes('UPDATE') && queryStr.includes('likes')) {
      const [postId, action, userId] = params;
      const post = this.posts.find(p => p.id === postId);
      
      if (post) {
        if (action === 'like' && !post.likedBy.includes(userId)) {
          post.likes++;
          post.likedBy.push(userId);
        } else if (action === 'unlike' && post.likedBy.includes(userId)) {
          post.likes = Math.max(0, post.likes - 1);
          post.likedBy = post.likedBy.filter(id => id !== userId);
        }
        return { rows: [post] };
      }
    }
    
    return { rows: [] };
  }
}

export const mockDB = new MockDatabase();
