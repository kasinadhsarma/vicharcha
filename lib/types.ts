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
  isAdultContentEnabled?: boolean;
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
  username: string;
  userImage: string;
  isPremium: boolean;
  isViewed: boolean;
  mediaUrl: string;
  downloadable: boolean;
  userStatus?: 'online' | 'offline';
  profileUrl?: string;
  reactions?: {
    count: number;
    type: string;
  }[];
  duration?: number; // Duration of the story in seconds
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface DatabaseResult<T = unknown, R = T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  rows?: R[];
}

// Common database response types
export interface DigiLockerVerifyResponse {
  userId: string;
  documentId: string;
  verified: boolean;
  timestamp: string;
}

// User-related types
export interface DBUser extends User {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  digilocker_verified: boolean;
  role: 'user' | 'admin';
  settings?: UserSettings;
}

export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

// Message and Chat types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  createdAt: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface ParticipantDetails {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: string;
  isPremium: boolean;
}

export interface IndividualChat {
  id: string;
  name: string;
  avatar: string;
  participants: string[];
  participantDetails: ParticipantDetails[];
  status: 'online' | 'offline';
  isTyping: boolean;
  isGroup: boolean;
  lastMessage: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatWithDetails = IndividualChat;

// Type guard to check if a chat is a group chat
export function isGroupChat(chat: ChatWithDetails | IndividualChat): boolean {
  return chat.isGroup;
}

// Re-export DigiLocker types
export type { DigiLockerDocument, DigiLockerAuth } from './digilocker-service';
