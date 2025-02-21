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
}

class MockDatabase {
  private posts: MockPost[] = [];

  async query(queryStr: string, params: any[] = []): Promise<{ rows: MockPost[] }> {
    // Basic mock implementation for posts
    if (queryStr.includes('SELECT')) {
      let filteredPosts = [...this.posts];
      
      // Handle category filter
      if (params.length > 0) {
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
        updatedAt
      };
      
      this.posts.push(newPost);
      return { rows: [newPost] };
    }
    
    return { rows: [] };
  }
}

export const mockDB = new MockDatabase();
