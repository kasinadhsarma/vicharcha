export enum PostCategories {
  GENERAL = "general",
  NEWS = "news",
  ENTERTAINMENT = "entertainment",
  SPORTS = "sports",
  TECHNOLOGY = "technology",
  POLITICS = "politics",
  ADULT = "adult"
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  avatar?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags?: string[];
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  filename: string;
  size: number;
}

export interface Story {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  createdAt: string;
  expiresAt: string;
  type: 'text' | 'image' | 'video';
  media?: {
    url: string;
    type: 'image' | 'video';
  };
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  type: 'like' | 'heart' | 'laugh' | 'wow' | 'sad' | 'angry';
  userId: string;
  postId: string;
  createdAt: string;
}

// Button variant type
export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
