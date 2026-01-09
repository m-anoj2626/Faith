
export type UserRole = 'worshiper' | 'leader';
export type Faith = 'Christianity' | 'Islam' | 'Judaism' | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faith: Faith;
  bio?: string;
  profilePhoto: string;
  followers: string[]; // IDs
  following: string[]; // IDs
  savedPosts: string[]; // Post IDs
  onlineStatus: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  type: 'post' | 'reel';
  content: string;
  media: string;
  likes: string[]; // User IDs
  saves: string[]; // User IDs
  comments: Comment[];
  shares: number;
  views: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'follow' | 'like' | 'comment' | 'message';
  fromId: string;
  fromName: string;
  postId?: string;
  read: boolean;
  createdAt: string;
}
