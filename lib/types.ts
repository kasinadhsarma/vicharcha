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

// Navigation preferences
export interface NavigationPreferences {
  bottomNavItems: string[];  // Array of navigation item hrefs
  sidebarItems: string[];   // Array of navigation item hrefs
  quickAccessItems: string[]; // Items shown in quick access section
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  colorTheme: string;
  language?: string;
  privacy?: {
    adultContent: boolean;
    publicProfile: boolean;
  };
  navigation: NavigationPreferences;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userImage: string;
  content: string;
  category: string;
  mediaUrls: string[];
  tokens: number;
  mentions: string[];
  hashtags: string[];
  emojis: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  timestamp: string;
  isLiked: boolean;
  isBookmarked: boolean;
  isVerified: boolean;
  isPremium: boolean;
  ageRestricted: boolean;
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

export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
